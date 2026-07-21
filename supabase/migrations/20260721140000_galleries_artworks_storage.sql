-- P1 Publication : galleries, artworks, RLS, bucket Storage privé + policies
-- Décisions PO : galerie obligatoire (« Ma galerie » auto), visibility cycle,
-- puzzle flag (effet public validé seulement), compression client (max 2 Mo en Storage).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.artwork_visibility as enum (
  'private',
  'pending_public',
  'public',
  'rejected'
);

-- ---------------------------------------------------------------------------
-- Galleries
-- ---------------------------------------------------------------------------
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint galleries_name_length check (char_length(name) between 1 and 64),
  constraint galleries_name_trimmed check (name = trim(name))
);

create unique index galleries_owner_name_lower_uidx
  on public.galleries (owner_id, lower(name));

create index galleries_owner_id_idx on public.galleries (owner_id);

comment on table public.galleries is
  'Galeries personnelles de rangement (par compte).';

create trigger galleries_set_updated_at
before update on public.galleries
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Artworks
-- ---------------------------------------------------------------------------
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete restrict,
  title text not null,
  description text not null default '',
  hours_spent numeric(6, 1),
  visibility_status public.artwork_visibility not null default 'private',
  puzzle_enabled boolean not null default false,
  storage_path text not null,
  mime_type text not null,
  byte_size integer not null,
  width_px integer,
  height_px integer,
  was_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artworks_title_length check (char_length(title) between 1 and 120),
  constraint artworks_title_trimmed check (title = trim(title)),
  constraint artworks_description_length check (char_length(description) <= 2000),
  constraint artworks_mime_type_allowed check (mime_type in ('image/png', 'image/jpeg')),
  constraint artworks_byte_size_positive check (byte_size > 0),
  -- Plafond fichier stocké (= après compression client, max 2 Mo)
  constraint artworks_byte_size_max check (byte_size <= 2097152),
  constraint artworks_hours_non_negative check (hours_spent is null or hours_spent >= 0),
  constraint artworks_storage_path_nonempty check (char_length(trim(storage_path)) > 0)
);

create unique index artworks_storage_path_uidx on public.artworks (storage_path);
create index artworks_owner_id_idx on public.artworks (owner_id);
create index artworks_gallery_id_idx on public.artworks (gallery_id);
create index artworks_visibility_status_idx on public.artworks (visibility_status);

comment on table public.artworks is
  'Œuvres : métadonnées + chemin Storage. Visibilité : private | pending_public | public | rejected.';
comment on column public.artworks.puzzle_enabled is
  'Intention puzzle ; jouable par les autres seulement si visibility_status = public.';
comment on column public.artworks.was_public is
  'Trace : a déjà été publique (conservé après retrait / ban).';
comment on column public.artworks.storage_path is
  'Chemin dans le bucket artworks, ex. {userId}/{artworkId}.jpg';

create trigger artworks_set_updated_at
before update on public.artworks
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Galerie par défaut « Ma galerie » à la création du profil
-- ---------------------------------------------------------------------------
create or replace function public.create_default_gallery_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.galleries (owner_id, name)
  values (new.id, 'Ma galerie');
  return new;
end;
$$;

create trigger on_profile_created_default_gallery
after insert on public.profiles
for each row
execute function public.create_default_gallery_for_profile();

-- Backfill comptes déjà existants
insert into public.galleries (owner_id, name)
select p.id, 'Ma galerie'
from public.profiles p
where not exists (
  select 1 from public.galleries g where g.owner_id = p.id
);

