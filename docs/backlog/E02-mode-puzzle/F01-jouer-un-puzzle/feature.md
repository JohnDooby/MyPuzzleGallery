# F01 — Jouer un puzzle

**Épique parente :** E02

## Résumé

Lancer un puzzle à partir d’une œuvre publique, assembler les pièces au doigt jusqu’à la victoire (plein écran).

## User Stories

| Id | Titre | Statut |
|----|-------|--------|
| US01 | Jouer un puzzle tactile (plein écran) | done |

## Notes techniques

- Feature Angular : `features/puzzle`
- Route hors shell : `/puzzle/:artworkId`
- Grille MVP : **6×5 = 30** pièces, formes jigsaw client
- Drag : pointer events (tactile d’abord)
