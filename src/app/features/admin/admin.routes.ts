import { Routes } from '@angular/router';

import { requireRolesGuard } from '../../core/auth/guards/require-roles.guard';

/**
 * Routes de la feature Admin (lazy) — réservées Admin / SuperAdmin.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [requireRolesGuard(['admin', 'superadmin'])],
    loadComponent: () =>
      import('./components/admin-accounts-page/admin-accounts-page').then(
        (m) => m.AdminAccountsPage,
      ),
  },
];