-- ---------------------------------------------------------------------------
-- Protection transitions de visibilité (auteur vs staff)
-- ---------------------------------------------------------------------------
create or replace function public.protect_artwork_visibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- owner_id immuable
  if tg_op = 'UPDATE' and new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id ne peut pas être modifié';
  end if;

  if tg_op = 'INSERT' then
    if new.owner_id is distinct from auth.uid() and not public.is_staff() then
      raise exception 'owner_id doit correspondre au compte connecté';
    end if;
    -- Auteur : private ou pending_public uniquement à la création
    if new.visibility_status not in ('private', 'pending_public')
       and not public.is_staff() then
      raise exception 'Visibilité initiale invalide (private ou pending_public)';
    end if;
  end if;

  if tg_op = 'UPDATE' and new.visibility_status is distinct from old.visibility_status then
    if public.is_staff() then
      -- Staff : toutes transitions (modération E05)
      null;
    elsif new.owner_id = auth.uid() then
      -- Auteur : private <-> pending_public seulement
      if not (
        (old.visibility_status in ('private', 'pending_public', 'rejected')
          and new.visibility_status in ('private', 'pending_public'))
      ) then
        raise exception 'Transition de visibilité non autorisée pour l''auteur';
      end if;
      -- Pas de self-publish
      if new.visibility_status = 'public' then
        raise exception 'Seul un Admin peut valider une œuvre en public';
      end if;
    else
      raise exception 'Modification de visibilité non autorisée';
    end if;
  end if;

  -- Trace was_public
  if new.visibility_status = 'public' then
    new.was_public := true;
  end if;

  return new;
end;
$$;

create trigger artworks_protect_visibility
before insert or update on public.artworks
for each row
execute function public.protect_artwork_visibility();

-- Galerie : l’auteur ne peut rattacher qu’à une de ses galeries
create or replace function public.protect_artwork_gallery_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  gallery_owner uuid;
begin
  select g.owner_id into gallery_owner
  from public.galleries g
  where g.id = new.gallery_id;

  if gallery_owner is null then
    raise exception 'Galerie introuvable';
  end if;

  if gallery_owner is distinct from new.owner_id then
    raise exception 'La galerie doit appartenir au propriétaire de l''œuvre';
  end if;

  return new;
end;
$$;

create trigger artworks_protect_gallery_owner
before insert or update of gallery_id, owner_id on public.artworks
for each row
execute function public.protect_artwork_gallery_owner();

-- ---------------------------------------------------------------------------
-- RLS galleries
-- ---------------------------------------------------------------------------
alter table public.galleries enable row level security;

create policy galleries_select
on public.galleries
for select
to authenticated
using (
  owner_id = auth.uid()
  or public.is_staff()
);

-- Lecture publique des noms de galerie si œuvre publique (explore plus tard)
create policy galleries_select_public_via_artwork
on public.galleries
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.artworks a
    where a.gallery_id = galleries.id
      and a.visibility_status = 'public'
  )
);

create policy galleries_insert_own
on public.galleries
for insert
to authenticated
with check (owner_id = auth.uid());

create policy galleries_update_own
on public.galleries
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy galleries_delete_own
on public.galleries
for delete
to authenticated
using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS artworks
-- ---------------------------------------------------------------------------
alter table public.artworks enable row level security;

create policy artworks_select_own_or_staff
on public.artworks
for select
to authenticated
using (
  owner_id = auth.uid()
  or public.is_staff()
);

create policy artworks_select_public
on public.artworks
for select
to anon, authenticated
using (visibility_status = 'public');

create policy artworks_insert_own
on public.artworks
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_banned = true
  )
);

create policy artworks_update_own
on public.artworks
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy artworks_update_staff
on public.artworks
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy artworks_delete_own
on public.artworks
for delete
to authenticated
using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage bucket (privé) + policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artworks',
  'artworks',
  false,
  2097152, -- 2 Mo (fichier déjà compressé côté client)
  array['image/png', 'image/jpeg']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Chemin attendu : {auth.uid()}/{filename}

create policy artworks_storage_select
on storage.objects
for select
to authenticated, anon
using (
  bucket_id = 'artworks'
  and (
    -- Propriétaire du dossier
    (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
    or public.is_staff()
    or exists (
      select 1
      from public.artworks a
      where a.storage_path = name
        and a.visibility_status = 'public'
    )
  )
);

create policy artworks_storage_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_banned = true
  )
);

create policy artworks_storage_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy artworks_storage_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'artworks'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_staff()
  )
);
