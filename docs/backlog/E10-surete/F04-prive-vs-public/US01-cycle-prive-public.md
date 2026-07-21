# US01 — Documenter et respecter le cycle privé / public

**Feature :** F04  
**Statut :** done

## Récit

En tant que **utilisateur et Admin**,  
je veux **des règles claires privé / public**,  
afin de **savoir ce qui est visible, quand, et sous quel contrôle**.

## Règles produit (à respecter dans le code et l’UI)

1. **Privée (par défaut)** — visible **uniquement** par l’auteur (espace connecté). **Pas** de modération requise.
2. **Demande publique** — l’auteur active « publique » → l’œuvre entre en **file de modération** (E05). **Pas encore** visible des autres.
3. **Publique (validée)** — un Admin **valide** → visible carousel / explore / vitrine.
4. **Refusée** — un Admin **refuse** → reste non visible publiquement ; l’auteur est informé *(canal à définir)*.
5. **Retrait public** — Admin retire du public (signalement / urgence / ban) → plus visible publiquement ; **traces** conservées (flags / audit).
6. **Puzzle** — option indépendante du statut « demandé public », mais **jouable par les autres uniquement si l’œuvre est publique validée**. Une œuvre privée / en attente / refusée : pas de puzzle pour les autres (l’auteur pourra éventuellement prévisualiser plus tard — hors MVP).  

## Critères d’acceptation

- [ ] Ces règles sont reprises dans l’UI (textes d’aide près du bouton « publique »)
- [ ] Le disclaimer / page d’info les résume
- [ ] Aucune œuvre non validée n’apparaît en public

## Hors scope

- …

## Notes
