import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import type { AppRole } from '../models/app-role.model';

/**
 * Garde : nécessite un rôle parmi une liste.
 * Redirect :
 * - non authentifié -> `/auth`
 * - authentifié mais rôle insuffisant -> `/`
 */
export const requireRolesGuard =
  (allowedRoles: AppRole[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const isAuthenticated = auth.isAuthenticated();
    if (!isAuthenticated) {
      return router.parseUrl('/auth');
    }

    const role = auth.role();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.parseUrl('/');
  };

