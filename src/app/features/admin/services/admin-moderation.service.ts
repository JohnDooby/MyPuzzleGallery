import { Injectable, inject } from '@angular/core';

import type { AuthResult } from '../../../core/auth/models/auth-result.model';
import { AuthService } from '../../../core/auth/auth.service';
import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';
import type { ArtworkVisibility } from '../../gallery/models/artwork.model';

import type { ModerationEventRow, PendingArtwork } from '../models/moderation.model';

/**
 * File de modération et mini-journal (Admin / SuperAdmin).
 */
@Injectable({ providedIn: 'root' })
export class AdminModerationService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly auth = inject(AuthService);

  /**
   * Liste les œuvres en attente de validation publique.
   */
  async listPending(): Promise<{ items: PendingArtwork[]; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { items: [], error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.rpc('admin_list_pending_artworks');

    if (error) {
      return { items: [], error: error.message };
    }

    return { items: (data ?? []) as PendingArtwork[], error: null };
  }

  /**
   * Dernières décisions de modération.
   * @param limit Nombre max d'événements.
   */
  async listEvents(limit = 20): Promise<{ events: ModerationEventRow[]; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { events: [], error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.rpc('admin_list_moderation_events', {
      limit_count: limit,
    });

    if (error) {
      return { events: [], error: error.message };
    }

    return { events: (data ?? []) as ModerationEventRow[], error: null };
  }

  /**
   * URL signée pour aperçu (staff).
   * @param storagePath Chemin Storage.
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
   * Valide une œuvre (pending_public → public) et journalise.
   * @param artworkId Identifiant de l'œuvre.
   */
  async approve(artworkId: string): Promise<AuthResult> {
    return this.decide(artworkId, 'approved', 'public');
  }

  /**
   * Refuse une œuvre (pending_public → rejected) et journalise.
   * @param artworkId Identifiant de l'œuvre.
   */
  async reject(artworkId: string): Promise<AuthResult> {
    return this.decide(artworkId, 'rejected', 'rejected');
  }

  /**
   * Applique la décision + insert moderation_events.
   */
  private async decide(
    artworkId: string,
    decision: 'approved' | 'rejected',
    newStatus: ArtworkVisibility,
  ): Promise<AuthResult> {
    const actorId = this.auth.session()?.user.id;
    if (!actorId) {
      return { success: false, message: 'Session invalide.' };
    }

    const client = this.supabase.getClient();
    const { data: artwork, error: loadError } = await client
      .from('artworks')
      .select('id, visibility_status')
      .eq('id', artworkId)
      .maybeSingle();

    if (loadError || !artwork) {
      return { success: false, message: loadError?.message ?? 'Œuvre introuvable.' };
    }

    const previousStatus = artwork.visibility_status as ArtworkVisibility;
    if (previousStatus !== 'pending_public') {
      return { success: false, message: 'Cette œuvre n’est plus en attente de modération.' };
    }

    const { error: updateError } = await client
      .from('artworks')
      .update({ visibility_status: newStatus })
      .eq('id', artworkId)
      .eq('visibility_status', 'pending_public');

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    const { error: auditError } = await client.from('moderation_events').insert({
      artwork_id: artworkId,
      actor_id: actorId,
      decision,
      previous_status: previousStatus,
      new_status: newStatus,
    });

    if (auditError) {
      console.warn('[Moderation] Journal non enregistré', auditError.message);
    }

    return { success: true };
  }
}
