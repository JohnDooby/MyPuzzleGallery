# US01 — Restreindre les uploads aux PNG/JPEG avec taille max

**Feature :** F05  
**Statut :** done

## Récit

En tant que **plateforme**,  
je veux **n’accepter que des images PNG ou JPEG, compressées pour le mobile**,  
afin de **simplifier la modération, limiter le stockage, et garder une qualité suffisante téléphone / tablette**.

## Critères d’acceptation

- [ ] Formats acceptés en entrée : **`image/png`**, **`image/jpeg`** (extensions `.png`, `.jpg`, `.jpeg`)
- [ ] **GIF refusé** (y compris « gif statique ») — message d’erreur clair
- [ ] Autres types (webp, heic, vidéo, pdf…) **refusés** au MVP *(HEIC iPhone : message invitant à exporter en JPEG)*
- [ ] **Compression / resize côté client** avant upload :
  - côté long max **2048 px**
  - JPEG qualité ~**0,8** ; **PNG** : resize en **conservant le PNG** (pas de conversion JPEG forcée)
  - taille cible typique : **souvent sous 1,5 Mo**
  - **conserver le format d’origine** après traitement
- [ ] Taille max **après** traitement : **2 Mo** (plafond dur — refus si dépassé)
- [ ] Taille max fichier **brut** avant traitement : **10 Mo** (porte d’entrée ; on compresse ensuite)
- [ ] Contrôle **côté client** (UX) **et** côté Storage / policies (sécurité)
- [ ] Tentative hors règles **auditée** si pertinent *(E08 — plus tard)*

## Décision PO (2026-07-21)

| Paramètre | Valeur retenue |
|-----------|----------------|
| Côté long max | **2048 px** |
| Max après compression | **2 Mo** |
| Max brut avant traitement | **10 Mo** |
| Où compresser | **Client** (navigateur / PWA) |

## Hors scope

- Conversion serveur automatique HEIC → JPEG
- Compression serveur / Edge Function
- Dérivés multi-résolution (thumb + full) — évolution galerie

## Notes

10 Mo n’est **pas** une taille cible d’affichage : c’est seulement la limite d’acceptation du fichier source avant traitement client.
