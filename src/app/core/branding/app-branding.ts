/**
 * Identité visuelle / libellés de marque de l'application.
 * Source de vérité runtime : modifier branding.json puis lancer `npm run branding:sync`.
 */
import brandingJson from './branding.json';

/** Contrat du fichier de branding partagé. */
export interface AppBranding {
  /** Nom complet (onglet navigateur, titres, popup d'install). */
  readonly name: string;
  /** Nom court (icône écran d'accueil, titre iOS). */
  readonly shortName: string;
  /** Description PWA / store-like. */
  readonly description: string;
  /** Couleur de thème navigateur / barre de statut. */
  readonly themeColor: string;
  /** Couleur de fond du splash PWA. */
  readonly backgroundColor: string;
}

/** Branding applicatif chargé depuis branding.json. */
export const APP_BRANDING: AppBranding = brandingJson;
