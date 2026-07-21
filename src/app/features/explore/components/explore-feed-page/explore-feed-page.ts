import { afterNextRender, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { PublicArtwork } from '../../models/public-artwork.model';
import { PublicExploreService } from '../../services/public-explore.service';

/**
 * Feed plein écran type lightbox — œuvres publiques (scroll vertical snap).
 */
@Component({
  selector: 'app-explore-feed-page',
  imports: [RouterLink],
  templateUrl: './explore-feed-page.html',
  styleUrl: './explore-feed-page.scss',
})
export class ExploreFeedPage implements OnInit {
  private readonly explore = inject(PublicExploreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly feedList = viewChild<ElementRef<HTMLElement>>('feedList');

  protected readonly items = signal<PublicArtwork[]>([]);
  protected readonly imageUrls = signal<Record<string, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly missingTarget = signal(false);

  constructor() {
    afterNextRender(() => {
      this.scrollToTarget();
    });
  }

  /**
   * Charge le feed public au montage.
   */
  ngOnInit(): void {
    void this.loadFeed();
  }

  /**
   * Charge les œuvres + URLs signées, puis positionne le scroll.
   */
  private async loadFeed(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.missingTarget.set(false);

    const result = await this.explore.listLatestPublic(20);
    if (result.error) {
      this.errorMessage.set(result.error);
      this.items.set([]);
      this.isLoading.set(false);
      return;
    }

    const targetId = this.route.snapshot.paramMap.get('artworkId');
    if (targetId && !result.items.some((item) => item.id === targetId)) {
      this.missingTarget.set(true);
    }

    this.items.set(result.items);

    const urls: Record<string, string> = {};
    await Promise.all(
      result.items.map(async (item) => {
        const url = await this.explore.getSignedImageUrl(item.storage_path);
        if (url) {
          urls[item.id] = url;
        }
      }),
    );
    this.imageUrls.set(urls);
    this.isLoading.set(false);

    // Repositionne après paint (images / liste prêtes).
    queueMicrotask(() => this.scrollToTarget());
  }

  /**
   * Scroll jusqu'à l'œuvre ciblée par l'URL, si présente.
   */
  private scrollToTarget(): void {
    const targetId = this.route.snapshot.paramMap.get('artworkId');
    if (!targetId) {
      return;
    }
    const host = this.feedList()?.nativeElement;
    if (!host) {
      return;
    }
    const slide = host.querySelector<HTMLElement>(`[data-artwork-id="${targetId}"]`);
    slide?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  /**
   * Ferme le feed et revient à l'accueil.
   */
  protected close(): void {
    void this.router.navigateByUrl('/');
  }
}
