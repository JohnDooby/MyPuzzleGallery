import { Injectable, signal } from '@angular/core';

/** Clé localStorage — acceptation du disclaimer 1er usage. */
const DISCLAIMER_STORAGE_KEY = 'mpg.disclaimer.accepted';

/**
 * Mémorise l'acceptation du disclaimer sur le device (localStorage).
 */
@Injectable({ providedIn: 'root' })
export class DisclaimerService {
  /** true si l'utilisateur a déjà accepté sur ce device. */
  readonly isAccepted = signal(this.readAccepted());

  /**
   * Indique si le bandeau doit être affiché.
   */
  shouldShow(): boolean {
    return !this.isAccepted();
  }

  /**
   * Enregistre l'acceptation et masque le bandeau.
   */
  accept(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, '1');
    }
    this.isAccepted.set(true);
  }

  /**
   * Lit l'acceptation depuis localStorage.
   */
  private readAccepted(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) === '1';
  }
}
