/**
 * Payload de création d'une œuvre (après compression client).
 */
export interface CreateArtworkInput {
  title: string;
  description: string;
  hoursSpent: number | null;
  galleryId: string;
  requestPublic: boolean;
  puzzleEnabled: boolean;
  imageBlob: Blob;
  mimeType: 'image/png' | 'image/jpeg';
  extension: 'png' | 'jpg';
  widthPx: number;
  heightPx: number;
}
