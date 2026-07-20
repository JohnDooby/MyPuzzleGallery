# E08 — Traçabilité & audit

## Objectif

Tracer les actions utilisateurs (qui, quoi, quand, **IP**, contenu…) pour un espace ado où l’on partage et (potentiellement) commente. Afficher un **disclaimer**. Périmètre à affiner.

## Périmètre

- **Inclus :** journal d’actions, horodatage, IP, référence contenu / payload pertinent, disclaimer UI, consultation réservée (SuperAdmin / Admin — à figer)
- **Exclus :** revente de données ; tracking pub tiers

## Qui consulte

**Admin** et **SuperAdmin** (pas les Normal).

## Features

| Id | Feature | Statut |
|----|---------|--------|
| F01 | Journal d’audit (focus publications) | draft |
| F02 | Disclaimer de traçabilité | draft |

## Priorité de trace (MVP)

1. **Publications** : qui, image, titre, description, date, IP  
2. Éditions / suppressions d’œuvres  
3. Décisions de modération / signalements / bans  
4. Autres actions selon capacité  

## Notes

Le **disclaimer UX** (bandeau type cookies) est porté par **E10-F06** ; E08-F02 reste aligné sur le même message.
