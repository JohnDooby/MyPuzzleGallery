import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { PublicArtwork } from '../../models/public-artwork.model';
import {
  PUBLIC_GALLERY_PAGE_SIZE,
  PublicExploreService,
} from '../../services/public-explore.service';

/**
 * Galerie publique (grille) — accessible authentifié ou non.
 * Infinite scroll : lots de 10, chargés uniquement en avançant dans le scroll.
 */
@Component({
  selector: 'app-explore-gallery-page',
  imports: [RouterLink],
  templateUrl: './explore-gallery-page.html',
  styleUrl: './explore-gallery-page.scss',
})
export class ExploreGalleryPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly explore = inject(PublicExploreService);
  private readonly router = inject(Router);

  private readonly loadMoreSentinel = viewChild<ElementRef<HTMLElement>>('loadMoreSentinel');

  protected readonly items = signal<PublicArtwork[]>([]);
  protected readonly thumbUrls = signal<Record<string, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly isLoadingMore = signal(false);
  protected readonly hasMore = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private offset = 0;
  private observer: IntersectionObserver | null = null;
  private loadInFlight = false;
  /** Empêche le chargement auto si la sentinelle est déjà visible sans scroll. */
  private userHasScrolled = false;
  private readonly unlockScroll = (): void => {
    if (this.userHasScrolled) {
      return;
    }
    this.userHasScrolled = true;
    this.removeScrollGateListeners();
    // Si la sentinelle est déjà proche du viewport après le 1er geste, charge maintenant.
    const el = this.loadMoreSentinel()?.nativeElement;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120) {
        void this.loadMore();
      }
    }
  };

  /**
   * Charge le premier lot au montage.
   */
  ngOnInit(): void {
    this.armScrollGate();
    void this.loadInitial();
  }

  /**
   * Observe le bas de grille pour charger le lot suivant au scroll.
   */
  ngAfterViewInit(): void {
    this.setupObserver();
  }

  /**
   * Nettoie l'observer et les écouteurs.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.removeScrollGateListeners();
  }

  /**
   * Ouvre le lightbox sur l'œuvre.
   * @param artwork Œuvre publique.
   */
  protected openArtwork(artwork: PublicArtwork): void {
    void this.router.navigate(['/explore', artwork.id]);
  }

  /**
   * Lance le puzzle plein écran.
   * @param artwork Œuvre publique avec puzzle activé.
   * @param event Clic.
   */
  protected playPuzzle(artwork: PublicArtwork, event: Event): void {
    event.stopPropagation();
    void this.router.navigate(['/puzzle', artwork.id], {
      queryParams: { returnUrl: '/explore' },
    });
  }

  /**
   * Premier lot (offset 0) — pas de lots suivants sans scroll.
   */
  private async loadInitial(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.offset = 0;
    this.items.set([]);
    this.thumbUrls.set({});

    const ok = await this.fetchPage(false);
    this.isLoading.set(false);
    if (ok) {
      // Rebranche l'observer après rendu de la sentinelle.
      queueMicrotask(() => this.setupObserver());
    }
  }

  /**
   * Lot suivant uniquement après un scroll utilisateur, si hasMore.
   */
  private async loadMore(): Promise<void> {
    if (!this.userHasScrolled || !this.hasMore() || this.loadInFlight || this.isLoading()) {
      return;
    }
    this.isLoadingMore.set(true);
    await this.fetchPage(true);
    this.isLoadingMore.set(false);
  }

  /**
   * Active le chargement des lots suivants dès le premier geste de scroll.
   */
  private armScrollGate(): void {
    this.userHasScrolled = false;
    window.addEventListener('scroll', this.unlockScroll, { passive: true });
    window.addEventListener('touchmove', this.unlockScroll, { passive: true });
    window.addEventListener('wheel', this.unlockScroll, { passive: true });
  }

  /**
   * Retire les écouteurs du verrou scroll.
   */
  private removeScrollGateListeners(): void {
    window.removeEventListener('scroll', this.unlockScroll);
    window.removeEventListener('touchmove', this.unlockScroll);
    window.removeEventListener('wheel', this.unlockScroll);
  }

  /**
   * Appelle la RPC et fusionne les miniatures du lot.
   * @param append true = concatène ; false = remplace.
   */
  private async fetchPage(append: boolean): Promise<boolean> {
    if (this.loadInFlight) {
      return false;
    }
    this.loadInFlight = true;

    const result = await this.explore.listLatestPublic(PUBLIC_GALLERY_PAGE_SIZE, this.offset);
    this.loadInFlight = false;

    if (result.error) {
      this.errorMessage.set(result.error);
      if (!append) {
        this.items.set([]);
        this.hasMore.set(false);
      }
      return false;
    }

    const nextItems = append ? [...this.items(), ...result.items] : result.items;
    this.items.set(nextItems);
    this.offset = nextItems.length;
    this.hasMore.set(result.hasMore);

    const urls = { ...this.thumbUrls() };
    await Promise.all(
      result.items.map(async (item) => {
        const url = await this.explore.getSignedImageUrl(item.storage_path);
        if (url) {
          urls[item.id] = url;
        }
      }),
    );
    this.thumbUrls.set(urls);
    return true;
  }

  /**
   * IntersectionObserver sur la sentinelle en bas de grille.
   */
  private setupObserver(): void {
    this.observer?.disconnect();
    const el = this.loadMoreSentinel()?.nativeElement;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (hit && this.userHasScrolled) {
          void this.loadMore();
        }
      },
      { root: null, rootMargin: '120px 0px', threshold: 0 },
    );
    this.observer.observe(el);
  }
}
