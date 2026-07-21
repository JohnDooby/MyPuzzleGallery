/**
 * Types d'actions auditées (alignés sur l'enum PostgreSQL).
 */
export type AuditAction =
  | 'artwork_created'
  | 'artwork_updated'
  | 'artwork_deleted'
  | 'visibility_requested'
  | 'moderation_approved'
  | 'moderation_rejected';

/**
 * Entrée du journal d'audit (vue Admin).
 */
export interface AuditEventRow {
  id: string;
  action: AuditAction;
  actor_id: string;
  actor_pseudo: string;
  artwork_id: string | null;
  artwork_title: string;
  artwork_description: string;
  storage_path: string | null;
  client_ip: string | null;
  created_at: string;
}

/**
 * Payload pour enregistrer une entrée d'audit.
 */
export interface AuditLogInput {
  action: AuditAction;
  artworkId?: string | null;
  artworkTitle: string;
  artworkDescription: string;
  storagePath?: string | null;
}
