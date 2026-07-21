-- Mini-journal de modération (E05 / préfiguration E08)

create type public.moderation_decision as enum ('approved', 'rejected');

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  decision public.moderation_decision not null,
  previous_status public.artwork_visibility not null,
  new_status public.artwork_visibility not null,
  created_at timestamptz not null default now()
);

create index moderation_events_created_at_idx
  on public.moderation_events (created_at desc);

create index moderation_events_artwork_id_idx
  on public.moderation_events (artwork_id);

comment on table public.moderation_events is
  'Journal des décisions de modération (valider / refuser).';

alter table public.moderation_events enable row level security;

create policy moderation_events_select_staff
on public.moderation_events
for select
to authenticated
using (public.is_staff());

create policy moderation_events_insert_staff
on public.moderation_events
for insert
to authenticated
with check (
  public.is_staff()
  and actor_id = auth.uid()
);

-- File de modération : œuvres pending + pseudo auteur
create or replace function public.admin_list_pending_artworks()
returns table (
  id uuid,
  owner_id uuid,
  gallery_id uuid,
  title text,
  description text,
  hours_spent numeric,
  visibility_status public.artwork_visibility,
  puzzle_enabled boolean,
  storage_path text,
  mime_type text,
  byte_size integer,
  width_px integer,
  height_px integer,
  was_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  author_pseudo text
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
    a.id,
    a.owner_id,
    a.gallery_id,
    a.title,
    a.description,
    a.hours_spent,
    a.visibility_status,
    a.puzzle_enabled,
    a.storage_path,
    a.mime_type,
    a.byte_size,
    a.width_px,
    a.height_px,
    a.was_public,
    a.created_at,
    a.updated_at,
    p.pseudo
  from public.artworks a
  join public.profiles p on p.id = a.owner_id
  where a.visibility_status = 'pending_public'
  order by a.created_at asc;
end;
$$;

revoke all on function public.admin_list_pending_artworks() from public;
grant execute on function public.admin_list_pending_artworks() to authenticated;

-- Derniers événements de modération (avec titres / pseudos)
create or replace function public.admin_list_moderation_events(limit_count integer default 20)
returns table (
  id uuid,
  artwork_id uuid,
  artwork_title text,
  author_pseudo text,
  actor_pseudo text,
  decision public.moderation_decision,
  previous_status public.artwork_visibility,
  new_status public.artwork_visibility,
  created_at timestamptz
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
    e.id,
    e.artwork_id,
    a.title,
    author.pseudo,
    actor.pseudo,
    e.decision,
    e.previous_status,
    e.new_status,
    e.created_at
  from public.moderation_events e
  join public.artworks a on a.id = e.artwork_id
  join public.profiles author on author.id = a.owner_id
  join public.profiles actor on actor.id = e.actor_id
  order by e.created_at desc
  limit greatest(1, least(coalesce(limit_count, 20), 100));
end;
$$;

revoke all on function public.admin_list_moderation_events(integer) from public;
grant execute on function public.admin_list_moderation_events(integer) to authenticated;
