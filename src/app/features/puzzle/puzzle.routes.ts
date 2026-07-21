import { Routes } from '@angular/router';

/**
 * Routes Puzzle (plein écran, hors shell).
 */
export const PUZZLE_ROUTES: Routes = [
  {
    path: ':artworkId',
    loadComponent: () =>
      import('./components/puzzle-page/puzzle-page').then((m) => m.PuzzlePage),
  },
];
