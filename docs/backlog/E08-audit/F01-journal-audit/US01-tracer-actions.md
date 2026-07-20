# US01 — Tracer les publications (images + métadonnées)

**Feature :** F01  
**Statut :** draft

## Récit

En tant que **plateforme (responsabilité ado)**,  
je veux **auditer qui publie quoi**,  
afin de **savoir quelle image a été déposée, avec quel titre et quelle description**.

## Critères d’acceptation

- [ ] Toute **publication** (création d’œuvre) génère une entrée d’audit
- [ ] L’entrée contient au minimum : **acteur** (id compte / pseudo), **date-heure**, **IP**, **référence image**, **titre**, **description**
- [ ] Les **éditions** de titre / description / image (si remplacée) génèrent aussi une trace pertinente
- [ ] Les **suppressions** sont tracées
- [ ] Les demandes **public** / décisions de **modération** (accept / refus) sont tracées
- [ ] Les entrées ne sont pas modifiables par un Normal

## Hors scope

- Liste exhaustive de *toutes* les micro-actions UI dès le MVP (autres actions pourront s’ajouter)
- Rétention exacte en jours *(à décider)*

## Notes

Priorité PO : focus fort sur **qui publie quelles images (titre + description)**.
