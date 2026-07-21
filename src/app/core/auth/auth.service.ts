import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';

import { SupabaseClientService } from '../supabase/supabase-client.service';

import type { AuthResult } from './models/auth-result.model';
import { PROFILE_SELECT_COLUMNS, type Profile } from './models/profile.model';

/** Longueur minimale du mot de passe (alignée sur Supabase Auth). */
const MIN_PASSWORD_LENGTH = 6;

/** Longueur autorisée du pseudo (contrainte BDD). */
const PSEUDO_MIN_LENGTH = 2;
const PSEUDO_MAX_LENGTH = 32;

/**
 * Session Supabase, profil `profiles` et actions Auth (inscription, connexion, déconnexion).
 * Écoute `onAuthStateChange` pour restaurer la session persistée au démarrage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService);

  private readonly sessionSignal = signal<Session | null>(null);
  private readonly profileSignal = signal<Profile | null>(null);
  private readonly loadingSignal = signal(true);

  /** Session JWT courante, ou null si déconnecté. */
  readonly session = this.sessionSignal.asReadonly();

  /** Profil applicatif du compte connecté. */
  readonly profile = this.profileSignal.asReadonly();

  /** true pendant le chargement initial de la session / profil. */
  readonly isLoading = this.loadingSignal.asReadonly();

  /** true si une session valide est active. */
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);

  /** Pseudo affichable, ou null si absent / déconnecté. */
  readonly pseudo = computed(() => this.profileSignal()?.pseudo ?? null);

  /** Rôle du compte connecté. */
  readonly role = computed(() => this.profileSignal()?.role ?? null);

  /** Admin ou SuperAdmin (modération / back-office). */
  readonly isStaff = computed(() => {
    const role = this.role();
    return role === 'admin' || role === 'superadmin';
  });

  /** SuperAdmin uniquement. */
  readonly isSuperAdmin = computed(() => this.role() === 'superadmin');

  constructor() {
    void this.bootstrap();
  }

  /**
   * Inscription d'un nouveau compte Normal (pseudo passé en metadata pour le trigger SQL).
   * @param email Adresse e-mail de connexion.
   * @param password Mot de passe.
   * @param pseudo Pseudo public (2–32 caractères).
   */
  async signUp(email: string, password: string, pseudo: string): Promise<AuthResult> {
    if (!this.supabase.isConfigured()) {
      return { success: false, message: 'Supabase non configuré sur cet environnement.' };
    }

    const pseudoError = this.validatePseudo(pseudo);
    if (pseudoError) {
      return { success: false, message: pseudoError };
    }

    const passwordError = this.validatePassword(password);
    if (passwordError) {
      return { success: false, message: passwordError };
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail.includes('@')) {
      return { success: false, message: 'Adresse e-mail invalide.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { pseudo: pseudo.trim() },
      },
    });

    if (error) {
      return { success: false, message: this.mapSupabaseError(error.message) };
    }

    if (data.session) {
      await this.applySession(data.session);
    }

    return { success: true };
  }

  /**
   * Connexion avec e-mail et mot de passe.
   * @param email Adresse e-mail.
   * @param password Mot de passe.
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!this.supabase.isConfigured()) {
      return { success: false, message: 'Supabase non configuré sur cet environnement.' };
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, message: this.mapSupabaseError(error.message) };
    }

    await this.applySession(data.session);
    return { success: true };
  }

  /**
   * Déconnexion et purge locale session + profil.
   */
  async signOut(): Promise<void> {
    if (!this.supabase.isConfigured()) {
      this.sessionSignal.set(null);
      this.profileSignal.set(null);
      return;
    }

    const client = this.supabase.getClient();
    await client.auth.signOut();
    this.sessionSignal.set(null);
    this.profileSignal.set(null);
  }

  /**
   * Met à jour le pseudo du compte connecté.
   * @param pseudo Nouveau pseudo (2–32 caractères).
   */
  async updatePseudo(pseudo: string): Promise<AuthResult> {
    const pseudoError = this.validatePseudo(pseudo);
    if (pseudoError) {
      return { success: false, message: pseudoError };
    }

    const userId = this.sessionSignal()?.user.id;
    if (!userId) {
      return { success: false, message: 'Connectez-vous pour modifier votre pseudo.' };
    }

    const client = this.supabase.getClient();
    const trimmed = pseudo.trim();
    const { data, error } = await client
      .from('profiles')
      .update({ pseudo: trimmed })
      .eq('id', userId)
      .select(PROFILE_SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      return { success: false, message: this.mapSupabaseError(error.message) };
    }

    if (!data) {
      return { success: false, message: 'Profil introuvable.' };
    }

    this.profileSignal.set(data as Profile);
    return { success: true };
  }

  /**
   * Recharge le profil depuis Supabase (après changement côté serveur).
   */
  async refreshProfile(): Promise<void> {
    const userId = this.sessionSignal()?.user.id;
    if (!userId) {
      return;
    }
    await this.loadProfile(userId);
  }

  /**
   * Restaure la session persistée et s'abonne aux changements Auth.
   */
  private async bootstrap(): Promise<void> {
    if (!this.supabase.isConfigured()) {
      this.loadingSignal.set(false);
      return;
    }

    const client = this.supabase.getClient();

    const {
      data: { session },
    } = await client.auth.getSession();
    await this.applySession(session);

    client.auth.onAuthStateChange((_event, session) => {
      void this.applySession(session);
    });

    this.loadingSignal.set(false);
  }

  /**
   * Applique une session : met à jour le signal et charge le profil si connecté.
   */
  private async applySession(session: Session | null): Promise<void> {
    this.sessionSignal.set(session);

    if (!session) {
      this.profileSignal.set(null);
      return;
    }

    await this.loadProfile(session.user.id);
  }

  /**
   * Charge le profil `profiles` ; déconnecte si le compte est banni.
   */
  private async loadProfile(userId: string): Promise<void> {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('profiles')
      .select(PROFILE_SELECT_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Auth] Erreur chargement profil', error.message);
      this.profileSignal.set(null);
      return;
    }

    if (!data) {
      this.profileSignal.set(null);
      return;
    }

    const profile = data as Profile;

    if (profile.is_banned) {
      await this.signOut();
      return;
    }

    this.profileSignal.set(profile);
  }

  /**
   * Valide la longueur du pseudo avant envoi.
   */
  private validatePseudo(pseudo: string): string | null {
    const trimmed = pseudo.trim();
    if (trimmed.length < PSEUDO_MIN_LENGTH || trimmed.length > PSEUDO_MAX_LENGTH) {
      return `Le pseudo doit contenir entre ${PSEUDO_MIN_LENGTH} et ${PSEUDO_MAX_LENGTH} caractères.`;
    }
    return null;
  }

  /**
   * Valide la longueur du mot de passe avant envoi.
   */
  private validatePassword(password: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    return null;
  }

  /**
   * Traduit les messages Supabase courants en français pour l'UI.
   */
  private mapSupabaseError(message: string): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
      return 'E-mail ou mot de passe incorrect.';
    }
    if (normalized.includes('user already registered')) {
      return 'Un compte existe déjà avec cette adresse e-mail.';
    }
    if (normalized.includes('duplicate key') || normalized.includes('profiles_pseudo_lower')) {
      return 'Ce pseudo est déjà utilisé.';
    }
    if (normalized.includes('email not confirmed')) {
      return 'Confirmez votre e-mail avant de vous connecter.';
    }

    return message;
  }
}
