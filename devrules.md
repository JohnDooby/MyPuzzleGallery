# Règles de développement — MyPuzzleGallery

Document de référence versionné pour toute contribution.  
Les règles Cursor (`.cursor/rules/*.mdc`) en reprennent l'essentiel pour l'agent.

---

## Langue

| Contexte | Langue |
|----------|--------|
| Échanges avec le développeur | **Français** |
| Identifiants de code (classes, méthodes, fichiers) | **Anglais** |
| Commentaires et JSDoc/TSDoc | **Français** |
| Libellés UI (boutons, titres, messages) | **Français** |

---

## Conduite (agent / pair programming)

- Proposer un **plan** avant toute modification de sources ; attendre le « go ».
- Ne **jamais** créer, modifier ou supprimer du code applicatif sans aval explicite.
- Ne **jamais** committer ni pousser sans demande explicite.
- Expliquer les choix techniques (Angular, Supabase, tactile) de façon pédagogique.

### Git — pas d'attribution Cursor

Ne pas ajouter `Co-authored-by: Cursor` ni `Made-with: Cursor` aux commits.  
Commits uniquement au nom du développeur.

Astuce IDE : **Cursor Settings → Agents → Attribution** → désactiver **Commit Attribution**.

---

## Produit

**MyPuzzleGallery** — galerie d'art numérique + puzzles tactiles (dessins Ibis Paint X).  
Usage prioritaire **mobile / tablette**, public familial, thème clair.

| Brique | Techno |
|--------|--------|
| Frontend | Angular 22, standalone, SCSS, signals, Vitest |
| Drag & drop | `@angular/cdk/drag-drop` |
| Backend | Supabase (Auth, PostgreSQL + RLS, Storage) |
| Hébergement | GitHub Pages (`npm run build:pages`, base-href `/MyPuzzleGallery/`) |
| PWA | `@angular/service-worker`, `public/manifest.webmanifest`, icônes dans `public/icons/` |

---

## Architecture cible

Découpage **feature-oriented** obligatoire :

```
src/app/
├── core/           # layout shell, auth Supabase, config, guards
├── shared/         # composants UI réutilisables (dumb) + utilitaires
└── features/       # une feature par domaine métier
    └── <feature>/
        ├── components/
        ├── services/
        ├── models/
        └── <feature>.routes.ts
src/styles/
└── _tokens.scss    # charte graphique (couleurs, espacements, typo…)
public/             # assets statiques (icônes PWA, etc.)
```

### Feature-oriented

- Chaque domaine (`gallery`, `puzzle`, `admin`) vit dans `features/<name>/`.
- Smart (état, appels Supabase) dans la feature ; dumb dans `shared/`.
- Routes lazy-loadées par feature dès que pertinent.

### Réutilisabilité

- Tout motif UI ou logique qui se répète doit être **factorisé** (composant, pipe, util, token).
- `shared/` : composants **présentationnels** uniquement (`input()` / `output()`), **sans** logique métier ni HTTP.
- Une responsabilité visuelle claire par composant atomique — pas de duplication par copier-coller.

### Tokens SCSS (obligatoire)

- **Aucune** couleur, espacement, rayon, ombre ou taille de police de charte **en dur** dans un composant.
- Source de vérité : **`src/styles/_tokens.scss`** (custom properties CSS et/ou variables SCSS).
- `styles.scss` importe les tokens en premier.
- Nouvelle valeur de charte → d'abord `_tokens.scss`, puis usage dans les composants.

- Serverless : pas de backend custom.
- Images dans **Storage** ; BDD = métadonnées + URLs publiques.
- **RLS** : écriture réservée à l'artiste authentifié ; lecture publique des œuvres publiées.
- Puzzle découpé **côté client** uniquement.

---

## Commentaires (obligatoires)

Rédigés en **français**.

Chaque **classe**, **interface**, **type**, **enum**, **service**, **composant** et **méthode** (y compris privée) doit avoir un en-tête décrivant :

- son **rôle** ;
- ses **paramètres** (`@param`) ;
- sa **valeur de retour** (`@returns`) si applicable.

Commentaires de **structure** dans les blocs non triviaux (`// --- Snap des pièces ---`).  
Ne pas commenter l'évident ; ne jamais livrer une API publique sans en-tête.

---

## Conventions Angular

- Standalone only ; `inject()` ; signals first.
- Architecture **feature-oriented** (`core` / `shared` / `features`).
- Composants et styles **réutilisables** ; tokens SCSS obligatoires.
- `templateUrl` / `styleUrl` ; SCSS ; préfixe `app-`.
- Prettier : `singleQuote`, `printWidth: 100`.
- Diff minimal : ne pas toucher hors scope.
- Tactile first (cibles larges, pas d'actions essentielles en hover-only).

---

## Déploiement GitHub Pages

- Workflow : `.github/workflows/deploy-github-pages.yml`
- Build : `npm run build:pages`
- Conserver `404.html` (= `index.html`) pour le routing SPA.

---

## Sécurité — credentials

Règle **non négociable** :

1. **Aucun credential** dans le dépôt Git (sources, commits, artefacts versionnés).
2. **Aucun credential** accessible via un `fetch` ou une URL publique (notamment fichiers sous `public/`, JSON de config statique, assets déployés sur GitHub Pages).

### Interdit

- Mots de passe, tokens, clés privées, **`service_role`** Supabase, secrets CI en clair dans le repo.
- Versionner `.env`, `.env.*`, `credentials.json`, etc. (déjà listés dans `.gitignore` ; un `.env.example` sans secrets est OK).
- Placer des secrets dans `public/` ou tout fichier recopié tel quel dans le build Pages.
- Mettre de vraies valeurs secrètes dans des exemples / le README.

### Front Supabase

- Uniquement la clé **anon** (publishable) côté client, avec **RLS** + Auth comme vraie barrière.
- Ne jamais embarquer la `service_role` dans le bundle ni dans un fichier téléchargeable.
- Préférer l'injection au **build** via secrets CI / variables d'environnement **locales non commités**, plutôt qu'un fichier de secrets servi en HTTP.

En cas de doute : **ne pas** écrire la valeur dans un fichier du projet ; demander confirmation.
