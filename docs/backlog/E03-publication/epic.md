# E03 — Publication & galeries personnelles

## Objectif

Publier, ranger (galeries nommées), éditer et supprimer ses œuvres — le tout lié au compte connecté.

## Périmètre

- **Inclus :** publication (photo device, métadonnées, public, puzzle, **nom de galerie**), CRUD édition, suppression avec confirmation, galeries perso
- **Exclus :** publication anonyme

## Features

| Id | Feature | Statut |
|----|---------|--------|
| F01 | Formulaire de publication | draft |
| F02 | Galeries nommées par compte | draft |
| F03 | Éditer une œuvre | draft |
| F04 | Supprimer une œuvre | draft |

## Notes

Visibilité publique ↔ modération E05 à figer.

## Décisions médias (E10-F05)

- Compression **client** avant upload : max **2048 px** (côté long), plafond **2 Mo** après traitement.
- Fichier source max **10 Mo** avant compression.
- Formats : PNG / JPEG uniquement ; pas de GIF.
- Après compression : **conserver le format d’origine** (PNG reste PNG, JPEG reste JPEG).

## Décisions produit publication (2026-07-21)

| Sujet | Décision |
|-------|----------|
| Puzzle | Uniquement si œuvre **publique validée** |
| Galerie | **Obligatoire** ; défaut auto **« Ma galerie »** si aucune |
| Demande public | Case à la **création** (pas de diffusion immédiate → file modération) |
| Storage | Bucket **privé** + policies strictes |
| Feature Angular | Tout sous **`features/gallery`** ; route **`/gallery/publish`** |
| Périmètre vague | Publish + **édition** + **suppression** + bascule / cycle **privé ↔ demande public** (liste « mes œuvres ») |
