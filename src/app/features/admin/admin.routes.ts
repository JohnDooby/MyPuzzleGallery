import { Routes } from '@angular/router';

import { requireRolesGuard } from '../../core/auth/guards/require-roles.guard';

const staffGuard = requireRolesGuard(['admin', 'superadmin']);

/**
 * Routes Admin (lazy) — Comptes + Modération, réservées Admin / SuperAdmin.
 */
export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'accounts' },
  {
    path: 'accounts',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./components/admin-accounts-page/admin-accounts-page').then(
        (m) => m.AdminAccountsPage,
      ),
  },
  {
    path: 'moderation',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./components/admin-moderation-page/admin-moderation-page').then(
        (m) => m.AdminModerationPage,
      ),
  },
];
