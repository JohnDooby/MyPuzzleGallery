import {
  Component,
  ElementRef,
  HostListener,
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

interface DragState {
  pieceId: string;
  pointerId: number;
  grabOffsetX: number;
  grabOffsetY: number;
  x: number;
  y: number;
  fromTray: boolean;
}

/**
 * Page puzzle plein écran : plateau + rail de pièces, snap jigsaw.
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

  private readonly boardSurface = viewChild<ElementRef<HTMLElement>>('boardSurface');

  protected readonly artwork = signal<PublicArtwork | null>(null);
  protected readonly imageUrl = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly trayPieces = signal<TrayPiece[]>([]);
  protected readonly placedIds = signal<Set<string>>(new Set());
  protected readonly won = signal(false);
  protected readonly drag = signal<DragState | null>(null);

  protected readonly cols = PUZZLE_COLS;
  protected readonly rows = PUZZLE_ROWS;
  protected readonly tab = JIGSAW_TAB;
  protected readonly viewMin = -JIGSAW_TAB;
  protected readonly viewSize = 100 + 2 * JIGSAW_TAB;
  protected readonly colIndexes = Array.from({ length: PUZZLE_COLS }, (_, i) => i);
  protected readonly rowIndexes = Array.from({ length: PUZZLE_ROWS }, (_, i) => i);

  private layoutPieces: PuzzlePieceDef[] = [];
  private returnUrl = '/explore';

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
    void this.bootstrap();
  }

  ngOnDestroy(): void {
    // Rien à nettoyer hors listeners pointer (detachés à pointerup).
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
    const dragging = this.drag();
    return this.trayPieces().filter((p) => {
      if (p.placed) {
        return false;
      }
      if (dragging && dragging.pieceId === p.id && dragging.fromTray) {
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
    if (piece.placed || this.won()) {
      return;
    }
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    this.drag.set({
      pieceId: piece.id,
      pointerId: event.pointerId,
      grabOffsetX: 40,
      grabOffsetY: 40,
      x: event.clientX - 40,
      y: event.clientY - 40,
      fromTray: true,
    });
  }

  @HostListener('window:pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    const d = this.drag();
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    this.drag.set({
      ...d,
      x: event.clientX - d.grabOffsetX,
      y: event.clientY - d.grabOffsetY,
    });
  }

  @HostListener('window:pointerup', ['$event'])
  protected onPointerUp(event: PointerEvent): void {
    const d = this.drag();
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    this.tryPlace(d, event.clientX, event.clientY);
    this.drag.set(null);
  }

  @HostListener('window:pointercancel', ['$event'])
  protected onPointerCancel(event: PointerEvent): void {
    const d = this.drag();
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    this.drag.set(null);
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
  private tryPlace(d: DragState, clientX: number, clientY: number): void {
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

    // Snap uniquement sur la bonne case (tolérance = cellule courante).
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
