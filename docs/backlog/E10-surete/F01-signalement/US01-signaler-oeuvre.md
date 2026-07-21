# US01 — Signaler une œuvre

**Feature :** F01  
**Statut :** later

## Récit

En tant que **visiteur ou utilisateur** (ado, parent, membre),  
je veux **signaler une œuvre**,  
afin qu’**un Admin puisse la traiter rapidement** si elle est inappropriée.

## Critères d’acceptation

- [ ] Sur une œuvre publique (feed / fiche), une action **Signaler** est accessible au doigt
- [ ] Je peux indiquer un **motif** (liste + texte libre optionnel — à figer)
- [ ] Le signalement crée un ticket visible des **Admin / SuperAdmin** (F02)
- [ ] Le signalement est **audité** (date, IP, acteur si connecté, œuvre, motif)
- [ ] Confirmation à l’écran : « Signalement envoyé »

## Hors scope

- Signalement de commentaires (quand E09 existera)
- Obligation de compte pour signaler *(à trancher : recommandé oui pour limiter le spam — défaut proposé : possible connecté **ou** avec captcha/IP si anonyme)*

## Notes

Pour la protection mineurs, privilégier un signalement **facile** et visible.

Repoussé pour le MVP : la modération Admin des demandes publiques + l’absence de j’aime / commentaires limitent la surface d’abus.
