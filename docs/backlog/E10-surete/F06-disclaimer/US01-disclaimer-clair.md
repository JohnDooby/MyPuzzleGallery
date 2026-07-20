# US01 — Afficher et faire accepter le disclaimer

**Feature :** F06  
**Statut :** draft

## Récit

En tant qu’**utilisateur (ado / parent)**,  
je veux **voir un disclaimer clair (style cookies)** avant d’utiliser l’appli,  
afin de **savoir que l’activité est tracée pour la sécurité**.

## Critères d’acceptation

- [ ] Au premier passage (et tant que non accepté), un **bandeau / modal** bloque ou surplombe l’usage principal
- [ ] Texte en français, **lisible**, non juridique opaque
- [ ] Mentionne au minimum : enregistrement des actions (dont publications : image, titre, description), **date**, **adresse IP**, consultation possible par les **moderateurs (Admin)**, finalité **protection des mineurs / sécurité**
- [ ] Bouton d’**acceptation** explicite ; mémorisation du consentement sur le device
- [ ] Lien « En savoir plus » vers une page courte (rétention, droits, contact)

## Hors scope

- Validation avocat *(recommandée avant prod large)*

## Notes

Peut fusionner / synchroniser avec E08-F02 ; E10 porte l’exigence UX « comme les cookies ».
