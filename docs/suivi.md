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
| done | 21 |
| doing | 1 (galerie publique) |
| ready | ~2 (puzzle / polish) |
| draft | ~7 |
| later | ~5 (signalements, commentaires, j’aime) |

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
| E07-F03-US01 | Pas de fuite (RLS) | [US](./backlog/E07-plateforme/F03-rls-safe/US01-pas-de-fuite.md) | **Partiel** : profiles + artworks/Storage OK ; retrait contenus au ban + tests auto = suite |
| E03-F01-US01 | Publier depuis le device | [US](./backlog/E03-publication/F01-formulaire-publication/US01-publier-oeuvre.md) | `/gallery/publish` + compression client |
| E03-F03-US01 | Modifier une œuvre | [US](./backlog/E03-publication/F03-editer-oeuvre/US01-modifier-oeuvre.md) | Édition métadonnées + cycle visibilité |
| E03-F04-US01 | Supprimer avec confirmation | [US](./backlog/E03-publication/F04-supprimer-oeuvre/US01-supprimer-oeuvre.md) | |
| E10-F04-US01 | Cycle privé / public | [US](./backlog/E10-surete/F04-prive-vs-public/US01-cycle-prive-public.md) | Privé → pending → public/rejected ; unpublish auteur |
| E10-F05-US01 | Formats / taille médias | [US](./backlog/E10-surete/F05-garde-fous-medias/US01-formats-taille.md) | PNG/JPEG, 2048 px, 2 Mo post-compress |
| E05-F01-US01 | Valider / refuser demande publique | [US](./backlog/E05-moderation/F01-moderer-oeuvre/US01-valider-publication.md) | Menu Admin → Modération + mini-journal |
| E01-F01-US01 | Carousel 20 dernières | [US](./backlog/E01-galerie-publique/F01-page-accueil/US01-contenu-accueil.md) | Accueil ; polish UI/UX plus tard |
| E01-F03-US01 | Lightbox mono-œuvre | [US](./backlog/E01-galerie-publique/F03-exploration/US01-fil-exploration.md) | Tap → une image ; paging = grille F02 |
| E10-F06-US01 | Disclaimer bandeau 1er usage | [US](./backlog/E10-surete/F06-disclaimer/US01-disclaimer-clair.md) | localStorage `mpg.disclaimer.accepted` |
| E08-F01-US01 | Tracer publications / éditions / suppressions | [US](./backlog/E08-audit/F01-journal-audit/US01-tracer-actions.md) | `audit_events` ; IP Edge Function = suite |
| E08-F01-US02 | Consulter journal Admin+ | [US](./backlog/E08-audit/F01-journal-audit/US02-consulter-journal.md) | Menu Admin → Journal |

---

## Doing

Branche macro : **`feature/public-gallery`** — grille publique pour tous.

| US | Titre | Branche | Lien |
|----|-------|---------|------|
| E01-F02-US01 | Voir galerie publique | feature/public-gallery | [US](./backlog/E01-galerie-publique/F02-consultation-publique/US01-voir-galerie-publique.md) |

---

## Ready (suite priorisée)

| Ordre | US / sujet | Notes |
|--------|------------|-------|
| 1 | E02 Puzzle | Promesse produit ; US F01 à écrire |
| 2 | Polish UI/UX | Accueil / explore / admin |

*Signalements & complétion ban : **dépriorisés** (voir Later / dette) — le safe-first MVP repose sur la modération humaine + absence de j’aime / commentaires.*

---

## Backlog (draft) — par épique

### E01 — Accueil & explore

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Carousel 20 dernières | done | [lien](./backlog/E01-galerie-publique/F01-page-accueil/US01-contenu-accueil.md) |
| F02-US01 | Voir galerie publique | doing | [lien](./backlog/E01-galerie-publique/F02-consultation-publique/US01-voir-galerie-publique.md) — *grille `/explore` ; **paging 10×10** au scroll à faire* |
| F03-US01 | Lightbox mono-œuvre | done | [lien](./backlog/E01-galerie-publique/F03-exploration/US01-fil-exploration.md) — *plus de fil multi-images* |
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
| F01-US01 | Publier depuis le device | done | [lien](./backlog/E03-publication/F01-formulaire-publication/US01-publier-oeuvre.md) |
| F02-US01 | Galeries nommées | draft | [lien](./backlog/E03-publication/F02-galerie-utilisateur/US01-relier-galleries.md) — *MVP : galerie « Ma galerie » auto ; multi-galeries UI = suite* |
| F03-US01 | Modifier une œuvre | done | [lien](./backlog/E03-publication/F03-editer-oeuvre/US01-modifier-oeuvre.md) |
| F04-US01 | Supprimer avec confirmation | done | [lien](./backlog/E03-publication/F04-supprimer-oeuvre/US01-supprimer-oeuvre.md) |

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
| F01-US01 | Valider / refuser demande publique | done | [lien](./backlog/E05-moderation/F01-moderer-oeuvre/US01-valider-publication.md) |

