# US01 — Voir la galerie publique

**Feature :** F02  
**Statut :** done

## Récit

En tant que **visiteur ou utilisateur** (connecté ou non),  
je veux **voir les œuvres publiques en grille**,  
afin de **découvrir les dessins de la communauté / de la famille**.

## Critères d’acceptation

- [x] Accessible à **tous** via le menu **Galerie** (`/explore`) — distinct de **Mes œuvres**
- [x] Seules les œuvres **publiques** (validées Admin) apparaissent
- [x] Affichage **grille** adaptée mobile / tablette
- [x] Un tap ouvre un **lightbox d’une seule image** (pseudo + titre) — pas un fil multi-œuvres
- [x] Fermer le lightbox revient à la grille
- [x] **Pagination / chargement progressif** (type fil social) :
  - ordre **décroissant** de date de publication (plus récentes d’abord) ;
  - lots de **10** œuvres ;
  - chargement du lot suivant **au scroll**, quand on approche de la fin de la liste déjà affichée ;
  - **sans scroll utilisateur** → **aucun** lot suivant (même si la sentinelle est visible) ;
  - ne **pas** charger toutes les images d’un coup (ex. 1000 œuvres → plusieurs vagues)
- [ ] Accès puzzle : hors scope de cette US (E02)

## Hors scope

- Recherche / filtres (F03-US02)
- Signalement (E10 later)
- Puzzle (E02)
- Virtualisation DOM avancée (windowing) si le paging 10×10 suffit au MVP — à réévaluer si perf mobile insuffisante

## Notes

Principe produit : **infinite scroll + pages de 10**, pas un dump unique.  
Le carousel accueil (F01) peut rester limité aux N dernières sans paging.
