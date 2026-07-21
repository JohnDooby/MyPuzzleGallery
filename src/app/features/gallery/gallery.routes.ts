import { Routes } from '@angular/router';

/**
 * Routes de la feature Galerie (lazy) — stub en attendant E01/E03.
 */
export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./gallery-page').then((m) => m.GalleryPage),
  },
];
