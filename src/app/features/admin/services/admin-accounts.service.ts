import { Injectable, inject } from '@angular/core';

import type { AuthResult } from '../../../core/auth/models/auth-result.model';
import type { AppRole } from '../../../core/auth/models/app-role.model';
import type { Profile } from '../../../core/auth/models/profile.model';
import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';

import type { AdminAccount } from '../models/admin-account.model';

/**
 * Gestion des comptes côté Admin / SuperAdmin.
 * - Lecture : staff (RPC admin_list_profiles)
 * - Ban : Admin + SuperAdmin (RLS + trigger)
 * - Rôle : SuperAdmin uniquement
 */
@Injectable({ providedIn: 'root' })
export class AdminAccountsService {
  private readonly supabase = inject(SupabaseClientService);

  /**
   * Liste tous les comptes (profil + e-mail) via RPC staff-only.
   * @returns Comptes ou message d'erreur.
   */
  async listAccounts(): Promise<{ accounts: AdminAccount[]; error: string | null }> {
    if (!this.supabase.isConfigured()) {
      return { accounts: [], error: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.rpc('admin_list_profiles');

    if (error) {
      return { accounts: [], error: error.message };
    }

    return { accounts: (data ?? []) as AdminAccount[], error: null };
  }

  /**
   * Change le rôle d'un compte (SuperAdmin uniquement côté RLS).
   * @param profileId Identifiant du profil cible.
   * @param role Nouveau rôle (`normal` ou `admin` uniquement via l'UI).
   */
  async setRole(profileId: string, role: Extract<AppRole, 'normal' | 'admin'>): Promise<AuthResult> {
    return this.updatePrivileges(profileId, { role });
  }

  /**
   * Bannit ou débannit un compte (Admin ou SuperAdmin côté RLS).
   * @param profileId Identifiant du profil cible.
   * @param isBanned true pour bannir.
   */
  async setBanned(profileId: string, isBanned: boolean): Promise<AuthResult> {
    return this.updatePrivileges(profileId, { is_banned: isBanned });
  }

  /**
   * Met à jour rôle et/ou ban sur un profil.
   */
  private async updatePrivileges(
    profileId: string,
    patch: Partial<Pick<Profile, 'role' | 'is_banned'>>,
  ): Promise<AuthResult> {
    if (!this.supabase.isConfigured()) {
      return { success: false, message: 'Supabase non configuré.' };
    }

    const client = this.supabase.getClient();
    const { error } = await client.from('profiles').update(patch).eq('id', profileId);

    if (error) {
      return { success: false, message: this.mapError(error.message) };
    }

    return { success: true };
  }

  /**
   * Traduit les erreurs courantes pour l'UI.
   */
  private mapError(message: string): string {
    const normalized = message.toLowerCase();
    if (normalized.includes('rôle') || normalized.includes('role')) {
      return 'Action réservée aux SuperAdmin.';
    }
    if (normalized.includes('is_banned') || normalized.includes('staff')) {
      return 'Action réservée aux Admin / SuperAdmin.';
    }
    return message;
  }
}
