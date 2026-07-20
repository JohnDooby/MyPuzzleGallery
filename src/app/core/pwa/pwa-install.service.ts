import { Injectable, signal } from '@angular/core';

/** Clé localStorage pour mémoriser un report / refus d'installation. */
const DISMISS_STORAGE_KEY = 'mpg-pwa-install-dismissed';

/** Durée pendant laquelle on ne repropose pas après « Plus tard » (7 jours). */
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Événement navigateur permettant de déclencher l'installation PWA
 * (Chromium / Android / Edge — absent sur iOS Safari).
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Service PWA : détecte si l'app est déjà installée et capture
 * l'événement d'installation native pour proposer une popup custom.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  /** True si l'app tourne déjà en mode installé (standalone / iOS home screen). */
  readonly isInstalled = signal(this.detectInstalled());

  /** True si une installation native est proposable (beforeinstallprompt reçu). */
  readonly canPromptNative = signal(false);

  /** True si l'appareil est un iPhone / iPad (instructions manuelles Safari). */
  readonly isIos = signal(this.detectIos());

  /** True si l'utilisateur a reporté récemment la proposition. */
  readonly isDismissed = signal(this.readDismissed());

  /** Événement différé fourni par le navigateur (null hors Chromium). */
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    // --- Écoute de l'événement d'install natif (Android / Chrome / Edge) ---
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (event: Event) => {
        event.preventDefault();
        this.deferredPrompt = event as BeforeInstallPromptEvent;
        this.canPromptNative.set(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.canPromptNative.set(false);
        this.isInstalled.set(true);
        this.clearDismissed();
      });
    }
  }

  /**
   * Indique si la popup d'installation doit être proposée automatiquement.
   * @returns true si non installée, non reportée, et (prompt natif dispo ou iOS).
   */
  shouldOfferInstall(): boolean {
    if (this.isInstalled() || this.isDismissed()) {
      return false;
    }
    return this.canPromptNative() || this.isIos();
  }

  /**
   * Déclenche le dialogue d'installation natif du navigateur.
   * @returns true si l'utilisateur a accepté, false sinon / indisponible.
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canPromptNative.set(false);

    if (choice.outcome === 'accepted') {
      this.isInstalled.set(true);
      this.clearDismissed();
      return true;
    }

    this.dismissTemporarily();
    return false;
  }

  /**
   * Reporte la proposition d'installation (TTL localStorage).
   */
  dismissTemporarily(): void {
    const until = Date.now() + DISMISS_TTL_MS;
    localStorage.setItem(DISMISS_STORAGE_KEY, String(until));
    this.isDismissed.set(true);
  }

  /**
   * Détecte le mode standalone (PWA déjà sur l'écran d'accueil).
   */
  private detectInstalled(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    const displayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone =
      'standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return displayStandalone || iosStandalone;
  }

  /**
   * Détecte iOS / iPadOS (pas de beforeinstallprompt).
   */
  private detectIos(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent.toLowerCase();
    const classicIos = /iphone|ipad|ipod/.test(ua);
    const ipadOs =
      navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
    return classicIos || ipadOs;
  }

  /**
   * Lit le report éventuel depuis localStorage.
   */
  private readDismissed(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) {
      return false;
    }
    const until = Number(raw);
    if (Number.isNaN(until) || Date.now() > until) {
      localStorage.removeItem(DISMISS_STORAGE_KEY);
      return false;
    }
    return true;
  }

  /**
   * Efface le report d'installation.
   */
  private clearDismissed(): void {
    localStorage.removeItem(DISMISS_STORAGE_KEY);
    this.isDismissed.set(false);
  }
}
