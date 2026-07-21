# US01 — Bannir / désactiver un compte

**Feature :** F03  
**Statut :** doing

## Récit

En tant qu’**Admin** ou **SuperAdmin**,  
je veux **désactiver (bannir) un compte**,  
afin d’**empêcher un usage dangereux** et de **couper la diffusion publique** de ses contenus.

## Critères d’acceptation

- [x] Action **Bannir / Désactiver** *(MVP : SuperAdmin uniquement, aligné RLS)*
- [x] Le compte banni **ne peut plus se connecter** *(AuthService déconnecte si `is_banned`)*
- [ ] Toutes les œuvres de ce compte qui étaient **visibles publiquement** sont **retirées du public** immédiatement *(dépend E03)*
- [ ] On **ne supprime pas** le fait qu’elles étaient publiques *(dépend E03 / E08)*
- [ ] L’action de ban est **auditée** *(dépend E08)*
- [x] Confirmation explicite avant ban

## Hors scope

- Suppression RGPD complète du compte *(processus à part, plus tard)*
- Ban temporaire vs définitif *(peut être une évolution : commencer par désactivation définitive simple)*

## Notes

Important PO : retirer du public **sans effacer** le marqueur « était en public ».  
Branche `feature/admin` : UI + flag `is_banned` ; retrait œuvres / audit = suite.
