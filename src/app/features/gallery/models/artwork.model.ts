/**
 * Statut de visibilité d'une œuvre (aligné sur l'enum PostgreSQL).
 */
export type ArtworkVisibility = 'private' | 'pending_public' | 'public' | 'rejected';

/**
 * Œuvre (métadonnées applicatives).
 */
export interface Artwork {
  id: string;
  owner_id: string;
  gallery_id: string;
  title: string;
  description: string;
  hours_spent: number | null;
  visibility_status: ArtworkVisibility;
  puzzle_enabled: boolean;
  storage_path: string;
  mime_type: string;
  byte_size: number;
  width_px: number | null;
  height_px: number | null;
  was_public: boolean;
  created_at: string;
  updated_at: string;
}

/** Colonnes SELECT pour les listes auteur. */
export const ARTWORK_SELECT_COLUMNS =
  'id, owner_id, gallery_id, title, description, hours_spent, visibility_status, puzzle_enabled, storage_path, mime_type, byte_size, width_px, height_px, was_public, created_at, updated_at';
