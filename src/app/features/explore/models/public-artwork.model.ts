/**
 * Œuvre publique affichée en carousel / feed (sans e-mail ni données civiles).
 */
export interface PublicArtwork {
  id: string;
  title: string;
  description: string;
  puzzle_enabled: boolean;
  storage_path: string;
  mime_type: string;
  width_px: number | null;
  height_px: number | null;
  created_at: string;
  author_pseudo: string;
}
