-- Migration : profiles, rôles, trigger post-inscription, RLS
-- Itération A — feature/auth
-- À appliquer via Supabase SQL Editor ou `supabase db push` / migration CLI.

-- ---------------------------------------------------------------------------
-- Enum rôle
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('normal', 'admin', 'superadmin');

-- ---------------------------------------------------------------------------
-- Table profiles (1–1 avec auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null,
  role public.app_role not null default 'normal',
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_pseudo_length check (char_length(pseudo) between 2 and 32),
  constraint profiles_pseudo_trimmed check (pseudo = trim(pseudo))
);

create unique index profiles_pseudo_lower_uidx on public.profiles (lower(pseudo));

comment on table public.profiles is
  'Profil applicatif lié 1–1 à auth.users (pseudo, rôle, ban).';
comment on column public.profiles.role is
  'normal | admin | superadmin — seul superadmin peut changer le rôle.';
comment on column public.profiles.is_banned is
  'Compte banni : session inutilisable côté app + exclus des lectures publiques.';

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers RLS (security definer — lecture rôle sans récursion de policy)
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_banned = false;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'superadmin')
      and p.is_banned = false
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
      and p.is_banned = false
  );
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.is_staff() from public;
revoke all on function public.is_superadmin() from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_superadmin() to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger : création du profil à l’inscription Auth
-- Pseudo initial : metadata.pseudo, sinon partie locale de l’e-mail
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  initial_pseudo text;
  candidate text;
  suffix text;
begin
  initial_pseudo := nullif(trim(coalesce(new.raw_user_meta_data ->> 'pseudo', '')), '');

  if initial_pseudo is null then
    initial_pseudo := split_part(coalesce(new.email, 'user'), '@', 1);
  end if;

  -- Tronquer / pad minimal pour respecter la contrainte de longueur
  if char_length(initial_pseudo) < 2 then
    initial_pseudo := initial_pseudo || '01';
  end if;
  if char_length(initial_pseudo) > 32 then
    initial_pseudo := left(initial_pseudo, 32);
  end if;

  candidate := initial_pseudo;

  -- En cas de collision (unicité lower(pseudo)), suffixer avec 4 hex
  if exists (
    select 1 from public.profiles p where lower(p.pseudo) = lower(candidate)
  ) then
    suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
    candidate := left(initial_pseudo, greatest(2, 32 - 5)) || '-' || suffix;
  end if;

  insert into public.profiles (id, pseudo, role)
  values (new.id, candidate, 'normal');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Protection : seul un SuperAdmin peut changer role / is_banned
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privileges_changed boolean;
  bootstrap_allowed boolean;
begin
  privileges_changed :=
    (new.role is distinct from old.role)
    or (new.is_banned is distinct from old.is_banned);

  if not privileges_changed then
    return new;
  end if;

  -- Bootstrap initial : SQL Editor (pas de JWT → auth.uid() null), 0 superadmin
  bootstrap_allowed :=
    auth.uid() is null
    and not exists (
      select 1 from public.profiles p where p.role = 'superadmin'
    )
    and new.role = 'superadmin'
    and new.is_banned = false;

  if not bootstrap_allowed and not public.is_superadmin() then
    raise exception 'Seuls les SuperAdmin peuvent modifier role ou is_banned';
  end if;

  -- Un SuperAdmin ne peut pas se rétrograder lui-même (session authentifiée)
  if auth.uid() is not null
     and old.role = 'superadmin'
     and new.role is distinct from 'superadmin'
     and old.id = auth.uid() then
    raise exception 'Un SuperAdmin ne peut pas rétrograder son propre compte';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row
execute function public.protect_profile_privileges();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Lecture : son profil ; profils non bannis (pseudo public) ; staff voit tout
create policy profiles_select
on public.profiles
for select
to anon, authenticated
using (
  id = auth.uid()
  or is_banned = false
  or public.is_staff()
);

-- Pas d’INSERT client : uniquement le trigger handle_new_user
-- (pas de policy INSERT → refusé pour anon/authenticated)

-- Update : soi-même (pseudo) ou SuperAdmin (tout, dont role/ban via trigger)
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy profiles_update_superadmin
on public.profiles
for update
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

-- Pas de DELETE client : cascade depuis auth.users uniquement
