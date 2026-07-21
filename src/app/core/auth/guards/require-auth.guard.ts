import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth.service';

import { waitForAuthReady } from './wait-for-auth-ready';

/**
 * Garde : nécessite une session Auth valide.
 * Redirect vers la page Compte (`/auth`) si non authentifié.
 */
export const requireAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  await waitForAuthReady(auth);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/auth');
};
