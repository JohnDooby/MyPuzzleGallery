-- Explore public : liste des dernières œuvres publiques (+ pseudo auteur)

create or replace function public.list_public_artworks(limit_count integer default 20)
returns table (
  id uuid,
  title text,
  description text,
  puzzle_enabled boolean,
  storage_path text,
  mime_type text,
  width_px integer,
  height_px integer,
  created_at timestamptz,
  author_pseudo text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    a.id,
    a.title,
    a.description,
    a.puzzle_enabled,
    a.storage_path,
    a.mime_type,
    a.width_px,
    a.height_px,
    a.created_at,
    p.pseudo
  from public.artworks a
  join public.profiles p on p.id = a.owner_id
  where a.visibility_status = 'public'
    and p.is_banned = false
  order by a.created_at desc
  limit greatest(1, least(coalesce(limit_count, 20), 20));
end;
$$;

comment on function public.list_public_artworks(integer) is
  'Dernières œuvres publiques (max 20) avec pseudo auteur — accessible anon / authentifié.';

revoke all on function public.list_public_artworks(integer) from public;
grant execute on function public.list_public_artworks(integer) to anon, authenticated;
