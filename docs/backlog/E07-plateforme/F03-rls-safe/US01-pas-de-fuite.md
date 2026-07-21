# US01 — Empêcher toute fuite de contenus non publics

**Feature :** F03  
**Statut :** done *(partiel : profiles + artworks/Storage OK ; retrait au ban + tests auto = suite)*

## Récit

En tant que **plateforme responsible (mineurs)**,  
je veux que **RLS + Storage** empêchent la lecture des images / métadonnées non autorisées,  
afin qu’**un contournement de l’UI ne suffise pas à voir un contenu privé ou en attente**.

## Critères d’acceptation

- [ ] Œuvre privée : lisible **seulement** par l’auteur (et Admin si besoin métier explicite)
- [ ] Œuvre en file de modération : **pas** lisible en public ; Admin peut la lire pour modérer
- [ ] Œuvre publique validée : lisible en lecture publique selon règles
- [ ] Fichiers Storage : mêmes garanties (URL non devinable + policies)
- [ ] Compte banni : pas de session utile ; contenus retirés du public côté données / policies
- [ ] Tests manuels ou automatisés de non-régression « fuite API »

## Hors scope

- WAF avancé / anti-DDoS cloud

## Notes

Critère **safe** n°1 côté technique avec l’absence de secrets.
