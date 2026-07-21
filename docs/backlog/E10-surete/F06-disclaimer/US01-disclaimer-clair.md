# US01 — Afficher et faire accepter le disclaimer

**Feature :** F06  
**Statut :** ready

## Récit

En tant qu’**utilisateur (ado / parent)**,  
je veux **un disclaimer clair (style cookies)** avant d’utiliser l’appli,  
afin de **savoir qu’il y a audit et modération**.

## Critères d’acceptation

- [ ] Bandeau / modal au premier usage tant que non accepté
- [ ] Français **lisible**
- [ ] Mentions **obligatoires** dans le bandeau (ou résumé + lien) :
  - les **publications sont auditées** (image, titre, description, date, IP) ;
  - les modérateurs (**Admin**) peuvent consulter ces traces ;
  - **aucun contenu public sans modération humaine** ;
  - espace **familial supervisé** (lien vers [conditions d’accès](../../../../conditions-acces.md))
- [ ] Acceptation explicite mémorisée sur le device
- [ ] Lien « En savoir plus » → conditions d’accès + détail audit / rétention / contact

## Hors scope

- Validation avocat (recommandée avant ouverture large)

## Notes

Le disclaimer doit faire **figurer clairement audit + modération**, pas seulement « on utilise des cookies ».  
*Livré partiellement : texte + case à l’inscription + page `/regles`. Reste : bandeau / modal 1er usage mémorisé sur device.*
