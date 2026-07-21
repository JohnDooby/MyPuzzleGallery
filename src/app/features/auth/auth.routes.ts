import { Routes } from '@angular/router';

/**
 * Routes de la feature Auth (lazy) — stub en attendant E04.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-page').then((m) => m.AuthPage),
  },
];
