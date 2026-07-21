import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PublicExploreService } from '../../../explore/services/public-explore.service';
import type { PublicArtwork } from '../../../explore/models/public-artwork.model';
import {
  JIGSAW_TAB,
  PUZZLE_COLS,
  PUZZLE_ROWS,
  buildPuzzleLayout,
  shuffleSeeded,
  type PuzzlePieceDef,
} from '../../utils/jigsaw-geometry';

interface TrayPiece extends PuzzlePieceDef {
  placed: boolean;
}

interface ActiveDrag {
  pieceId: string;
  pointerId: number;
  grabOffsetX: number;
  grabOffsetY: number;
  fromTray: boolean;
}

/**
 * Page puzzle plein écran : plateau + rail de pièces, snap jigsaw.
 * Le suivi pointermove est hors zone Angular (DOM + rAF) pour limiter le jank tactile.
 */
@Component({
  selector: 'app-puzzle-page',
  imports: [NgStyle],
  templateUrl: './puzzle-page.html',
  styleUrl: './puzzle-page.scss',
})
export class PuzzlePage implements OnInit, OnDestroy {
  private readonly explore = inject(PublicExploreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  private readonly boardSurface = viewChild<ElementRef<HTMLElement>>('boardSurface');
  private readonly ghostEl = viewChild<ElementRef<HTMLElement>>('ghostEl');

  protected readonly artwork = signal<PublicArtwork | null>(null);
  protected readonly imageUrl = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly trayPieces = signal<TrayPiece[]>([]);
  protected readonly placedIds = signal<Set<string>>(new Set());
  protected readonly won = signal(false);
  /** Id de la pièce en cours de drag (null = pas de drag) — pas de coords (évite CD à chaque move). */
  protected readonly draggingPieceId = signal<string | null>(null);

  protected readonly cols = PUZZLE_COLS;
  protected readonly rows = PUZZLE_ROWS;
  protected readonly tab = JIGSAW_TAB;
  protected readonly viewMin = -JIGSAW_TAB;
  protected readonly viewSize = 100 + 2 * JIGSAW_TAB;
  protected readonly colIndexes = Array.from({ length: PUZZLE_COLS }, (_, i) => i);
  protected readonly rowIndexes = Array.from({ length: PUZZLE_ROWS }, (_, i) => i);

  private layoutPieces: PuzzlePieceDef[] = [];
  private returnUrl = '/explore';
  private activeDrag: ActiveDrag | null = null;
  private pendingX = 0;
  private pendingY = 0;
  private rafId = 0;

  private readonly onWindowPointerMove = (event: PointerEvent): void => {
    const d = this.activeDrag;
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    event.preventDefault();
    this.pendingX = event.clientX - d.grabOffsetX;
    this.pendingY = event.clientY - d.grabOffsetY;
    if (this.rafId === 0) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = 0;
        this.applyGhostTransform();
      });
    }
  };

  private readonly onWindowPointerUp = (event: PointerEvent): void => {
    const d = this.activeDrag;
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    this.finishDrag(d, event.clientX, event.clientY);
  };

  private readonly onWindowPointerCancel = (event: PointerEvent): void => {
    const d = this.activeDrag;
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    this.cancelDrag();
  };

  /**
   * Style absolu d'une pièce placée (avec débordement tenons).
   */
  protected placedStyle(piece: PuzzlePieceDef): Record<string, string> {
    const w = 100 / this.cols;
    const h = 100 / this.rows;
    const bleedX = (this.tab / 100) * w;
    const bleedY = (this.tab / 100) * h;
    return {
      left: `${piece.col * w - bleedX}%`,
      top: `${piece.row * h - bleedY}%`,
      width: `${w + 2 * bleedX}%`,
      height: `${h + 2 * bleedY}%`,
    };
  }

  /**
   * Charge l'œuvre et prépare le puzzle.
   */
  ngOnInit(): void {
    const ret = this.route.snapshot.queryParamMap.get('returnUrl');
    if (ret && ret.startsWith('/')) {
      this.returnUrl = ret;
    }
    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onWindowPointerMove, { passive: false });
      window.addEventListener('pointerup', this.onWindowPointerUp);
      window.addEventListener('pointercancel', this.onWindowPointerCancel);
    });
    void this.bootstrap();
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
    window.removeEventListener('pointercancel', this.onWindowPointerCancel);
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  /**
   * Ferme et revient au contexte d'origine.
   */
  protected close(): void {
    void this.router.navigateByUrl(this.returnUrl);
  }

  /**
   * Définition d'une pièce placée (pour le plateau).
   */
  protected pieceById(id: string): PuzzlePieceDef | undefined {
    return this.layoutPieces.find((p) => p.id === id);
  }

  /**
   * Pièces encore dans le rail (non placées), hors drag en cours depuis le rail.
   */
  protected visibleTrayPieces(): TrayPiece[] {
    const draggingId = this.draggingPieceId();
    return this.trayPieces().filter((p) => {
      if (p.placed) {
        return false;
      }
      if (draggingId && draggingId === p.id) {
        return false;
      }
      return true;
    });
  }

  /**
   * Ids placés sous forme de liste (template).
   */
  protected placedList(): string[] {
    return [...this.placedIds()];
  }

  /**
   * Démarre un drag depuis le rail.
   */
  protected onTrayPointerDown(event: PointerEvent, piece: TrayPiece): void {
    if (piece.placed || this.won() || this.activeDrag) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    const rect = target.getBoundingClientRect();
    const grabOffsetX = event.clientX - rect.left;
    const grabOffsetY = event.clientY - rect.top;

    this.activeDrag = {
      pieceId: piece.id,
      pointerId: event.pointerId,
      grabOffsetX,
      grabOffsetY,
      fromTray: true,
    };
    this.pendingX = event.clientX - grabOffsetX;
    this.pendingY = event.clientY - grabOffsetY;

    this.draggingPieceId.set(piece.id);
    // Le ghost n'existe qu'après le prochain rendu Angular.
    queueMicrotask(() => {
      this.applyGhostTransform();
      requestAnimationFrame(() => this.applyGhostTransform());
    });
  }

  /**
   * Applique la position du ghost hors change detection.
   */
  private applyGhostTransform(): void {
    const el = this.ghostEl()?.nativeElement;
    if (!el) {
      return;
    }
    el.style.transform = `translate3d(${this.pendingX}px, ${this.pendingY}px, 0)`;
  }

  /**
   * Termine le drag et tente le snap (reprise zone Angular).
   */
  private finishDrag(d: ActiveDrag, clientX: number, clientY: number): void {
    this.clearActiveDragMotion();
    this.zone.run(() => {
      this.tryPlace(d, clientX, clientY);
      this.draggingPieceId.set(null);
    });
  }

  /**
   * Annule le drag sans placement.
   */
  private cancelDrag(): void {
    this.clearActiveDragMotion();
    this.zone.run(() => {
      this.draggingPieceId.set(null);
    });
  }

  /**
   * Remet à zéro le suivi pointer / rAF.
   */
  private clearActiveDragMotion(): void {
    this.activeDrag = null;
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  /**
   * Charge artwork + image + génère pièces.
   */
  private async bootstrap(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const artworkId = this.route.snapshot.paramMap.get('artworkId');
    if (!artworkId) {
      this.errorMessage.set('Œuvre introuvable.');
      this.isLoading.set(false);
      return;
    }

    const result = await this.explore.getPublicById(artworkId);
    if (result.error) {
      this.errorMessage.set(result.error);
      this.isLoading.set(false);
      return;
    }
    if (!result.item) {
      this.errorMessage.set('Cette œuvre n’est pas disponible.');
      this.isLoading.set(false);
      return;
    }
    if (!result.item.puzzle_enabled) {
      this.errorMessage.set('Le mode puzzle n’est pas activé pour cette œuvre.');
      this.isLoading.set(false);
      return;
    }

    const url = await this.explore.getSignedImageUrl(result.item.storage_path);
    if (!url) {
      this.errorMessage.set('Impossible de charger l’image.');
      this.isLoading.set(false);
      return;
    }

    this.artwork.set(result.item);
    this.imageUrl.set(url);

    const layout = buildPuzzleLayout(result.item.id, this.cols, this.rows);
    this.layoutPieces = layout.pieces;
    const shuffled = shuffleSeeded(layout.pieces, result.item.id).map((p) => ({
      ...p,
      placed: false,
    }));
    this.trayPieces.set(shuffled);
    this.placedIds.set(new Set());
    this.won.set(false);
    this.isLoading.set(false);
  }

  /**
   * Tente de placer la pièce sous le pointeur (snap cellule).
   */
  private tryPlace(d: ActiveDrag, clientX: number, clientY: number): void {
    const piece = this.layoutPieces.find((p) => p.id === d.pieceId);
    const surface = this.boardSurface()?.nativeElement;
    if (!piece || !surface) {
      return;
    }

    const rect = surface.getBoundingClientRect();
    if (
      clientX < rect.left - 20 ||
      clientX > rect.right + 20 ||
      clientY < rect.top - 20 ||
      clientY > rect.bottom + 20
    ) {
      return;
    }

    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    const col = Math.min(this.cols - 1, Math.max(0, Math.floor(relX * this.cols)));
    const row = Math.min(this.rows - 1, Math.max(0, Math.floor(relY * this.rows)));

    if (col !== piece.col || row !== piece.row) {
      return;
    }

    const nextPlaced = new Set(this.placedIds());
    nextPlaced.add(piece.id);
    this.placedIds.set(nextPlaced);
    this.trayPieces.update((list) =>
      list.map((p) => (p.id === piece.id ? { ...p, placed: true } : p)),
    );

    if (nextPlaced.size === this.layoutPieces.length) {
      this.won.set(true);
    }
  }
}
