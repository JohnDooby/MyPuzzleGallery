import { Injectable, signal } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

/**
 * Accès unique au client Supabase (clé anon uniquement).
 * La sécurité des données repose sur Auth + RLS, pas sur l'obscurcissement de la clé.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  /** Indique si URL + clé anon sont présentes dans l'environnement. */
  readonly isConfigured = signal(this.hasConfig());

  /** Client Supabase, ou null si la config est absente. */
  private readonly client: SupabaseClient | null = this.createClientIfConfigured();

  /**
   * Retourne le client Supabase.
   * @returns Instance partagée du client.
   * @throws Si l'environnement n'est pas configuré.
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error(
        'Supabase non configuré : renseigner SUPABASE_URL et SUPABASE_ANON_KEY (fichier .env + npm run env:sync).',
      );
    }
    return this.client;
  }

  /**
   * Vérifie la connectivité Auth (session courante, sans exiger un login).
   * @returns true si l'appel réseau vers Supabase Auth réussit.
   */
  async pingAuth(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    const { error } = await this.client.auth.getSession();
    return !error;
  }

  /**
   * Indique si les variables d'environnement Supabase sont renseignées.
   */
  private hasConfig(): boolean {
    return Boolean(environment.supabaseUrl?.trim() && environment.supabaseAnonKey?.trim());
  }

  /**
   * Instancie le client si la config est valide.
   */
  private createClientIfConfigured(): SupabaseClient | null {
    if (!this.hasConfig()) {
      console.warn(
        '[Supabase] Configuration absente — créer un .env puis exécuter npm run env:sync.',
      );
      return null;
    }
    return createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
}
