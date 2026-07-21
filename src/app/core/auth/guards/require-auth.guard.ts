import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth.service';

/**
 * Garde : nécessite une session Auth valide.
 * Redirect vers la page Compte (`/auth`) si non authentifié.
 */
export const requireAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/auth');
};

