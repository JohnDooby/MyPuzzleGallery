# US01 — Proposition d’installation automatique

**Feature :** F01  
**Statut :** done *(à valider sur téléphone réel)*

## Récit

En tant que **visiteur sur mobile**,  
je veux **qu’on me propose d’installer l’appli sans passer par le menu du navigateur**,  
afin de **l’avoir comme une icône sur mon écran d’accueil**.

## Critères d’acceptation

- [x] Si l’app n’est pas en mode standalone, une popup peut s’afficher automatiquement
- [x] Sur Chromium / Android : un bouton déclenche le dialogue natif d’install
- [x] Sur iOS : des instructions « Partager → Écran d’accueil » sont affichées
- [x] « Plus tard » reporte la proposition (TTL)
- [ ] Validé manuellement sur le téléphone de l’utilisatrice cible

## Hors scope

- Publication sur les stores

## Notes

Livré dans le code sur `main` ; validation device encore à faire.
