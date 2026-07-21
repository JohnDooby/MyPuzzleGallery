/**
 * Payload de mise à jour d'une œuvre (sans remplacement d'image).
 */
export interface UpdateArtworkInput {
  title: string;
  description: string;
  hoursSpent: number | null;
  galleryId: string;
  /** true = demander / rester en file ; false = privée. */
  requestPublic: boolean;
  puzzleEnabled: boolean;
}
