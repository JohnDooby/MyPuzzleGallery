# US01 — Bannir / désactiver un compte

**Feature :** F03  
**Statut :** draft

## Récit

En tant qu’**Admin** ou **SuperAdmin**,  
je veux **désactiver (bannir) un compte**,  
afin d’**empêcher un usage dangereux** et de **couper la diffusion publique** de ses contenus.

## Critères d’acceptation

- [ ] Action **Bannir / Désactiver** réservée Admin + SuperAdmin
- [ ] Le compte banni **ne peut plus se connecter** (ni publier, ni aimer plus tard, etc.)
- [ ] Toutes les œuvres de ce compte qui étaient **visibles publiquement** sont **retirées du public** immédiatement
- [ ] On **ne supprime pas** le fait qu’elles étaient publiques : conserver une trace (ex. flag `wasPublic` / historique / statut `publicRequested` + `publicVisible=false`) pour audit et compréhension
- [ ] L’action de ban est **auditée** (acteur admin, cible, date, IP, motif)
- [ ] Confirmation explicite avant ban

## Hors scope

- Suppression RGPD complète du compte *(processus à part, plus tard)*
- Ban temporaire vs définitif *(peut être une évolution : commencer par désactivation définitive simple)*

## Notes

Important PO : retirer du public **sans effacer** le marqueur « était en public ».
