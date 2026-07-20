import { Component, OnInit, inject, signal } from '@angular/core';

import { APP_BRANDING } from '../../../core/branding/app-branding';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

/** Délai avant d'afficher automatiquement la popup (laisse charger la page). */
const AUTO_SHOW_DELAY_MS = 1200;

/**
 * Bannière / bottom-sheet proposant l'installation PWA.
 * - Chromium : bouton qui ouvre le dialogue natif (sans passer par le menu ⋮).
 * - iOS : instructions « Partager → Sur l'écran d'accueil ».
 */
@Component({
  selector: 'app-pwa-install-prompt',
  imports: [],
  templateUrl: './pwa-install-prompt.html',
  styleUrl: './pwa-install-prompt.scss',
})
export class PwaInstallPrompt implements OnInit {
  private readonly pwaInstall = inject(PwaInstallService);

  /** Nom complet de l'appli (issu du branding centralisé). */
  protected readonly appName = APP_BRANDING.name;

  /** Visibilité de la popup. */
  protected readonly visible = signal(false);

  /** Mode iOS (instructions) vs install native. */
  protected readonly isIos = this.pwaInstall.isIos;

  ngOnInit(): void {
    // --- Proposition automatique si les conditions sont réunies ---
    window.setTimeout(() => this.tryShow(), AUTO_SHOW_DELAY_MS);

    // Sur Android, beforeinstallprompt peut arriver après le premier timeout.
    window.addEventListener('beforeinstallprompt', () => {
      window.setTimeout(() => this.tryShow(), 300);
    });
  }

  /**
   * Affiche la popup si l'installation n'est pas déjà faite / reportée.
   */
  private tryShow(): void {
    if (this.pwaInstall.shouldOfferInstall()) {
      this.visible.set(true);
    }
  }

  /**
   * Lance le dialogue d'installation natif du navigateur.
   */
  protected async onInstall(): Promise<void> {
    const accepted = await this.pwaInstall.promptInstall();
    if (accepted) {
      this.visible.set(false);
    }
  }

  /**
   * Ferme la popup et reporte la proposition.
   */
  protected onDismiss(): void {
    this.pwaInstall.dismissTemporarily();
    this.visible.set(false);
  }
}
