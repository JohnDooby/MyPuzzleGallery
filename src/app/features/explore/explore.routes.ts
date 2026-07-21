import { Routes } from '@angular/router';

/**
 * Routes Explore — grille publique + feed lightbox.
 */
export const EXPLORE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/explore-gallery-page/explore-gallery-page').then(
        (m) => m.ExploreGalleryPage,
      ),
  },
  {
    path: ':artworkId',
    loadComponent: () =>
      import('./components/explore-feed-page/explore-feed-page').then((m) => m.ExploreFeedPage),
  },
];
