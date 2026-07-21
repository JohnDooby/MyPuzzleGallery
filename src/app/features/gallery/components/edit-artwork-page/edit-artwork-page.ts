import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { Artwork } from '../../models/artwork.model';
import type { Gallery } from '../../models/gallery.model';
import { GalleryArtworksService } from '../../services/gallery-artworks.service';

/**
 * Édition des métadonnées d'une œuvre (sans remplacement d'image).
 */
@Component({
  selector: 'app-edit-artwork-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-artwork-page.html',
  styleUrl: './edit-artwork-page.scss',
})
export class EditArtworkPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly artworksService = inject(GalleryArtworksService);

  protected readonly artwork = signal<Artwork | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly galleries = signal<Gallery[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(2000)]],
    hoursSpent: ['' as string],
    galleryId: ['', [Validators.required]],
    requestPublic: [false],
    puzzleEnabled: [false],
  });

  /**
   * Charge l'œuvre et les galeries.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Identifiant manquant.');
      this.isLoading.set(false);
      return;
    }
    void this.load(id);
  }

  /**
   * Enregistre les modifications.
   */
  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    const current = this.artwork();
    if (!current) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const hoursRaw = this.form.controls.hoursSpent.value.trim().replace(',', '.');
    let hoursSpent: number | null = null;
    if (hoursRaw !== '') {
      const parsed = Number(hoursRaw);
      if (Number.isNaN(parsed) || parsed < 0) {
        this.errorMessage.set('Nombre d’heures invalide.');
        return;
      }
      hoursSpent = parsed;
    }

    this.isSubmitting.set(true);
    const result = await this.artworksService.updateArtwork(
      current.id,
      {
        title: this.form.controls.title.value,
        description: this.form.controls.description.value,
        hoursSpent,
        galleryId: this.form.controls.galleryId.value,
        requestPublic: this.form.controls.requestPublic.value,
        puzzleEnabled: this.form.controls.puzzleEnabled.value,
      },
      current.visibility_status,
    );
    this.isSubmitting.set(false);

    if (!result.success) {
      this.errorMessage.set(result.message);
      return;
    }

    await this.router.navigateByUrl('/gallery');
  }

  /**
   * Charge artwork + galeries + aperçu.
   */
  private async load(artworkId: string): Promise<void> {
    this.isLoading.set(true);
    const [artworkResult, galleriesResult] = await Promise.all([
      this.artworksService.getMyArtwork(artworkId),
      this.artworksService.listMyGalleries(),
    ]);

    if (artworkResult.error || !artworkResult.artwork) {
      this.errorMessage.set(artworkResult.error ?? 'Œuvre introuvable.');
      this.isLoading.set(false);
      return;
    }
    if (galleriesResult.error) {
      this.errorMessage.set(galleriesResult.error);
      this.isLoading.set(false);
      return;
    }

    const artwork = artworkResult.artwork;
    this.artwork.set(artwork);
    this.galleries.set(galleriesResult.galleries);

    this.form.setValue({
      title: artwork.title,
      description: artwork.description,
      hoursSpent: artwork.hours_spent != null ? String(artwork.hours_spent) : '',
      galleryId: artwork.gallery_id,
      requestPublic:
        artwork.visibility_status === 'pending_public' || artwork.visibility_status === 'public',
      puzzleEnabled: artwork.puzzle_enabled,
    });

    const url = await this.artworksService.getSignedImageUrl(artwork.storage_path);
    this.previewUrl.set(url);
    this.isLoading.set(false);
  }
}
