import type { Profile } from '../../../core/auth/models/profile.model';

/**
 * Compte affiché dans l'Admin (profil + e-mail Auth).
 */
export interface AdminAccount extends Profile {
  /** E-mail de connexion (auth.users), null si absent. */
  email: string | null;
}

/** Critères de tri de la liste Admin. */
export type AdminAccountSortField = 'pseudo' | 'email' | 'created_at';
