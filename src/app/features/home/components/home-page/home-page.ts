import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { APP_BRANDING } from '../../../../core/branding/app-branding';
import type { PublicArtwork } from '../../../explore/models/public-artwork.model';
import { PublicExploreService } from '../../../explore/services/public-explore.service';

/**
 * Page d'accueil : branding + carousel des dernières œuvres publiques.
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly explore = inject(PublicExploreService);
  private readonly router = inject(Router);

  /** Nom de l'application. */
  protected readonly appName = APP_BRANDING.name;

  protected readonly items = signal<PublicArtwork[]>([]);
  protected readonly thumbUrls = signal<Record<string, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  /**
   * Charge le carousel au montage.
   */
  ngOnInit(): void {
    void this.loadCarousel();
  }

  /**
   * Ouvre le feed lightbox sur l'œuvre choisie.
   * @param artwork Œuvre publique.
   */
  protected openArtwork(artwork: PublicArtwork): void {
    void this.router.navigate(['/explore', artwork.id]);
  }

  /**
   * Charge les 20 dernières publications + miniatures.
   */
  private async loadCarousel(): Promise<void> {
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
