/**
 * Galerie personnelle de rangement.
 */
export interface Gallery {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Colonnes SELECT galeries. */
export const GALLERY_SELECT_COLUMNS = 'id, owner_id, name, created_at, updated_at';
