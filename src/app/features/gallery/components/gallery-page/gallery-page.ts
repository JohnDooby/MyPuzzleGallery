import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Artwork, ArtworkVisibility } from '../../models/artwork.model';
import { GalleryArtworksService } from '../../services/gallery-artworks.service';

/**
 * Page « Mes œuvres » — liste, édition et suppression.
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
  protected readonly successMessage = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

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
   * Supprime une œuvre après confirmation.
   * @param artwork Œuvre cible.
   */
  protected async onDelete(artwork: Artwork): Promise<void> {
    const ok = window.confirm(
      `Supprimer définitivement « ${artwork.title} » ?\nCette action est irréversible.`,
    );
    if (!ok) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.busyId.set(artwork.id);

    const result = await this.artworksService.deleteArtwork(artwork);
    this.busyId.set(null);

    if (!result.success) {
      this.errorMessage.set(result.message);
      return;
    }

    this.successMessage.set('Œuvre supprimée.');
    await this.reload();
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
