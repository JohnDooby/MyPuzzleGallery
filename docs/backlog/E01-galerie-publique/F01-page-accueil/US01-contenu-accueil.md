# US01 — Carousel des 20 dernières publications

**Feature :** F01  
**Statut :** done

## Récit

En tant que **visiteur / utilisateur**,  
je veux **voir un carousel des 20 dernières publications sur l’accueil**,  
afin de **découvrir rapidement les nouveautés**.

## Critères d’acceptation

- [ ] L’accueil affiche un **carousel** (défilement horizontal ou équivalent tactile)
- [ ] Le carousel contient au plus les **20 dernières** publications éligibles (publiques + modérées)
- [ ] Chaque item montre au minimum l’image (et idéalement le **pseudo** auteur)
- [ ] Un tap sur un item ouvre le **lightbox d’une seule œuvre** (Galerie / explore)
- [ ] Comportement correct s’il y a **moins de 20** publications

## Hors scope

- Stories éphémères type Instagram Stories
- Paging du carousel (la grille Galerie gère le volume via infinite scroll)

## Notes

Le volume important se gère sur **Galerie** (`/explore`) : chargement **10 par 10** au scroll, pas sur le carousel d’accueil.