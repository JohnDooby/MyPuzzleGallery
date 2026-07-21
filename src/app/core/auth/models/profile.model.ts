import type { AppRole } from './app-role.model';

/**
 * Profil public lié 1–1 à un utilisateur Supabase Auth.
 */
export interface Profile {
  id: string;
  pseudo: string;
  role: AppRole;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

/** Colonnes lues côté client pour un profil. */
export const PROFILE_SELECT_COLUMNS = 'id, pseudo, role, is_banned, created_at, updated_at';
