-- Pagination galerie publique : limit + offset (lots de 10 au scroll)

drop function if exists public.list_public_artworks(integer);

create or replace function public.list_public_artworks(
  limit_count integer default 10,
  offset_count integer default 0
)
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
  order by a.created_at desc, a.id desc
  limit greatest(1, least(coalesce(limit_count, 10), 50))
  offset greatest(0, coalesce(offset_count, 0));
end;
$$;

comment on function public.list_public_artworks(integer, integer) is
  'Œuvres publiques paginées (created_at desc), lots typiques de 10 — anon / authentifié.';

revoke all on function public.list_public_artworks(integer, integer) from public;
grant execute on function public.list_public_artworks(integer, integer) to anon, authenticated;
