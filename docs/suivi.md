# Suivi d’avancement — User Stories

Vue d’ensemble du backlog.  
**Source de vérité du détail** = fichier US dans `docs/backlog/…`.  
**Ce fichier** = tableau de bord : on le met à jour dès qu’une US change de statut.

## Statuts

| Statut | Signification |
|--------|----------------|
| `draft` | Écrite, pas encore priorisée pour build |
| `ready` | Prête à développer (critères OK) |
| `doing` | En cours (branche / PR) |
| `done` | Livrée sur `main` (éventuellement « à valider device ») |
| `later` | Explicitement reportée |

## Règle de mise à jour

1. Modifier `**Statut :**` dans le fichier US.  
2. Déplacer / mettre à jour la ligne ici.  
3. Indiquer la branche si `doing`.

## Synthèse

| Statut | Nb (approx.) |
|--------|----------------|
| done | 10 |
| doing | 5 (vague publication P1) |
| ready | ~2 |
| draft | ~18 |
| later | 2 (cadrages E09 / E11) |

---

## Done

| US | Titre | Lien | Notes |
|----|-------|------|-------|
| E06-F01-US01 | Proposition d’installation PWA | [US](./backlog/E06-mobile-pwa/F01-installation-pwa/US01-proposition-installation.md) | À valider sur téléphone réel |
| E04-F01-US01 | Trois rôles | [US](./backlog/E04-comptes-session/F01-roles/US01-trois-roles.md) | Enum + RLS + UI Admin |
| E04-F02-US01 | Créer un compte | [US](./backlog/E04-comptes-session/F02-creation-compte/US01-creer-compte.md) | Inscription UI |
| E04-F02-US02 | Sans validation compte (MVP) | [US](./backlog/E04-comptes-session/F02-creation-compte/US02-compte-valide.md) | Confirm e-mail désactivée côté Supabase |
| E04-F03-US01 | Login / logout | [US](./backlog/E04-comptes-session/F03-session/US01-login-logout.md) | |
| E04-F03-US02 | Session persistante | [US](./backlog/E04-comptes-session/F03-session/US02-session-persistante.md) | |
| E04-F04-US01 | Pseudo public | [US](./backlog/E04-comptes-session/F04-pseudo/US01-pseudo-public.md) | Colonne + shell ; filtre explore = E01 |
| E10-F07-US01 | Cadre âge & famille | [US](./backlog/E10-surete/F07-cadre-age-famille/US01-cadre-age-famille.md) | Page `/regles` + lien inscription |
| E10-F03-US01 | Bannir un compte | [US](./backlog/E10-surete/F03-ban-compte/US01-bannir-compte.md) | **Partiel** : flag + session + UI Admin/SuperAdmin ; retrait œuvres + audit = suite |
| E07-F03-US01 | Pas de fuite (RLS) | [US](./backlog/E07-plateforme/F03-rls-safe/US01-pas-de-fuite.md) | **Partiel** : `profiles` OK ; artworks / Storage = avec E03 |

---

## Doing

Branche macro : **`feature/publication`** — itération **P3** (édition + suppression).

| US | Titre | Branche | Lien |
|----|-------|---------|------|
| E03-F01-US01 | Publier depuis le device | feature/publication | [US](./backlog/E03-publication/F01-formulaire-publication/US01-publier-oeuvre.md) |
| E03-F03-US01 | Modifier une œuvre *(prévu P3)* | feature/publication | [US](./backlog/E03-publication/F03-editer-oeuvre/US01-modifier-oeuvre.md) |
| E03-F04-US01 | Supprimer *(prévu P3)* | feature/publication | [US](./backlog/E03-publication/F04-supprimer-oeuvre/US01-supprimer-oeuvre.md) |
| E10-F04-US01 | Cycle privé / public | feature/publication | [US](./backlog/E10-surete/F04-prive-vs-public/US01-cycle-prive-public.md) |
| E10-F05-US01 | Formats / taille + compression client | feature/publication | [US](./backlog/E10-surete/F05-garde-fous-medias/US01-formats-taille.md) |

---

## Ready (suite après P1)

| Ordre | US | Titre | Notes |
|--------|----|-------|-------|
| 1 | E03-F01 UI | Formulaire `/gallery/publish` + Mes œuvres | P2 |
| 2 | E03-F03 / F04 UI | Édition + suppression | P3 |
| 3 | E10-F06-US01 | Disclaimer bandeau 1er usage | Plus tard |

*Ensuite : E05 modération Admin, E08 audit, E01 explore.*

---

## Backlog (draft) — par épique

### E01 — Accueil & explore

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Carousel 20 dernières | draft | [lien](./backlog/E01-galerie-publique/F01-page-accueil/US01-contenu-accueil.md) |
| F02-US01 | Voir galerie publique | draft | [lien](./backlog/E01-galerie-publique/F02-consultation-publique/US01-voir-galerie-publique.md) |
| F03-US01 | Feed plein écran | draft | [lien](./backlog/E01-galerie-publique/F03-exploration/US01-fil-exploration.md) |
| F03-US02 | Recherche auteur / galerie / dates | draft | [lien](./backlog/E01-galerie-publique/F03-exploration/US02-recherche-mots-clefs.md) |

