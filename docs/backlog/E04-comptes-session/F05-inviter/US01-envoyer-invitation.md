# US01 — Envoyer une invitation par e-mail

**Feature :** F05  
**Statut :** draft

## Récit

En tant qu’**utilisateur connecté**,  
je veux **inviter une personne en saisissant son e-mail**,  
afin qu’elle **reçoive un message avec le lien** pour rejoindre MyPuzzleGallery.

## Critères d’acceptation

- [ ] Action **« Inviter une personne »** visible uniquement si **loggué**
- [ ] Formulaire : champ **e-mail** (+ éventuellement message perso optionnel)
- [ ] Bouton d’envoi accessible au doigt (mobile / tablette)
- [ ] Un e-mail part vers l’adresse indiquée, contenant au minimum :
  - le **lien** de l’appli (URL GitHub Pages / PWA) ;
  - le **pseudo** de l’inviteur (ou formulation « un membre t’invite ») ;
  - rappel court : espace familial, contenus publics **modérés**, activité **auditée** (lien conditions si possible)
- [ ] Feedback UI : succès / échec d’envoi
- [ ] L’action est **auditée** (inviteur, e-mail destinataire, date, IP)
- [ ] Limitation anti-abus (ex. N invitations / heure / compte — à figer)

## Hors scope

- Publication sur le Play Store
- Serveur SMTP auto-hébergé
- Obligation que le destinataire ait déjà un compte

## Notes techniques

Voir la feature : **Edge Function + Resend (ou équivalent)** — pas de SMTP maison.  
Détail d’implémentation à valider au moment du build Supabase.
