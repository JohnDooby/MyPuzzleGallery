import { Routes } from '@angular/router';

/**
 * Routes de la feature Accueil (lazy).
 */
export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./home-page').then((m) => m.HomePage),
  },
];