### E02 — Puzzle

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01 | Jouer un puzzle | draft | [feature](./backlog/E02-mode-puzzle/F01-jouer-un-puzzle/feature.md) — *US détaillée à écrire* |
| F02-US01 | Voir stats puzzle | draft | [lien](./backlog/E02-mode-puzzle/F02-stats-puzzle/US01-voir-stats.md) |
| F02-US02 | Enregistrer réussite | draft | [lien](./backlog/E02-mode-puzzle/F02-stats-puzzle/US02-enregistrer-reussite.md) |

### E03 — Publication & galeries

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Publier depuis le device | doing | [lien](./backlog/E03-publication/F01-formulaire-publication/US01-publier-oeuvre.md) |
| F02-US01 | Galeries nommées | draft | [lien](./backlog/E03-publication/F02-galerie-utilisateur/US01-relier-galleries.md) |
| F03-US01 | Modifier une œuvre | doing | [lien](./backlog/E03-publication/F03-editer-oeuvre/US01-modifier-oeuvre.md) |
| F04-US01 | Supprimer avec confirmation | doing | [lien](./backlog/E03-publication/F04-supprimer-oeuvre/US01-supprimer-oeuvre.md) |

### E04 — Comptes & session

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Trois rôles | done | [lien](./backlog/E04-comptes-session/F01-roles/US01-trois-roles.md) |
| F02-US01 | Créer un compte | done | [lien](./backlog/E04-comptes-session/F02-creation-compte/US01-creer-compte.md) |
| F02-US02 | Sans validation compte (MVP) | done | [lien](./backlog/E04-comptes-session/F02-creation-compte/US02-compte-valide.md) |
| F03-US01 | Login / logout | done | [lien](./backlog/E04-comptes-session/F03-session/US01-login-logout.md) |
| F03-US02 | Session persistante | done | [lien](./backlog/E04-comptes-session/F03-session/US02-session-persistante.md) |
| F04-US01 | Pseudo public | done | [lien](./backlog/E04-comptes-session/F04-pseudo/US01-pseudo-public.md) |
| F05-US01 | Invitation e-mail | draft | [lien](./backlog/E04-comptes-session/F05-inviter/US01-envoyer-invitation.md) |

### E05 — Modération

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Valider / refuser demande publique | draft | [lien](./backlog/E05-moderation/F01-moderer-oeuvre/US01-valider-publication.md) |

### E07 — Plateforme / RLS

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F03-US01 | Pas de fuite contenus non publics | done *(partiel profiles)* | [lien](./backlog/E07-plateforme/F03-rls-safe/US01-pas-de-fuite.md) |

### E08 — Audit

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Tracer publications | draft | [lien](./backlog/E08-audit/F01-journal-audit/US01-tracer-actions.md) |
| F01-US02 | Consulter journal Admin+ | draft | [lien](./backlog/E08-audit/F01-journal-audit/US02-consulter-journal.md) |
| F02-US01 | Disclaimer (E08) | draft | [lien](./backlog/E08-audit/F02-disclaimer/US01-afficher-disclaimer.md) |

*Note : le disclaimer UX prioritaire est **E10-F06** ; E08-F02 reste aligné.*

### E10 — Sûreté

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Signaler une œuvre | draft | [lien](./backlog/E10-surete/F01-signalement/US01-signaler-oeuvre.md) |
| F02-US01 | Traiter un signalement | draft | [lien](./backlog/E10-surete/F02-traitement-signalements/US01-traiter-signalement.md) |
| F02-US02 | Retrait rapide du public | draft | [lien](./backlog/E10-surete/F02-traitement-signalements/US02-retrait-rapide-public.md) |
| F03-US01 | Bannir un compte | done *(partiel)* | [lien](./backlog/E10-surete/F03-ban-compte/US01-bannir-compte.md) |
| F04-US01 | Cycle privé / public | doing | [lien](./backlog/E10-surete/F04-prive-vs-public/US01-cycle-prive-public.md) |
| F05-US01 | Formats / taille médias | doing | [lien](./backlog/E10-surete/F05-garde-fous-medias/US01-formats-taille.md) |
| F06-US01 | Disclaimer clair | ready | [lien](./backlog/E10-surete/F06-disclaimer/US01-disclaimer-clair.md) — *bandeau 1er usage reste* |
| F07-US01 | Cadre âge & famille | done | [lien](./backlog/E10-surete/F07-cadre-age-famille/US01-cadre-age-famille.md) |

---

## Later (reporté)

| US | Titre | Lien |
|----|-------|------|
| E09-F01-US01 | Cadrage commentaires | [lien](./backlog/E09-commentaires/F01-commenter/US01-cadrage.md) |
| E11-F01-US01 | Cadrage J’aime (login) | [lien](./backlog/E11-jaime/F01-aimer/US01-cadrage.md) |

---

## Dette doc / technique repérée

- [ ] Écrire les US détaillées pour **E02-F01 Jouer un puzzle**
- [ ] Harmoniser disclaimer E08-F02 vs E10-F06 (une seule US « done » à la fin)
- [ ] Valider PWA sur device réel (E06)
- [x] Brancher secrets Supabase en CI (Pages) via GitHub Secrets + injection build — *workflow prêt (`env:sync:ci`)*
- [ ] Compléter E07-F03 / E10-F03 après artworks (Storage RLS, retrait public, audit ban)

## Notes techniques

- Auth + Admin comptes livrés sur **`main`** (merges `feature/auth` + `feature/admin`).
- Migrations SQL à appliquer sur le projet Supabase si pas déjà fait (dossier `supabase/migrations/`).
- Prochaine macro : **E03 publication**.
