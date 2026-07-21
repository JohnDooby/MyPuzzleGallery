import type { Artwork, ArtworkVisibility } from '../../gallery/models/artwork.model';

/**
 * Œuvre en file de modération (avec pseudo auteur).
 */
export interface PendingArtwork extends Artwork {
  author_pseudo: string;
}

/**
 * Entrée du mini-journal de modération.
 */
export interface ModerationEventRow {
  id: string;
  artwork_id: string;
  artwork_title: string;
  author_pseudo: string;
  actor_pseudo: string;
  decision: 'approved' | 'rejected';
  previous_status: ArtworkVisibility;
  new_status: ArtworkVisibility;
  created_at: string;
}