### E07 — Plateforme / RLS

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F03-US01 | Pas de fuite contenus non publics | done *(partiel)* | [lien](./backlog/E07-plateforme/F03-rls-safe/US01-pas-de-fuite.md) |

### E08 — Audit

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Tracer publications | done | [lien](./backlog/E08-audit/F01-journal-audit/US01-tracer-actions.md) — *IP serveur = suite* |
| F01-US02 | Consulter journal Admin+ | done | [lien](./backlog/E08-audit/F01-journal-audit/US02-consulter-journal.md) |
| F02-US01 | Disclaimer (E08) | done | [lien](./backlog/E08-audit/F02-disclaimer/US01-afficher-disclaimer.md) — *couvert par E10-F06* |

*Note : le disclaimer UX prioritaire est **E10-F06** ; E08-F02 reste aligné.*

### E10 — Sûreté

| Id | Titre | Statut | Lien |
|----|-------|--------|------|
| F01-US01 | Signaler une œuvre | later | [lien](./backlog/E10-surete/F01-signalement/US01-signaler-oeuvre.md) — *repoussé : modération Admin suffit au MVP* |
| F02-US01 | Traiter un signalement | later | [lien](./backlog/E10-surete/F02-traitement-signalements/US01-traiter-signalement.md) |
| F02-US02 | Retrait rapide du public | later | [lien](./backlog/E10-surete/F02-traitement-signalements/US02-retrait-rapide-public.md) |
| F03-US01 | Bannir un compte | done *(partiel)* | [lien](./backlog/E10-surete/F03-ban-compte/US01-bannir-compte.md) — *retrait œuvres au ban = basse priorité* |
| F04-US01 | Cycle privé / public | done | [lien](./backlog/E10-surete/F04-prive-vs-public/US01-cycle-prive-public.md) |
| F05-US01 | Formats / taille médias | done | [lien](./backlog/E10-surete/F05-garde-fous-medias/US01-formats-taille.md) |
| F06-US01 | Disclaimer clair | done | [lien](./backlog/E10-surete/F06-disclaimer/US01-disclaimer-clair.md) |
| F07-US01 | Cadre âge & famille | done | [lien](./backlog/E10-surete/F07-cadre-age-famille/US01-cadre-age-famille.md) |

---

## Later (reporté)

| US | Titre | Lien |
|----|-------|------|
| E10-F01 / F02 | Signalements + retrait rapide | Modération Admin couvre le MVP ; pas de feed social ouvert |
| E09-F01-US01 | Cadrage commentaires | [lien](./backlog/E09-commentaires/F01-commenter/US01-cadrage.md) |
| E11-F01-US01 | Cadrage J’aime (login) | [lien](./backlog/E11-jaime/F01-aimer/US01-cadrage.md) |

*Safe-first actuel : **modération humaine** des demandes publiques + pas de j’aime / commentaires → surface d’abus limitée.*

---

## Dette doc / technique repérée

- [ ] Écrire les US détaillées pour **E02-F01 Jouer un puzzle**
- [x] Harmoniser disclaimer E08-F02 vs E10-F06 — *E10-F06 livré ; E08-F02 marqué done (couvert)*
- [ ] Valider PWA sur device réel (E06)
- [x] Brancher secrets Supabase en CI (Pages) via GitHub Secrets + injection build — *workflow prêt (`env:sync:ci`)*
- [ ] Compléter E07-F03 / E10-F03 : retrait œuvres au ban + tests de non-fuite — *basse priorité (ban UI déjà là)*
- [ ] Élargir E08 : IP fiable via Edge Function (+ filtres période si besoin)
- [ ] E03-F02 : UI multi-galeries nommées (au-delà de « Ma galerie »)

## Notes techniques

- Livré sur **`main`** : Auth, Admin, Publication, Modération, Explore, Disclaimer, Audit (`audit_events` + `/admin/audit`).
- Menu Admin déroulant : **Comptes** | **Modération** | **Journal**.
- Migrations SQL à appliquer sur le projet Supabase si pas déjà fait (dossier `supabase/migrations/`, dernière : `20260721170000_audit_events.sql`).
- Suite prioritaire : **E02 puzzle** (puis polish UI). Signalements / ban complet / social = plus tard.
- En cours : **`feature/public-gallery`** — nav **Galerie** (`/explore`) pour tous ≠ **Mes œuvres** ; lightbox mono-œuvre OK ; **reste : infinite scroll 10×10**.
