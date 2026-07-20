# US01 — Restreindre les uploads aux PNG/JPEG avec taille max

**Feature :** F05  
**Statut :** draft

## Récit

En tant que **plateforme**,  
je veux **n’accepter que des images PNG ou JPEG, avec une taille max**,  
afin de **simplifier la modération et limiter les risques** (pas de GIF animé, pas de vidéo).

## Critères d’acceptation

- [ ] Formats acceptés : **`image/png`**, **`image/jpeg`** (extensions `.png`, `.jpg`, `.jpeg`)
- [ ] **GIF refusé** (y compris « gif statique » pour éviter les animés) — message d’erreur clair
- [ ] Autres types (webp, heic, vidéo, pdf…) **refusés** au MVP *(HEIC iPhone : message invitant à convertir / exporter en JPEG)*
- [ ] Taille max : **10 Mo** par fichier *(proposition — ajustable)*
- [ ] Contrôle **côté client** (UX) **et** côté stockage / backend (sécurité)
- [ ] Tentative hors règles **auditée** si pertinent

## Proposition taille max

| Contexte | Proposition |
|----------|-------------|
| Photo téléphone typique | **10 Mo** max |
| Alternative plus stricte | 5 Mo |

**Défaut retenu pour la doc :** 10 Mo (bon compromis mobile). Le PO peut baisser à 5 Mo sans changer le reste des règles.

## Hors scope

- Conversion serveur automatique HEIC → JPEG
- Compression automatique agressive *(évolution possible)*

## Notes
