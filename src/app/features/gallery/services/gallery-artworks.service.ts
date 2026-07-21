import { Injectable, inject } from '@angular/core';

import type { AuthResult } from '../../../core/auth/models/auth-result.model';
import { AuthService } from '../../../core/auth/auth.service';
import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';

import type { CreateArtworkInput } from '../models/create-artwork-input.model';
import { ARTWORK_SELECT_COLUMNS, type Artwork, type ArtworkVisibility } from '../models/artwork.model';
import { GALLERY_SELECT_COLUMNS, type Gallery } from '../models/gallery.model';
import type { UpdateArtworkInput } from '../models/update-artwork-input.model';

/**
 * Galeries et œuvres de l'utilisateur connecté (feature gallery).
 */
@Injectable({ providedIn: 'root' })
export class GalleryArtworksService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly auth = inject(AuthService);

  /**
   * Liste les galeries du compte connecté.
   */
  async listMyGalleries(): Promise<{ galleries: Gallery[]; error: string | null }> {
    const userId = this.requireUserId();
    if (!userId) {
      return { galleries: [], error: 'Connectez-vous pour gérer vos galeries.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('galleries')
      .select(GALLERY_SELECT_COLUMNS)
      .eq('owner_id', userId)
      .order('name', { ascending: true });

    if (error) {
      return { galleries: [], error: error.message };
    }
    return { galleries: (data ?? []) as Gallery[], error: null };
  }

  /**
   * Crée une galerie pour le compte connecté.
   * @param name Nom de la galerie (1–64 caractères).
   */
  async createGallery(name: string): Promise<{ gallery: Gallery | null; error: string | null }> {
    const userId = this.requireUserId();
    if (!userId) {
      return { gallery: null, error: 'Connectez-vous pour créer une galerie.' };
    }

    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 64) {
      return { gallery: null, error: 'Le nom de galerie doit contenir entre 1 et 64 caractères.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('galleries')
      .insert({ owner_id: userId, name: trimmed })
      .select(GALLERY_SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      if (error.message.toLowerCase().includes('duplicate')) {
        return { gallery: null, error: 'Une galerie porte déjà ce nom.' };
      }
      return { gallery: null, error: error.message };
    }

    return { gallery: data as Gallery, error: null };
  }

  /**
   * Liste les œuvres du compte connecté (plus récentes d'abord).
   */
  async listMyArtworks(): Promise<{ artworks: Artwork[]; error: string | null }> {
    const userId = this.requireUserId();
    if (!userId) {
      return { artworks: [], error: 'Connectez-vous pour voir vos œuvres.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('artworks')
      .select(ARTWORK_SELECT_COLUMNS)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { artworks: [], error: error.message };
    }
    return { artworks: (data ?? []) as Artwork[], error: null };
  }

  /**
   * URL signée pour prévisualiser une image privée (durée limitée).
   * @param storagePath Chemin dans le bucket artworks.
   */
  async getSignedImageUrl(storagePath: string): Promise<string | null> {
    const client = this.supabase.getClient();
    const { data, error } = await client.storage
      .from('artworks')
      .createSignedUrl(storagePath, 60 * 60);

    if (error || !data?.signedUrl) {
      return null;
    }
    return data.signedUrl;
  }

  /**
   * Publie une nouvelle œuvre (upload Storage + insert BDD).
   * @param input Données formulaire + image préparée.
   */
  async createArtwork(input: CreateArtworkInput): Promise<AuthResult & { artworkId?: string }> {
    const userId = this.requireUserId();
    if (!userId) {
      return { success: false, message: 'Connectez-vous pour publier.' };
    }

    const artworkId = crypto.randomUUID();
    const storagePath = `${userId}/${artworkId}.${input.extension}`;
    const client = this.supabase.getClient();

    const { error: uploadError } = await client.storage.from('artworks').upload(storagePath, input.imageBlob, {
      contentType: input.mimeType,
      upsert: false,
    });

    if (uploadError) {
      return { success: false, message: uploadError.message };
    }

    const { error: insertError } = await client.from('artworks').insert({
      id: artworkId,
      owner_id: userId,
      gallery_id: input.galleryId,
      title: input.title.trim(),
      description: input.description.trim(),
      hours_spent: input.hoursSpent,
      visibility_status: input.requestPublic ? 'pending_public' : 'private',
      puzzle_enabled: input.puzzleEnabled,
      storage_path: storagePath,
      mime_type: input.mimeType,
      byte_size: input.imageBlob.size,
      width_px: input.widthPx,
      height_px: input.heightPx,
    });

    if (insertError) {
      await client.storage.from('artworks').remove([storagePath]);
      return { success: false, message: insertError.message };
    }

    return { success: true, artworkId };
  }

  /**
   * Charge une œuvre appartenant au compte connecté.
   * @param artworkId Identifiant de l'œuvre.
   */
  async getMyArtwork(artworkId: string): Promise<{ artwork: Artwork | null; error: string | null }> {
    const userId = this.requireUserId();
    if (!userId) {
      return { artwork: null, error: 'Connectez-vous pour voir cette œuvre.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('artworks')
      .select(ARTWORK_SELECT_COLUMNS)
      .eq('id', artworkId)
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      return { artwork: null, error: error.message };
    }
    if (!data) {
      return { artwork: null, error: 'Œuvre introuvable.' };
    }
    return { artwork: data as Artwork, error: null };
  }

  /**
   * Met à jour les métadonnées d'une œuvre (pas le fichier image).
   * @param artworkId Identifiant.
   * @param input Champs éditables.
   * @param currentVisibility Statut actuel (pour calculer la transition).
   */
  async updateArtwork(
    artworkId: string,
    input: UpdateArtworkInput,
    currentVisibility: ArtworkVisibility,
  ): Promise<AuthResult> {
    const userId = this.requireUserId();
    if (!userId) {
      return { success: false, message: 'Connectez-vous pour modifier.' };
    }

    const nextVisibility = this.resolveAuthorVisibility(currentVisibility, input.requestPublic);

    const client = this.supabase.getClient();
    const { error } = await client
      .from('artworks')
      .update({
        title: input.title.trim(),
        description: input.description.trim(),
        hours_spent: input.hoursSpent,
        gallery_id: input.galleryId,
        puzzle_enabled: input.puzzleEnabled,
        visibility_status: nextVisibility,
      })
      .eq('id', artworkId)
      .eq('owner_id', userId);

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  }

  /**
   * Supprime une œuvre (Storage + ligne BDD).
   * @param artwork Œuvre à supprimer.
   */
  async deleteArtwork(artwork: Artwork): Promise<AuthResult> {
    const userId = this.requireUserId();
    if (!userId || artwork.owner_id !== userId) {
      return { success: false, message: 'Suppression non autorisée.' };
    }

    const client = this.supabase.getClient();
    const { error: dbError } = await client
      .from('artworks')
      .delete()
      .eq('id', artwork.id)
      .eq('owner_id', userId);

    if (dbError) {
      return { success: false, message: dbError.message };
    }

    const { error: storageError } = await client.storage
      .from('artworks')
      .remove([artwork.storage_path]);

    if (storageError) {
      console.warn('[Gallery] Fichier Storage non supprimé', storageError.message);
    }

    return { success: true };
  }

  /**
   * Calcule le prochain statut demandé par l'auteur (sans self-publish).
   */
  private resolveAuthorVisibility(
    current: ArtworkVisibility,
    requestPublic: boolean,
  ): ArtworkVisibility {
    if (requestPublic) {
      if (current === 'public') {
        return 'public';
      }
      return 'pending_public';
    }
    return 'private';
  }

  /**
   * Retourne l'id utilisateur ou null.
   */
  private requireUserId(): string | null {
    if (!this.supabase.isConfigured()) {
      return null;
    }
    return this.auth.session()?.user.id ?? null;
  }
}
