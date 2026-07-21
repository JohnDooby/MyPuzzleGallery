import { Routes } from '@angular/router';

/**
 * Routes Explore (feed lightbox public).
 */
export const EXPLORE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/explore-feed-page/explore-feed-page').then((m) => m.ExploreFeedPage),
  },
  {
    path: ':artworkId',
    loadComponent: () =>
      import('./components/explore-feed-page/explore-feed-page').then((m) => m.ExploreFeedPage),
  },
];
