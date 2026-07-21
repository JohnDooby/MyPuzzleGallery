# Supabase — schéma & migrations

Migrations SQL versionnées pour MyPuzzleGallery.  
À appliquer sur le projet Supabase (`oztczpmejkqkvrziievh` ou autre).

## Comment appliquer

### Option A — SQL Editor (simple, solo)

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard) → projet → **SQL Editor**.
2. Coller le contenu de la migration (dans l’ordre chronologique des fichiers).
3. Exécuter.
4. Vérifier : Table Editor → `profiles` existe ; RLS activé.

### Option B — Supabase CLI (plus tard)

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

## Migrations

| Fichier | Contenu |
|---------|---------|
| `20260721090000_profiles_roles_rls.sql` | Enum rôles, `profiles`, trigger signup, helpers RLS, policies |
| `20260721090500_fix_superadmin_bootstrap.sql` | Correctif seed 1er SuperAdmin (SQL Editor) |
| `20260721120000_admin_list_profiles.sql` | RPC staff : profils + e-mail Auth |
| `20260721133000_admin_can_ban.sql` | Admin peut bannir ; rôle reste SuperAdmin |
| `20260721140000_galleries_artworks_storage.sql` | Galeries, artworks, RLS, bucket Storage privé |
| `20260721143000_artwork_author_unpublish.sql` | Auteur peut retirer une œuvre du public |
| `20260721150000_moderation_events.sql` | Journal modération + RPC file pending |
| `20260721160000_list_public_artworks.sql` | RPC explore : 20 dernières œuvres publiques |
| `20260721170000_audit_events.sql` | Journal audit unifié + RPC Admin |

Voir aussi **`STORAGE.md`** pour la vérif Dashboard du bucket `artworks`.

## Seed SuperAdmin

Voir `seed-superadmin.sql.example`.  
**Jamais** de mot de passe ni d’UUID réel commités dans le dépôt.

## Règles sécurité

- Clé **anon** uniquement dans le front.
- **`service_role`** : jamais dans ce repo ni dans Angular.
- Toute table exposée au client = **RLS** explicite.
