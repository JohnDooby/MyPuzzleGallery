# E07 — Plateforme, secrets & RLS

## Objectif

Socle technique **indispensable au « safe »** : aucun secret exposé, et **Row Level Security** qui garantit qu’un contenu privé ou non modéré n’est **jamais** lisible via l’API anon.

## Périmètre

- **Inclus :** GitHub Pages CI, secrets CI, clé anon only, **interdiction service_role** au front, politiques RLS par rôle (Normal / Admin / SuperAdmin), Storage policies alignées
- **Exclus :** backend custom

## Features

| Id | Feature | Statut |
|----|---------|--------|
| F01 | Déploiement GitHub Pages | done |
| F02 | Sécurité credentials | done *(règles projet — à appliquer à Supabase)* |
| F03 | RLS & Storage policies (safe mineurs) | draft |

## Règles non négociables (lien protection enfants)

- Une œuvre **non publique validée** ne doit pas être récupérable par un autre utilisateur via l’API
- Les actions Admin (modération, ban, audit) protégées côté RLS (pas seulement masquées dans l’UI)
- Pas de `service_role` dans le dépôt, le bundle, ni un fichier fetchable

## Notes

Voir aussi `.cursor/rules/security.mdc` et `devrules.md`.
