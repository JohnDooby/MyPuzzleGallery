-- RPC staff : liste des profils + e-mail Auth (pour la page Admin).
-- L'e-mail reste hors de public.profiles ; exposé uniquement via cette fonction.

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  pseudo text,
  role public.app_role,
  is_banned boolean,
  created_at timestamptz,
  updated_at timestamptz,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Accès réservé au staff (Admin / SuperAdmin)';
  end if;

  return query
  select
    p.id,
    p.pseudo,
    p.role,
    p.is_banned,
    p.created_at,
    p.updated_at,
    u.email::text
  from public.profiles p
  left join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

comment on function public.admin_list_profiles() is
  'Liste comptes + e-mail pour Admin/SuperAdmin uniquement.';

revoke all on function public.admin_list_profiles() from public;
grant execute on function public.admin_list_profiles() to authenticated;
