import { Injectable, inject } from '@angular/core';

import type { AuthResult } from '../../../core/auth/models/auth-result.model';
import { AuthService } from '../../../core/auth/auth.service';
import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';

import type { CreateArtworkInput } from '../models/create-artwork-input.model';
import { ARTWORK_SELECT_COLUMNS, type Artwork } from '../models/artwork.model';
import { GALLERY_SELECT_COLUMNS, type Gallery } from '../models/gallery.model';

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
   * Retourne l'id utilisateur ou null.
   */
  private requireUserId(): string | null {
    if (!this.supabase.isConfigured()) {
      return null;
    }
    return this.auth.session()?.user.id ?? null;
  }
}
