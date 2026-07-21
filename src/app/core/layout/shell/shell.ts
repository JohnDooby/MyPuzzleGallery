import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { APP_BRANDING } from '../../branding/app-branding';
import { AuthService } from '../../auth/auth.service';

/**
 * Coquille applicative : en-tête de navigation et zone de contenu (router-outlet).
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  /** Nom affiché dans le header (branding). */
  protected readonly appName = APP_BRANDING.name;

  /** Nom court pour l'espace réduit. */
  protected readonly shortName = APP_BRANDING.shortName;

  private readonly auth = inject(AuthService);

  /** true si un utilisateur est connecté. */
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  /** Pseudo public du compte connecté. */
  protected readonly pseudo = this.auth.pseudo;

  /** true si Admin ou SuperAdmin (lien Admin visible). */
  protected readonly isStaff = this.auth.isStaff;

  /**
   * Déconnecte l'utilisateur courant.
   * Le state UI se met à jour via les signaux du `AuthService`.
   */
  protected async onSignOut(): Promise<void> {
    await this.auth.signOut();
  }
}
