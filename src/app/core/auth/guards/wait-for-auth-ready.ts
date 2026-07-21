import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom, take } from 'rxjs';

import { AuthService } from '../auth.service';

/**
 * Attend la fin du bootstrap Auth (`isLoading === false`).
 * Le `AuthService` doit être injecté **avant** l'appel (contexte d'injection du guard).
 * @param auth Instance AuthService déjà injectée.
 */
export async function waitForAuthReady(auth: AuthService): Promise<void> {
  if (!auth.isLoading()) {
    return;
  }

  // toObservable() doit être créé encore dans le contexte sync du guard.
  const ready$ = toObservable(auth.isLoading).pipe(
    filter((loading) => !loading),
    take(1),
  );

  await firstValueFrom(ready$);
}
