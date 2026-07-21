-- Autoriser l'auteur à retirer une œuvre du public (public -> private).
-- was_public reste true (trace).

create or replace function public.protect_artwork_visibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id ne peut pas être modifié';
  end if;

  if tg_op = 'INSERT' then
    if new.owner_id is distinct from auth.uid() and not public.is_staff() then
      raise exception 'owner_id doit correspondre au compte connecté';
    end if;
    if new.visibility_status not in ('private', 'pending_public')
       and not public.is_staff() then
      raise exception 'Visibilité initiale invalide (private ou pending_public)';
    end if;
  end if;

  if tg_op = 'UPDATE' and new.visibility_status is distinct from old.visibility_status then
    if public.is_staff() then
      null;
    elsif new.owner_id = auth.uid() then
      if old.visibility_status = 'public' and new.visibility_status = 'private' then
        -- Auteur retire du public
        null;
      elsif old.visibility_status in ('private', 'pending_public', 'rejected')
         and new.visibility_status in ('private', 'pending_public') then
        null;
      else
        raise exception 'Transition de visibilité non autorisée pour l''auteur';
      end if;

      if new.visibility_status = 'public' then
        raise exception 'Seul un Admin peut valider une œuvre en public';
      end if;
    else
      raise exception 'Modification de visibilité non autorisée';
    end if;
  end if;

  if new.visibility_status = 'public' then
    new.was_public := true;
  end if;

  return new;
end;
$$;
