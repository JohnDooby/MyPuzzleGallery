import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { PublicArtwork } from '../../models/public-artwork.model';
import { PublicExploreService } from '../../services/public-explore.service';

/**
 * Lightbox d'une seule œuvre publique (pas de fil multi-images).
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

  protected readonly artwork = signal<PublicArtwork | null>(null);
  protected readonly imageUrl = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly notFound = signal(false);

  /**
   * Charge l'œuvre ciblée au montage.
   */
  ngOnInit(): void {
    void this.loadArtwork();
  }

  /**
   * Charge une seule œuvre publique + URL signée.
   */
  private async loadArtwork(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.notFound.set(false);
    this.artwork.set(null);
    this.imageUrl.set(null);

    const artworkId = this.route.snapshot.paramMap.get('artworkId');
    if (!artworkId) {
      this.notFound.set(true);
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
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.artwork.set(result.item);
    this.imageUrl.set(await this.explore.getSignedImageUrl(result.item.storage_path));
    this.isLoading.set(false);
  }

  /**
   * Ferme le lightbox et revient à la grille Galerie.
   */
  protected close(): void {
    void this.router.navigateByUrl('/explore');
  }

  /**
   * Lance le puzzle plein écran pour l'œuvre courante.
   */
  protected playPuzzle(): void {
    const art = this.artwork();
    if (!art?.puzzle_enabled) {
      return;
    }
    void this.router.navigate(['/puzzle', art.id], {
      queryParams: { returnUrl: `/explore/${art.id}` },
    });
  }
}
