# Storage — bucket `artworks` (guide Dashboard)

La migration `20260721140000_galleries_artworks_storage.sql` crée le bucket **et** les policies.
Ce guide sert à **vérifier** dans le Dashboard après exécution SQL.

## Après la migration SQL

1. Ouvre **Storage** dans le projet Supabase.
2. Vérifie qu’un bucket **`artworks`** existe.
3. Propriétés attendues :
   - **Private** (pas Public)
   - **File size limit** : 2 Mo (2 097 152 octets)
   - **Allowed MIME** : `image/png`, `image/jpeg`
4. Onglet **Policies** : 4 policies sur `storage.objects` (select / insert / update / delete).

## Règles de chemin

Les fichiers doivent être uploadés sous :

```text
{userId}/{artworkId}.png
{userId}/{artworkId}.jpg
```

Seuls le propriétaire (et le staff) peuvent écrire dans ce préfixe.
Lecture publique Storage uniquement si l’œuvre liée a `visibility_status = 'public'`.

## Si le bucket n’apparaît pas

- Re-exécuter la section `insert into storage.buckets …` de la migration.
- Ou créer manuellement le bucket `artworks` (Private), puis rejouer **uniquement** les `create policy artworks_storage_*`.

## Test manuel rapide (plus tard, avec l’UI)

1. Compte Normal connecté → publier une image.
2. Storage → dossier = ton UUID user → fichier présent.
3. Compte autre / anonymé : ne doit **pas** voir le fichier tant que l’œuvre n’est pas `public`.
