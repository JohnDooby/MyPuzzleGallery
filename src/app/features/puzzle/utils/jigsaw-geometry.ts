/**
 * Géométrie jigsaw client : grille, arêtes complémentaires, chemins SVG.
 * Coordonnées locales pièce : [0..100]² avec tenons hors cadre.
 */

/** Sens d'un tenon : 0 plat, 1 sortant, -1 rentrant. */
export type EdgeKind = 0 | 1 | -1;

export interface PieceEdges {
  top: EdgeKind;
  right: EdgeKind;
  bottom: EdgeKind;
  left: EdgeKind;
}

export interface PuzzlePieceDef {
  id: string;
  col: number;
  row: number;
  edges: PieceEdges;
  /** Chemin SVG viewBox -TAB..100+TAB. */
  pathD: string;
}

export interface PuzzleLayout {
  cols: number;
  rows: number;
  pieces: PuzzlePieceDef[];
}

/** Amplitude des tenons (unité pièce 0–100). */
export const JIGSAW_TAB = 18;

/** Grille MVP : 6×5 = 30 pièces. */
export const PUZZLE_COLS = 6;
export const PUZZLE_ROWS = 5;

/**
 * PRNG déterministe (mulberry32) à partir d'une graine string.
 * @param seed Identifiant œuvre.
 */
function mulberry32(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Construit le layout jigsaw (arêtes complémentaires + chemins).
 * @param artworkId Graine pour formes reproductibles.
 * @param cols Colonnes.
 * @param rows Lignes.
 */
export function buildPuzzleLayout(
  artworkId: string,
  cols = PUZZLE_COLS,
  rows = PUZZLE_ROWS,
): PuzzleLayout {
  const rand = mulberry32(artworkId);
  const rightEdges: EdgeKind[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols - 1 }, () => (rand() < 0.5 ? 1 : -1) as EdgeKind),
  );
  const bottomEdges: EdgeKind[][] = Array.from({ length: rows - 1 }, () =>
    Array.from({ length: cols }, () => (rand() < 0.5 ? 1 : -1) as EdgeKind),
  );

  const pieces: PuzzlePieceDef[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const edges: PieceEdges = {
        top: row === 0 ? 0 : ((-bottomEdges[row - 1][col]) as EdgeKind),
        right: col === cols - 1 ? 0 : rightEdges[row][col],
        bottom: row === rows - 1 ? 0 : bottomEdges[row][col],
        left: col === 0 ? 0 : ((-rightEdges[row][col - 1]) as EdgeKind),
      };
      pieces.push({
        id: `${col}-${row}`,
        col,
        row,
        edges,
        pathD: buildPiecePath(edges),
      });
    }
  }
  return { cols, rows, pieces };
}

/**
 * Mélange Fisher–Yates avec PRNG seedé.
 * @param items Tableau source (non muté).
 * @param seed Graine.
 */
export function shuffleSeeded<T>(items: T[], seed: string): T[] {
  const rand = mulberry32(`${seed}-shuffle`);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Trace une arête horizontale (gauche → droite) avec éventuel tenon.
 */
function hEdge(y: number, kind: EdgeKind, outwardSign: number): string {
  if (kind === 0) {
    return `L 100 ${y}`;
  }
  const bulge = outwardSign * kind * JIGSAW_TAB;
  const mid = 50;
  const neck = 35;
  const neck2 = 65;
  return [
    `L ${neck} ${y}`,
    `C ${neck} ${y}, ${mid - 12} ${y}, ${mid - 10} ${y + bulge * 0.35}`,
    `C ${mid - 6} ${y + bulge}, ${mid + 6} ${y + bulge}, ${mid + 10} ${y + bulge * 0.35}`,
    `C ${mid + 12} ${y}, ${neck2} ${y}, ${neck2} ${y}`,
    `L 100 ${y}`,
  ].join(' ');
}

/**
 * Trace une arête verticale (haut → bas) avec éventuel tenon.
 */
function vEdge(x: number, kind: EdgeKind, outwardSign: number): string {
  if (kind === 0) {
    return `L ${x} 100`;
  }
  const bulge = outwardSign * kind * JIGSAW_TAB;
  const mid = 50;
  const neck = 35;
  const neck2 = 65;
  return [
    `L ${x} ${neck}`,
    `C ${x} ${neck}, ${x} ${mid - 12}, ${x + bulge * 0.35} ${mid - 10}`,
    `C ${x + bulge} ${mid - 6}, ${x + bulge} ${mid + 6}, ${x + bulge * 0.35} ${mid + 10}`,
    `C ${x} ${mid + 12}, ${x} ${neck2}, ${x} ${neck2}`,
    `L ${x} 100`,
  ].join(' ');
}

/**
 * Trace une arête horizontale droite → gauche.
 */
function hEdgeReverse(y: number, kind: EdgeKind, outwardSign: number): string {
  if (kind === 0) {
    return `L 0 ${y}`;
  }
  const bulge = outwardSign * kind * JIGSAW_TAB;
  const mid = 50;
  const neck = 65;
  const neck2 = 35;
  return [
    `L ${neck} ${y}`,
    `C ${neck} ${y}, ${mid + 12} ${y}, ${mid + 10} ${y + bulge * 0.35}`,
    `C ${mid + 6} ${y + bulge}, ${mid - 6} ${y + bulge}, ${mid - 10} ${y + bulge * 0.35}`,
    `C ${mid - 12} ${y}, ${neck2} ${y}, ${neck2} ${y}`,
    `L 0 ${y}`,
  ].join(' ');
}

/**
 * Trace une arête verticale bas → haut.
 */
function vEdgeReverse(x: number, kind: EdgeKind, outwardSign: number): string {
  if (kind === 0) {
    return `L ${x} 0`;
  }
  const bulge = outwardSign * kind * JIGSAW_TAB;
  const mid = 50;
  const neck = 65;
  const neck2 = 35;
  return [
    `L ${x} ${neck}`,
    `C ${x} ${neck}, ${x} ${mid + 12}, ${x + bulge * 0.35} ${mid + 10}`,
    `C ${x + bulge} ${mid + 6}, ${x + bulge} ${mid - 6}, ${x + bulge * 0.35} ${mid - 10}`,
    `C ${x} ${mid - 12}, ${x} ${neck2}, ${x} ${neck2}`,
    `L ${x} 0`,
  ].join(' ');
}

/**
 * Construit le path SVG d'une pièce (sens horaire depuis coin haut-gauche).
 * @param edges Profils des 4 côtés.
 */
export function buildPiecePath(edges: PieceEdges): string {
  // top: outward = -Y ; right: +X ; bottom: +Y ; left: -X
  return [
    'M 0 0',
    hEdge(0, edges.top, -1),
    vEdge(100, edges.right, 1),
    hEdgeReverse(100, edges.bottom, 1),
    vEdgeReverse(0, edges.left, -1),
    'Z',
  ].join(' ');
}
