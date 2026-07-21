import { Routes } from '@angular/router';

import { requireAuthGuard } from '../../core/auth/guards/require-auth.guard';

/**
 * Routes de la feature Galerie (lazy) — mes œuvres + publication.
 */
export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [requireAuthGuard],
    loadComponent: () =>
      import('./components/gallery-page/gallery-page').then((m) => m.GalleryPage),
  },
  {
    path: 'publish',
    canActivate: [requireAuthGuard],
    loadComponent: () =>
      import('./components/publish-page/publish-page').then((m) => m.PublishPage),
  },
];
