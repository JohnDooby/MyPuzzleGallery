import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuditService } from '../../../../core/audit/audit.service';
import type { AuditAction, AuditEventRow } from '../../../../core/audit/models/audit.model';

const ACTION_FILTERS: { value: AuditAction | ''; label: string }[] = [
  { value: '', label: 'Toutes les actions' },
  { value: 'artwork_created', label: 'Publication' },
  { value: 'artwork_updated', label: 'Édition' },
  { value: 'artwork_deleted', label: 'Suppression' },
  { value: 'visibility_requested', label: 'Demande publique' },
  { value: 'moderation_approved', label: 'Modération : validée' },
  { value: 'moderation_rejected', label: 'Modération : refusée' },
];

/**
 * Page Admin — journal d'audit unifié.
 */
@Component({
  selector: 'app-admin-audit-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-audit-page.html',
  styleUrl: './admin-audit-page.scss',
})
export class AdminAuditPage implements OnInit {
  private readonly audit = inject(AuditService);

  protected readonly actionFilters = ACTION_FILTERS;
  protected readonly events = signal<AuditEventRow[]>([]);
  protected readonly thumbUrls = signal<Record<string, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected actionFilter: AuditAction | '' = '';
  protected pseudoFilter = '';

  /**
   * Charge le journal au montage.
   */
  ngOnInit(): void {
    void this.reload();
  }

  /**
   * Relance la recherche avec les filtres courants.
   */
  protected onFilter(): void {
    void this.reload();
  }

  /**
   * Libellé FR d'une action.
   */
  protected actionLabel(action: AuditAction): string {
    return ACTION_FILTERS.find((item) => item.value === action)?.label ?? action;
  }

  /**
   * Charge les événements + miniatures disponibles.
   */
  private async reload(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.audit.listEvents({
      limit: 50,
      action: this.actionFilter || null,
      pseudo: this.pseudoFilter,
    });

    if (result.error) {
      this.errorMessage.set(result.error);
      this.events.set([]);
      this.thumbUrls.set({});
      this.isLoading.set(false);
      return;
    }

    this.events.set(result.events);

    const urls: Record<string, string> = {};
    await Promise.all(
      result.events.map(async (event) => {
        if (!event.storage_path || !event.id) {
          return;
        }
        const url = await this.audit.getSignedImageUrl(event.storage_path);
        if (url) {
          urls[event.id] = url;
        }
      }),
    );
    this.thumbUrls.set(urls);
    this.isLoading.set(false);
  }
}
