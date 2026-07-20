import { Component, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import { APP_BRANDING } from './core/branding/app-branding';
import { PwaInstallPrompt } from './shared/components/pwa-install-prompt/pwa-install-prompt';

/**
 * Composant racine de l'application.
 * Affiche le routeur et la proposition d'installation PWA.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallPrompt],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly titleService = inject(Title);

  /** Titre applicatif (branding centralisé). */
  protected readonly title = signal(APP_BRANDING.name);

  /**
   * Aligne le titre d'onglet navigateur sur le branding.
   */
  ngOnInit(): void {
    this.titleService.setTitle(APP_BRANDING.name);
  }
}
