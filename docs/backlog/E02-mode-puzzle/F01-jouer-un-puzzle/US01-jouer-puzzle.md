# US01 — Jouer un puzzle tactile (plein écran)

**Feature :** F01  
**Statut :** done

## Récit

En tant que **visiteur ou utilisateur**,  
je veux **jouer une œuvre publique en puzzle plein écran**,  
afin de **profiter du côté ludique** de MyPuzzleGallery.

## Critères d’acceptation

- [x] Depuis l’**accueil** (carousel) ou la **Galerie**, un bouton **Puzzle** apparaît sur les œuvres `public` + `puzzle_enabled`
- [x] Jouable par **tout le monde** (anon ou connecté)
- [x] **Pas** d’entrée puzzle depuis Mes œuvres / œuvres non publiques
- [x] L’écran jeu est **plein écran** (pas de bandeau shell)
- [x] Bouton **fermer** (croix) en haut à droite → retour au contexte d’origine
- [x] Zone haute **~⅔ à ¾** : plateau d’assemblage
- [x] Zone basse : **scroller horizontal** des pièces restantes, **mélangées**
- [x] **~30 pièces** par défaut (grille **6×5**)
- [x] Formes **jigsaw** : coins, bords, centres avec tenons/mortaises arrondis et **complémentaires** entre voisins
- [x] Drag tactile + **snap** près de la bonne place
- [x] Victoire : message FR + possibilité de fermer

## Hors scope

- Choix du nombre de pièces / difficultés (plus tard)
- Stats de réussite (F02)
- Prévisualisation auteur sur œuvre privée

## Notes

Découpe 100 % client ; image via URL signée Storage.
