import { Component, inject, signal } from '@angular/core';

import { AuthService } from '../../../../core/auth/auth.service';
import { LoginForm } from '../login-form/login-form';
import { SignupForm } from '../signup-form/signup-form';

/** Mode d'affichage de la page compte. */
type AuthViewMode = 'login' | 'signup';

/**
 * Page compte : connexion, inscription ou état connecté.
 */
@Component({
  selector: 'app-auth-page',
  imports: [LoginForm, SignupForm],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  private readonly auth = inject(AuthService);

  /** Session et profil (AuthService). */
  protected readonly isLoading = this.auth.isLoading;
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly pseudo = this.auth.pseudo;
  protected readonly role = this.auth.role;

  /** Onglet actif lorsque l'utilisateur n'est pas connecté. */
  protected readonly viewMode = signal<AuthViewMode>('login');

  /** true pendant la déconnexion. */
  protected readonly isSigningOut = signal(false);

  /**
   * Bascule vers l'onglet connexion.
   */
  protected showLogin(): void {
    this.viewMode.set('login');
  }

  /**
   * Bascule vers l'onglet inscription.
   */
  protected showSignup(): void {
    this.viewMode.set('signup');
  }

  /**
   * Déconnecte l'utilisateur courant.
   */
  protected async onSignOut(): Promise<void> {
    this.isSigningOut.set(true);
    await this.auth.signOut();
    this.isSigningOut.set(false);
    this.viewMode.set('login');
  }
}
