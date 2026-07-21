/**
 * Résultat d'une action Auth (inscription, connexion, mise à jour pseudo).
 */
export type AuthResult =
  | { success: true }
  | { success: false; message: string };
