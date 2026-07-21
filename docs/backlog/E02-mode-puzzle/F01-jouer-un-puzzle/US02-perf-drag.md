# US02 — Fluidité du drag puzzle (perf + tactile)

**Feature :** F01  
**Statut :** done

## Récit

En tant que **joueur (surtout mobile / tablette)**,  
je veux **déplacer les pièces sans latence ni accroche**,  
afin que le puzzle reste agréable au doigt.

## Critères d’acceptation

- [x] Le suivi du doigt / pointeur ne passe plus par un signal Angular à chaque `pointermove`
- [x] Position du ghost mise à jour via DOM + `requestAnimationFrame` (`translate3d`)
- [x] Pendant un drag : scroll du rail désactivé (évite le conflit geste / scroll)
- [x] Offset de grab au point de contact (pièce sous le doigt)
- [x] Pas de `drop-shadow` coûteux sur le ghost pendant le drag
- [x] Build OK ; ressenti à valider sur device tactile

## Hors scope

- Pré-rasterisation canvas des pièces (phase 2 si besoin)
- Formes de tenons variées
