import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../../../core/auth/auth.service';
import type { AppRole } from '../../../../core/auth/models/app-role.model';
import type { AdminAccount, AdminAccountSortField } from '../../models/admin-account.model';
import { AdminAccountsService } from '../../services/admin-accounts.service';

/**
 * Page Admin — liste des comptes, tri, ban (staff) et rôles (SuperAdmin).
 */
@Component({
  selector: 'app-admin-accounts-page',
  imports: [DatePipe],
  templateUrl: './admin-accounts-page.html',
  styleUrl: './admin-accounts-page.scss',
})
export class AdminAccountsPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly accounts = inject(AdminAccountsService);

  /** true si Admin ou SuperAdmin. */
  protected readonly isStaff = this.auth.isStaff;

  /** true si le compte connecté est SuperAdmin (gestion des rôles). */
  protected readonly isSuperAdmin = this.auth.isSuperAdmin;

  /** Identifiant du compte connecté (pour désactiver actions sur soi). */
  protected readonly currentUserId = signal<string | null>(null);

  /** Liste brute des comptes (sans tri UI). */
  private readonly accountsSignal = signal<AdminAccount[]>([]);

  /** Champ de tri actif. */
  protected readonly sortField = signal<AdminAccountSortField>('created_at');

  /** Sens du tri (true = croissant). */
  protected readonly sortAsc = signal(false);

  /** Texte de recherche (pseudo ou e-mail). */
  protected readonly searchQuery = signal('');

  /** Liste filtrée puis triée pour l'affichage. */
  protected readonly visibleAccounts = computed(() => {
    const field = this.sortField();
    const asc = this.sortAsc();
    const query = this.searchQuery().trim().toLowerCase();

    let list = [...this.accountsSignal()];

    if (query) {
      list = list.filter((account) => {
        const pseudo = account.pseudo.toLowerCase();
        const email = (account.email ?? '').toLowerCase();
        return pseudo.includes(query) || email.includes(query);
      });
    }

    list.sort((a, b) => {
      const left = this.sortValue(a, field);
      const right = this.sortValue(b, field);
      if (left < right) {
        return asc ? -1 : 1;
      }
      if (left > right) {
        return asc ? 1 : -1;
      }
      return 0;
    });

    return list;
  });

  /** Chargement initial / refresh. */
  protected readonly isLoading = signal(true);

  /** Message d'erreur global. */
  protected readonly errorMessage = signal<string | null>(null);

  /** Message de succès court. */
  protected readonly successMessage = signal<string | null>(null);

  /** Id du profil en cours d'action. */
  protected readonly busyProfileId = signal<string | null>(null);

  /**
   * Charge la liste au montage.
   */
  ngOnInit(): void {
    this.currentUserId.set(this.auth.session()?.user.id ?? null);
    void this.reload();
  }

  /**
   * Change le critère de tri.
   * @param field Champ sélectionné.
   */
  protected onSortFieldChange(field: string): void {
    if (field === 'pseudo' || field === 'email' || field === 'created_at') {
      this.sortField.set(field);
    }
  }

  /**
   * Met à jour le filtre de recherche (pseudo / e-mail).
   * @param value Texte saisi.
   */
  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  /**
   * Inverse le sens du tri.
   */
  protected toggleSortDirection(): void {
    this.sortAsc.update((value) => !value);
  }

  /**
   * Libellé français du rôle.
   * @param role Rôle applicatif.
   */
  protected roleLabel(role: AppRole): string {
    switch (role) {
      case 'superadmin':
        return 'SuperAdmin';
      case 'admin':
        return 'Admin';
      default:
        return 'Normal';
    }
  }

  /**
   * Indique si le titulaire peut changer le rôle de la cible (SuperAdmin only).
   * @param account Compte cible.
   */
  protected canChangeRole(account: AdminAccount): boolean {
    return this.isSuperAdmin() && this.isActionableTarget(account);
  }

  /**
   * Indique si le titulaire peut bannir / débannir (Admin ou SuperAdmin).
   * @param account Compte cible.
   */
  protected canBan(account: AdminAccount): boolean {
    return this.isStaff() && this.isActionableTarget(account);
  }

  /**
   * Cible actionnable : pas soi-même, pas un SuperAdmin.
   * @param account Compte cible.
   */
  private isActionableTarget(account: AdminAccount): boolean {
    if (account.id === this.currentUserId()) {
      return false;
    }
    if (account.role === 'superadmin') {
      return false;
    }
    return true;
  }

  /**
   * Promeut un compte Normal en Admin.
   * @param account Compte cible.
   */
  protected async promoteToAdmin(account: AdminAccount): Promise<void> {
    await this.runAction(account.id, () => this.accounts.setRole(account.id, 'admin'), 'Compte promu Admin.');
  }

  /**
   * Rétrograde un Admin en Normal.
   * @param account Compte cible.
   */
  protected async demoteToNormal(account: AdminAccount): Promise<void> {
    await this.runAction(account.id, () => this.accounts.setRole(account.id, 'normal'), 'Compte rétrogradé Normal.');
  }

  /**
   * Bannit un compte après confirmation.
   * @param account Compte cible.
   */
  protected async ban(account: AdminAccount): Promise<void> {
    const ok = window.confirm(
      `Bannir « ${account.pseudo} » ?\nLe compte ne pourra plus se connecter.`,
    );
    if (!ok) {
      return;
    }
    await this.runAction(account.id, () => this.accounts.setBanned(account.id, true), 'Compte banni.');
  }

  /**
   * Débannit un compte.
   * @param account Compte cible.
   */
  protected async unban(account: AdminAccount): Promise<void> {
    await this.runAction(account.id, () => this.accounts.setBanned(account.id, false), 'Compte réactivé.');
  }

  /**
   * Valeur comparable pour le tri.
   */
  private sortValue(account: AdminAccount, field: AdminAccountSortField): string {
    switch (field) {
      case 'pseudo':
        return account.pseudo.toLowerCase();
      case 'email':
        return (account.email ?? '').toLowerCase();
      case 'created_at':
        return account.created_at;
    }
  }

  /**
   * Recharge la liste des comptes.
   */
  private async reload(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { accounts, error } = await this.accounts.listAccounts();
    this.isLoading.set(false);

    if (error) {
      this.errorMessage.set(error);
      this.accountsSignal.set([]);
      return;
    }

    this.accountsSignal.set(accounts);
  }

  /**
   * Exécute une action puis rafraîchit la liste.
   */
  private async runAction(
    profileId: string,
    action: () => Promise<{ success: true } | { success: false; message: string }>,
    successText: string,
  ): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.busyProfileId.set(profileId);

    const result = await action();
    this.busyProfileId.set(null);

    if (!result.success) {
      this.errorMessage.set(result.message);
      return;
    }

    this.successMessage.set(successText);
    await this.reload();
  }
}
