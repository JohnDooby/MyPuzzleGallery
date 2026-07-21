import { Injectable, inject } from '@angular/core';

import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';

import type { PublicArtwork } from '../models/public-artwork.model';

/** Taille de lot pour la grille Galerie (infinite scroll). */
export const PUBLIC_GALLERY_PAGE_SIZE = 10;

/**
 * Lecture des œuvres publiques (accueil carousel + grille explore).
 * Accessible anonymement via RLS / RPC.
 */
@Injectable({ providedIn: 'root' })
export class PublicExploreService {
  private readonly supabase = inject(SupabaseClientService);

  /**
   * Liste paginée des œuvres publiques (plus récentes d'abord).
   * @param limit Taille du lot (plafonnée côté SQL).
   * @param offset Décalage (0 = début).
   */
  async listLatestPublic(
    limit = PUBLIC_GALLERY_PAGE_SIZE,
    offset = 0,
  ): Promise<{ items: PublicArtwork[]; hasMore: boolean; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { items: [], hasMore: false, error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.rpc('list_public_artworks', {
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      return { items: [], hasMore: false, error: error.message };
    }

    const items = (data ?? []) as PublicArtwork[];
    return { items, hasMore: items.length === limit, error: null };
  }

  /**
   * Charge une œuvre publique par id (lightbox).
   * @param artworkId Identifiant.
   */
  async getPublicById(
    artworkId: string,
  ): Promise<{ item: PublicArtwork | null; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { item: null, error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('artworks')
      .select(
        'id, title, description, puzzle_enabled, storage_path, mime_type, width_px, height_px, created_at, profiles!inner(pseudo, is_banned)',
      )
      .eq('id', artworkId)
      .eq('visibility_status', 'public')
      .maybeSingle();

    if (error) {
      return { item: null, error: error.message };
    }
    if (!data) {
      return { item: null, error: null };
    }

    const row = data as {
      id: string;
      title: string;
      description: string;
      puzzle_enabled: boolean;
      storage_path: string;
      mime_type: string;
      width_px: number | null;
      height_px: number | null;
      created_at: string;
      profiles: { pseudo: string; is_banned: boolean } | { pseudo: string; is_banned: boolean }[];
    };

    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    if (!profile || profile.is_banned) {
      return { item: null, error: null };
    }

    return {
      item: {
        id: row.id,
        title: row.title,
        description: row.description,
        puzzle_enabled: row.puzzle_enabled,
        storage_path: row.storage_path,
        mime_type: row.mime_type,
        width_px: row.width_px,
        height_px: row.height_px,
        created_at: row.created_at,
        author_pseudo: profile.pseudo,
      },
      error: null,
    };
  }

  /**
   * URL signée pour afficher une image publique (bucket privé).
   * @param storagePath Chemin Storage.
   */
  async getSignedImageUrl(storagePath: string): Promise<string | null> {
    if (!this.supabase.isConfigured()) {
      return null;
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.storage
      .from('artworks')
      .createSignedUrl(storagePath, 60 * 60);

    if (error || !data?.signedUrl) {
      return null;
    }
    return data.signedUrl;
  }
}
