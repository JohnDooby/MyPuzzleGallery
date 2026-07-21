-- Correctif : autoriser le seed du premier SuperAdmin depuis le SQL Editor.
-- Contexte : auth.uid() est null dans le SQL Editor → le trigger bloquait le UPDATE.
-- À exécuter si la migration initiale est déjà appliquée.

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
