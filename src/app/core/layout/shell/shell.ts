import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { APP_BRANDING } from '../../branding/app-branding';

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
}
