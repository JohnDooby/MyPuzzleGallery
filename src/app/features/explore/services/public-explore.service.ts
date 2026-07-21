import { Injectable, inject } from '@angular/core';

import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';

import type { PublicArtwork } from '../models/public-artwork.model';

/**
 * Lecture des œuvres publiques (accueil carousel + feed explore).
 * Accessible anonymement via RLS / RPC.
 */
@Injectable({ providedIn: 'root' })
export class PublicExploreService {
  private readonly supabase = inject(SupabaseClientService);

  /**
   * Liste les dernières œuvres publiques (max 20).
   * @param limit Nombre max (plafonné à 20 côté SQL).
   */
  async listLatestPublic(limit = 20): Promise<{ items: PublicArtwork[]; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { items: [], error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.rpc('list_public_artworks', {
      limit_count: limit,
    });

    if (error) {
      return { items: [], error: error.message };
    }

    return { items: (data ?? []) as PublicArtwork[], error: null };
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
