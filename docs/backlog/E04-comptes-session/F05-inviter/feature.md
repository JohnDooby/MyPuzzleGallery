# F05 — Inviter une personne (e-mail)

**Épique parente :** E04

## Résumé

Utilisateur **connecté** : action « Inviter une personne », saisie d’une **adresse e-mail**, envoi d’un e-mail contenant le **lien** de l’appli (PWA / site) et un message d’invitation.

## User Stories

| Id | Titre | Statut |
|----|-------|--------|
| US01 | Envoyer une invitation par e-mail | draft |

## Notes techniques (sans serveur SMTP maison)

On **n’héberge pas** de serveur SMTP. Options compatibles stack serverless / Supabase :

| Option | Idée |
|--------|------|
| **A — Recommandée** | **Supabase Edge Function** + fournisseur e-mail API (**Resend**, SendGrid, Brevo, Mailgun…) : le front appelle la function (user JWT) ; la function envoie l’e-mail avec la clé API stockée en **secret** (jamais dans le repo / Pages) |
| **B** | **Supabase Auth** `inviteUserByEmail` (si on veut créer/pré-créer le compte) — utile si l’invitation = aussi création de compte ; sinon rester sur A pour un simple lien |
| **C** | Service « forms to email » (Formspree, etc.) — possible mais moins contrôlé / moins aligné Auth |

**Contraintes safe :**
- Rate-limit (anti-spam d’invitations)
- Audit de l’envoi (qui invite quelle adresse, date, IP)
- Secrets e-mail = côté Edge Function / secrets CI uniquement
- Pas d’envoi d’e-mail depuis le navigateur avec une clé API

Pas de publication Play Store : l’invitation pointe vers le **lien web / PWA**.
