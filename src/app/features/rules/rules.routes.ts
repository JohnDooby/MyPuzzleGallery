import { Routes } from '@angular/router';

/**
 * Routes de la feature Règles & sécurité (lazy).
 */
export const RULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/rules-page/rules-page').then((m) => m.RulesPage),
  },
];
