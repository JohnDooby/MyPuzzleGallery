import { Component, OnInit, inject, signal } from '@angular/core';

import { APP_BRANDING } from '../../core/branding/app-branding';
import { SupabaseClientService } from '../../core/supabase/supabase-client.service';

/**
 * Page d'accueil provisoire : smoke test shell + connexion Supabase.
 */
@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly supabase = inject(SupabaseClientService);

  /** Nom de l'application. */
  protected readonly appName = APP_BRANDING.name;

  /** Config Supabase présente dans l'environnement. */
  protected readonly isConfigured = this.supabase.isConfigured;

  /** Résultat du ping Auth (null = en cours / non lancé). */
  protected readonly authReachable = signal<boolean | null>(null);

  /**
   * Vérifie au chargement que Supabase répond (getSession).
   */
  ngOnInit(): void {
    void this.checkSupabase();
  }

  /**
   * Ping Auth Supabase pour valider URL + clé anon.
   */
  private async checkSupabase(): Promise<void> {
    if (!this.supabase.isConfigured()) {
      this.authReachable.set(false);
      return;
    }
    const ok = await this.supabase.pingAuth();
    this.authReachable.set(ok);
  }
}
