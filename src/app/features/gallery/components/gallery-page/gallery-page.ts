import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Artwork, ArtworkVisibility } from '../../models/artwork.model';
import { GalleryArtworksService } from '../../services/gallery-artworks.service';

/**
 * Page « Mes œuvres » — liste des publications du compte connecté.
 */
@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './gallery-page.html',
  styleUrl: './gallery-page.scss',
})
export class GalleryPage implements OnInit {
  private readonly artworksService = inject(GalleryArtworksService);

  /** Liste des œuvres. */
  protected readonly artworks = signal<Artwork[]>([]);

  /** URLs signées indexées par id d'œuvre. */
  protected readonly thumbUrls = signal<Record<string, string>>({});

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  /**
   * Charge la liste au montage.
   */
  ngOnInit(): void {
    void this.reload();
  }

  /**
   * Libellé français du statut de visibilité.
   * @param status Statut BDD.
   */
  protected visibilityLabel(status: ArtworkVisibility): string {
    switch (status) {
      case 'private':
        return 'Privée';
      case 'pending_public':
        return 'En attente de modération';
      case 'public':
        return 'Publique';
      case 'rejected':
        return 'Refusée (non publique)';
    }
  }

  /**
   * Recharge les œuvres et les miniatures signées.
   */
  private async reload(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { artworks, error } = await this.artworksService.listMyArtworks();
    if (error) {
      this.errorMessage.set(error);
      this.artworks.set([]);
      this.isLoading.set(false);
      return;
    }

    this.artworks.set(artworks);

    const urls: Record<string, string> = {};
    await Promise.all(
      artworks.map(async (artwork) => {
        const url = await this.artworksService.getSignedImageUrl(artwork.storage_path);
        if (url) {
          urls[artwork.id] = url;
        }
      }),
    );
    this.thumbUrls.set(urls);
    this.isLoading.set(false);
  }
}
