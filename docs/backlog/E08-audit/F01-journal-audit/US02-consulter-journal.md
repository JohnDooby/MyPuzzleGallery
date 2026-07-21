# US02 — Consulter le journal (Admin & SuperAdmin)

**Feature :** F01  
**Statut :** done

## Récit

En tant qu’**Admin** ou **SuperAdmin**,  
je veux **consulter le journal d’audit**,  
afin de **voir qui a publié quoi et quand**.

## Critères d’acceptation

- [ ] Les comptes **Admin** et **SuperAdmin** peuvent ouvrir le journal
- [ ] Un **Normal** n’y a **pas** accès
- [ ] Je vois au minimum les publications avec **pseudo/acteur**, **date**, **IP**, **titre**, **description**, lien / aperçu image
- [ ] Filtres utiles : utilisateur, période, type d’action (publication, édition, suppression, modération…)

## Hors scope

- …

## Notes

Décision PO : consultation = **Admin + SuperAdmin** (pas SuperAdmin only).
