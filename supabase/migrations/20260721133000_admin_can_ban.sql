-- Autoriser Admin (staff) à modifier is_banned.
-- Les changements de role restent SuperAdmin uniquement.
-- RLS : policy d'update pour le staff ; le trigger borne les colonnes.

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bootstrap_allowed boolean;
begin
  -- --- Rôle : SuperAdmin uniquement (+ bootstrap SQL Editor) ---
  if new.role is distinct from old.role then
    bootstrap_allowed :=
      auth.uid() is null
      and not exists (
        select 1 from public.profiles p where p.role = 'superadmin'
      )
      and new.role = 'superadmin'
      and new.is_banned = false;

    if not bootstrap_allowed and not public.is_superadmin() then
      raise exception 'Seuls les SuperAdmin peuvent modifier le rôle';
    end if;

    if auth.uid() is not null
       and old.role = 'superadmin'
       and new.role is distinct from 'superadmin'
       and old.id = auth.uid() then
      raise exception 'Un SuperAdmin ne peut pas rétrograder son propre compte';
    end if;
  end if;

  -- --- Ban : Admin ou SuperAdmin ---
  if new.is_banned is distinct from old.is_banned then
    if not public.is_staff() then
      raise exception 'Seuls Admin et SuperAdmin peuvent modifier is_banned';
    end if;
  end if;

  -- --- Pseudo : soi-même ou SuperAdmin ---
  if new.pseudo is distinct from old.pseudo then
    if auth.uid() is distinct from old.id and not public.is_superadmin() then
      raise exception 'Seul le titulaire ou un SuperAdmin peut modifier le pseudo';
    end if;
  end if;

  return new;
end;
$$;

-- Policy : staff peut UPDATE (colonnes bornées par le trigger ci-dessus)
drop policy if exists profiles_update_staff on public.profiles;

create policy profiles_update_staff
on public.profiles
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());
