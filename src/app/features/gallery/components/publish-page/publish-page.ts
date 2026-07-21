import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import type { Gallery } from '../../models/gallery.model';
import { GalleryArtworksService } from '../../services/gallery-artworks.service';
import { prepareArtworkImage } from '../../utils/artwork-image';

/**
 * Formulaire de publication d'une œuvre (compression client + upload).
 */
@Component({
  selector: 'app-publish-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './publish-page.html',
  styleUrl: './publish-page.scss',
})
export class PublishPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly artworksService = inject(GalleryArtworksService);
  private readonly router = inject(Router);

  /** Galeries disponibles. */
  protected readonly galleries = signal<Gallery[]>([]);

  /** Fichier image sélectionné (brut). */
  protected readonly selectedFile = signal<File | null>(null);

  /** Aperçu local (object URL). */
  protected readonly previewUrl = signal<string | null>(null);

  protected readonly isLoadingGalleries = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly infoMessage = signal<string | null>(null);

  /** Affiche le champ « nouvelle galerie ». */
  protected readonly showNewGallery = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(2000)]],
    hoursSpent: ['' as string],
    galleryId: ['', [Validators.required]],
    newGalleryName: [''],
    requestPublic: [false],
    puzzleEnabled: [false],
  });

  /**
   * Charge les galeries au montage.
   */
  ngOnInit(): void {
    void this.loadGalleries();
  }

  /**
   * Nettoie l'aperçu local.
   */
  ngOnDestroy(): void {
    this.revokePreview();
  }

  /**
   * Bascule le mode création de galerie.
   */
  protected toggleNewGallery(): void {
    const next = !this.showNewGallery();
    this.showNewGallery.set(next);
    if (next) {
      this.form.controls.galleryId.clearValidators();
      this.form.controls.galleryId.setValue('');
      this.form.controls.newGalleryName.setValidators([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(64),
      ]);
    } else {
      this.form.controls.newGalleryName.clearValidators();
      this.form.controls.newGalleryName.setValue('');
      this.form.controls.galleryId.setValidators([Validators.required]);
      const first = this.galleries()[0];
      if (first) {
        this.form.controls.galleryId.setValue(first.id);
      }
    }
    this.form.controls.galleryId.updateValueAndValidity();
    this.form.controls.newGalleryName.updateValueAndValidity();
  }

  /**
   * Sélectionne un fichier image.
   * @param event Événement input file.
   */
  protected onFileSelected(event: Event): void {
    this.errorMessage.set(null);
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.revokePreview();
    this.selectedFile.set(file);
    if (file) {
      this.previewUrl.set(URL.createObjectURL(file));
    }
  }

  /**
   * Soumet la publication.
   */
  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Choisissez une image PNG ou JPEG.');
      return;
    }

    this.isSubmitting.set(true);
    this.infoMessage.set('Compression de l’image…');

    try {
      const prepared = await prepareArtworkImage(file);
      let galleryId = this.form.controls.galleryId.value;

      if (this.showNewGallery()) {
        const created = await this.artworksService.createGallery(
          this.form.controls.newGalleryName.value,
        );
        if (created.error || !created.gallery) {
          this.errorMessage.set(created.error ?? 'Impossible de créer la galerie.');
          this.isSubmitting.set(false);
          this.infoMessage.set(null);
          return;
        }
        galleryId = created.gallery.id;
      }

      const hoursRaw = this.form.controls.hoursSpent.value.trim().replace(',', '.');
      let hoursSpent: number | null = null;
      if (hoursRaw !== '') {
        const parsed = Number(hoursRaw);
        if (Number.isNaN(parsed) || parsed < 0) {
          this.errorMessage.set('Nombre d’heures invalide.');
          this.isSubmitting.set(false);
          this.infoMessage.set(null);
          return;
        }
        hoursSpent = parsed;
      }

      this.infoMessage.set('Envoi en cours…');
      const result = await this.artworksService.createArtwork({
        title: this.form.controls.title.value,
        description: this.form.controls.description.value,
        hoursSpent,
        galleryId,
        requestPublic: this.form.controls.requestPublic.value,
        puzzleEnabled: this.form.controls.puzzleEnabled.value,
        imageBlob: prepared.blob,
        mimeType: prepared.mimeType,
        extension: prepared.extension,
        widthPx: prepared.width,
        heightPx: prepared.height,
      });

      if (!result.success) {
        this.errorMessage.set(result.message);
        this.isSubmitting.set(false);
        this.infoMessage.set(null);
        return;
      }

      await this.router.navigateByUrl('/gallery');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de la publication.';
      this.errorMessage.set(message);
      this.isSubmitting.set(false);
      this.infoMessage.set(null);
    }
  }

  /**
   * Charge les galeries et sélectionne « Ma galerie » par défaut.
   */
  private async loadGalleries(): Promise<void> {
    this.isLoadingGalleries.set(true);
    const { galleries, error } = await this.artworksService.listMyGalleries();
    this.isLoadingGalleries.set(false);

    if (error) {
      this.errorMessage.set(error);
      return;
    }

    this.galleries.set(galleries);
    const preferred =
      galleries.find((g) => g.name.toLowerCase() === 'ma galerie') ?? galleries[0] ?? null;
    if (preferred) {
      this.form.controls.galleryId.setValue(preferred.id);
    }
  }

  /**
   * Libère l'object URL d'aperçu.
   */
  private revokePreview(): void {
    const current = this.previewUrl();
    if (current) {
      URL.revokeObjectURL(current);
    }
    this.previewUrl.set(null);
  }
}
