import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { PublicArtwork } from '../../models/public-artwork.model';
import { PublicExploreService } from '../../services/public-explore.service';

/**
 * Galerie publique (grille) — accessible authentifié ou non.
 * Distincte de « Mes œuvres » (`/gallery`).
 */
@Component({
  selector: 'app-explore-gallery-page',
  imports: [RouterLink],
  templateUrl: './explore-gallery-page.html',
  styleUrl: './explore-gallery-page.scss',
})
export class ExploreGalleryPage implements OnInit {
  private readonly explore = inject(PublicExploreService);
  private readonly router = inject(Router);

  protected readonly items = signal<PublicArtwork[]>([]);
  protected readonly thumbUrls = signal<Record<string, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  /**
   * Charge la grille au montage.
   */
  ngOnInit(): void {
    void this.loadGallery();
  }

  /**
   * Ouvre le feed lightbox sur l'œuvre.
   * @param artwork Œuvre publique.
   */
  protected openArtwork(artwork: PublicArtwork): void {
    void this.router.navigate(['/explore', artwork.id]);
  }

  /**
   * Charge les œuvres publiques + miniatures.
   */
  private async loadGallery(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.explore.listLatestPublic(20);
    if (result.error) {
      this.errorMessage.set(result.error);
      this.items.set([]);
      this.isLoading.set(false);
      return;
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
    this.thumbUrls.set(urls);
    this.isLoading.set(false);
  }
}
