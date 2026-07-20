# E05 — Modération des images (validation / refus)

## Objectif

Toute image demandée en **public** passe par une **validation ou un refus** réservé aux **Admin** (et SuperAdmin). Aucune diffusion publique sans ce passage.

## Périmètre

- **Inclus :** file de modération, **valider**, **refuser**, aperçu image + titre + description, accessible **uniquement** Admin / SuperAdmin
- **Exclus :** auto-publication publique ; modération par Normal

## Features

| Id | Feature | Statut |
|----|---------|--------|
| F01 | Valider ou refuser une image postée (demande publique) | draft |

## Règle métier clé

> « Publique » côté auteur = **demande**. Visible en carousel / feed **seulement après validation Admin**.
