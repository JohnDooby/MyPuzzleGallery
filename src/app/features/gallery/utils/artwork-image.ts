/**
 * Constantes médias alignées sur E10-F05.
 */
export const ARTWORK_MAX_LONG_EDGE_PX = 2048;
export const ARTWORK_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
export const ARTWORK_MAX_INPUT_BYTES = 10 * 1024 * 1024;
export const ARTWORK_JPEG_QUALITY = 0.8;
export const ARTWORK_ALLOWED_MIME = ['image/png', 'image/jpeg'] as const;

export type ArtworkMimeType = (typeof ARTWORK_ALLOWED_MIME)[number];

/**
 * Image prête pour l'upload Storage (après resize / compression client).
 */
export interface PreparedArtworkImage {
  blob: Blob;
  mimeType: ArtworkMimeType;
  width: number;
  height: number;
  extension: 'png' | 'jpg';
}

/**
 * Valide le type MIME d'un fichier choisi.
 * @param file Fichier source.
 * @returns Message d'erreur ou null si OK.
 */
export function validateArtworkFileType(file: File): string | null {
  const type = file.type.toLowerCase();
  if (type === 'image/gif') {
    return 'Les GIF ne sont pas acceptés. Utilisez un PNG ou un JPEG.';
  }
  if (type === 'image/heic' || type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    return 'Format HEIC non supporté. Exportez la photo en JPEG depuis Photos.';
  }
  if (!ARTWORK_ALLOWED_MIME.includes(type as ArtworkMimeType)) {
    return 'Formats acceptés : PNG ou JPEG uniquement.';
  }
  return null;
}

/**
 * Valide la taille du fichier brut avant traitement.
 * @param file Fichier source.
 * @returns Message d'erreur ou null si OK.
 */
export function validateArtworkInputSize(file: File): string | null {
  if (file.size > ARTWORK_MAX_INPUT_BYTES) {
    return 'Fichier trop volumineux (max 10 Mo avant compression).';
  }
  return null;
}

/**
 * Redimensionne et compresse une image pour upload (conserve PNG ou JPEG).
 * @param file Fichier image source.
 * @returns Image préparée.
 */
export async function prepareArtworkImage(file: File): Promise<PreparedArtworkImage> {
  const typeError = validateArtworkFileType(file);
  if (typeError) {
    throw new Error(typeError);
  }
  const sizeError = validateArtworkInputSize(file);
  if (sizeError) {
    throw new Error(sizeError);
  }

  const mimeType = file.type.toLowerCase() as ArtworkMimeType;
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithinLongEdge(bitmap.width, bitmap.height, ARTWORK_MAX_LONG_EDGE_PX);

  try {
    if (mimeType === 'image/jpeg') {
      return await encodeJpeg(bitmap, width, height);
    }
    return await encodePng(bitmap, width, height);
  } finally {
    bitmap.close();
  }
}

/**
 * Calcule une taille contenue dans un côté long max.
 */
function fitWithinLongEdge(
  srcW: number,
  srcH: number,
  maxLongEdge: number,
): { width: number; height: number } {
  const longEdge = Math.max(srcW, srcH);
  if (longEdge <= maxLongEdge) {
    return { width: srcW, height: srcH };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(srcW * scale)),
    height: Math.max(1, Math.round(srcH * scale)),
  };
}

/**
 * Encode en JPEG avec baisse progressive de qualité si besoin.
 */
async function encodeJpeg(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<PreparedArtworkImage> {
  let w = width;
  let h = height;
  let quality = ARTWORK_JPEG_QUALITY;

  for (let attempt = 0; attempt < 8; attempt++) {
    const blob = await canvasToBlob(bitmap, w, h, 'image/jpeg', quality);
    if (blob.size <= ARTWORK_MAX_OUTPUT_BYTES) {
      return { blob, mimeType: 'image/jpeg', width: w, height: h, extension: 'jpg' };
    }
    if (quality > 0.5) {
      quality -= 0.1;
    } else {
      w = Math.max(1, Math.round(w * 0.85));
      h = Math.max(1, Math.round(h * 0.85));
      quality = ARTWORK_JPEG_QUALITY;
    }
  }

  throw new Error('Impossible de compresser l’image sous 2 Mo. Essayez une autre photo.');
}

/**
 * Encode en PNG avec réduction progressive de résolution si besoin.
 */
async function encodePng(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<PreparedArtworkImage> {
  let w = width;
  let h = height;

  for (let attempt = 0; attempt < 10; attempt++) {
    const blob = await canvasToBlob(bitmap, w, h, 'image/png');
    if (blob.size <= ARTWORK_MAX_OUTPUT_BYTES) {
      return { blob, mimeType: 'image/png', width: w, height: h, extension: 'png' };
    }
    w = Math.max(1, Math.round(w * 0.85));
    h = Math.max(1, Math.round(h * 0.85));
  }

  throw new Error('Impossible de réduire le PNG sous 2 Mo. Essayez un JPEG ou une image plus simple.');
}

/**
 * Dessine le bitmap sur un canvas et produit un Blob.
 */
async function canvasToBlob(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mimeType: ArtworkMimeType,
  quality?: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas indisponible sur cet appareil.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    if (mimeType === 'image/jpeg') {
      canvas.toBlob((result) => resolve(result), mimeType, quality);
    } else {
      canvas.toBlob((result) => resolve(result), mimeType);
    }
  });

  if (!blob) {
    throw new Error('Échec de la compression de l’image.');
  }
  return blob;
}
