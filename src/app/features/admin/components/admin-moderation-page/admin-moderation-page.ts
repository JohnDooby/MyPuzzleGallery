import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import type { ModerationEventRow, PendingArtwork } from '../../models/moderation.model';
import { AdminModerationService } from '../../services/admin-moderation.service';

/**
 * Page Admin — file de modération + mini-journal.
 */
@Component({
  selector: 'app-admin-moderation-page',
  imports: [DatePipe],
  templateUrl: './admin-moderation-page.html',
  styleUrl: './admin-moderation-page.scss',
})
export class AdminModerationPage implements OnInit {
  private readonly moderation = inject(AdminModerationService);

  protected readonly pending = signal<PendingArtwork[]>([]);
  protected readonly events = signal<ModerationEventRow[]>([]);
  protected readonly thumbUrls = signal<Record<string, string>>({});

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  /**
   * Charge file + journal au montage.
   */
  ngOnInit(): void {
    void this.reload();
  }

  /**
   * Valide une œuvre.
   * @param item Œuvre en attente.
   */
  protected async onApprove(item: PendingArtwork): Promise<void> {
    await this.runDecision(item.id, () => this.moderation.approve(item.id), 'Œuvre validée (publique).');
  }

  /**
   * Refuse une œuvre après confirmation.
   * @param item Œuvre en attente.
   */
  protected async onReject(item: PendingArtwork): Promise<void> {
    const ok = window.confirm(
      `Refuser « ${item.title} » de ${item.author_pseudo} ?\nL’œuvre ne sera pas visible publiquement.`,
    );
    if (!ok) {
      return;
    }
    await this.runDecision(item.id, () => this.moderation.reject(item.id), 'Œuvre refusée.');
  }

  /**
   * Libellé FR d'une décision.
   */
  protected decisionLabel(decision: 'approved' | 'rejected'): string {
    return decision === 'approved' ? 'Validée' : 'Refusée';
  }

  /**
   * Exécute une décision puis recharge.
   */
  private async runDecision(
    artworkId: string,
    action: () => Promise<{ success: true } | { success: false; message: string }>,
    successText: string,
  ): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.busyId.set(artworkId);

    const result = await action();
    this.busyId.set(null);

    if (!result.success) {
      this.errorMessage.set(result.message);
      return;
    }

    this.successMessage.set(successText);
    await this.reload();
  }

  /**
   * Recharge file + journal + miniatures.
   */
  private async reload(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const [pendingResult, eventsResult] = await Promise.all([
      this.moderation.listPending(),
      this.moderation.listEvents(20),
    ]);

    if (pendingResult.error) {
      this.errorMessage.set(pendingResult.error);
      this.pending.set([]);
    } else {
      this.pending.set(pendingResult.items);
    }

    if (eventsResult.error && !pendingResult.error) {
      this.errorMessage.set(eventsResult.error);
    }
    this.events.set(eventsResult.events);

    const urls: Record<string, string> = {};
    await Promise.all(
      this.pending().map(async (item) => {
        const url = await this.moderation.getSignedImageUrl(item.storage_path);
        if (url) {
          urls[item.id] = url;
        }
      }),
    );
    this.thumbUrls.set(urls);
    this.isLoading.set(false);
  }
}
