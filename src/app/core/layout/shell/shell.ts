import { Component, HostListener, inject, signal } from '@angular/core';
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

  /** true si Admin ou SuperAdmin (menu Admin visible). */
  protected readonly isStaff = this.auth.isStaff;

  /** Menu déroulant Admin ouvert. */
  protected readonly adminMenuOpen = signal(false);

  /**
   * Ferme le menu Admin si clic en dehors.
   */
  @HostListener('document:click')
  protected onDocumentClick(): void {
    if (this.adminMenuOpen()) {
      this.adminMenuOpen.set(false);
    }
  }

  /**
   * Ouvre / ferme le menu Admin (stoppe la propagation pour ne pas se refermer aussitôt).
   * @param event Clic sur le bouton.
   */
  protected toggleAdminMenu(event: Event): void {
    event.stopPropagation();
    this.adminMenuOpen.update((open) => !open);
  }

  /**
   * Empêche la fermeture immédiate quand on clique dans le panneau.
   * @param event Clic dans le panneau.
   */
  protected onAdminPanelClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Ferme le menu après navigation.
   */
  protected closeAdminMenu(): void {
    this.adminMenuOpen.set(false);
  }

  /**
   * Déconnecte l'utilisateur courant.
   */
  protected async onSignOut(): Promise<void> {
    await this.auth.signOut();
  }
}
