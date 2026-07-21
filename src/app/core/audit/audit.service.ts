import { Injectable, inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { SupabaseClientService } from '../supabase/supabase-client.service';

import type { AuditAction, AuditEventRow, AuditLogInput } from './models/audit.model';

/**
 * Journal d'audit (écriture côté client + lecture staff via RPC).
 * L'IP n'est pas fiable sans Edge Function : colonne `client_ip` reste null au MVP.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly auth = inject(AuthService);

  /**
   * Enregistre une entrée d'audit (échec non bloquant pour l'appelant).
   * @param input Données de l'événement.
   */
  async log(input: AuditLogInput): Promise<void> {
    const actorId = this.auth.session()?.user.id;
    if (!actorId || !this.supabase.isConfigured()) {
      return;
    }

    const client = this.supabase.getClient();
    const { error } = await client.from('audit_events').insert({
      action: input.action,
      actor_id: actorId,
      artwork_id: input.artworkId ?? null,
      artwork_title: input.artworkTitle,
      artwork_description: input.artworkDescription,
      storage_path: input.storagePath ?? null,
      client_ip: null,
    });

    if (error) {
      console.warn('[Audit] Entrée non enregistrée', error.message);
    }
  }

  /**
   * Liste les événements pour le staff.
   * @param options Filtres optionnels.
   */
  async listEvents(options?: {
    limit?: number;
    action?: AuditAction | null;
    pseudo?: string | null;
  }): Promise<{ events: AuditEventRow[]; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { events: [], error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.rpc('admin_list_audit_events', {
      limit_count: options?.limit ?? 50,
      action_filter: options?.action ?? null,
      pseudo_filter: options?.pseudo?.trim() || null,
    });

    if (error) {
      return { events: [], error: error.message };
    }

    return { events: (data ?? []) as AuditEventRow[], error: null };
  }

  /**
   * URL signée pour aperçu (staff) si le fichier existe encore.
   * @param storagePath Chemin Storage.
   */
  async getSignedImageUrl(storagePath: string): Promise<string | null> {
    const client = this.supabase.getClient();
    const { data, error } = await client.storage
      .from('artworks')
      .createSignedUrl(storagePath, 60 * 30);

    if (error || !data?.signedUrl) {
      return null;
    }
    return data.signedUrl;
  }
}
