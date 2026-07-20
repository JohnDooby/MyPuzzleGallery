# US01 — Distinguer les trois rôles

**Feature :** F01  
**Statut :** draft

## Récit

En tant que **plateforme**,  
je veux **trois types de comptes (SuperAdmin, Admin, Normal)**,  
afin de **séparer publication, modération et administration**.

## Critères d’acceptation

- [ ] Un compte a exactement un rôle parmi SuperAdmin, Admin, Normal
- [ ] Un **Normal** peut gérer ses propres œuvres (selon E03) mais pas modérer celles des autres
- [ ] Un **Admin** peut modérer (E05)
- [ ] Un **SuperAdmin** a au moins les pouvoirs Admin + administration globale des comptes / plateforme *(détail des écrans à préciser)*

## Hors scope

- Hierarchie fine de permissions au-delà de ces 3 rôles

## Notes

Matrice exacte des droits à figer avec le reste du vrac.
