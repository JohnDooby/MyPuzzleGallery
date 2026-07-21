-- Journal d'audit unifié (E08) — publications, éditions, suppressions, modération

create type public.audit_action as enum (
  'artwork_created',
  'artwork_updated',
  'artwork_deleted',
  'visibility_requested',
  'moderation_approved',
  'moderation_rejected'
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  action public.audit_action not null,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  artwork_id uuid references public.artworks (id) on delete set null,
  artwork_title text not null default '',
  artwork_description text not null default '',
  storage_path text,
  client_ip text,
  created_at timestamptz not null default now()
);

create index audit_events_created_at_idx
  on public.audit_events (created_at desc);

create index audit_events_action_idx
  on public.audit_events (action);

create index audit_events_actor_id_idx
  on public.audit_events (actor_id);

comment on table public.audit_events is
  'Journal d’audit : qui publie / modifie / supprime / modère quoi (snapshots titre/description).';

alter table public.audit_events enable row level security;

-- Lecture : staff uniquement
create policy audit_events_select_staff
on public.audit_events
for select
to authenticated
using (public.is_staff());

-- Insertion : acteur = soi-même (auteur ou staff)
create policy audit_events_insert_own
on public.audit_events
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_banned = true
  )
);

-- Pas d’UPDATE / DELETE client (immuable)

-- Liste Admin + SuperAdmin
create or replace function public.admin_list_audit_events(
  limit_count integer default 50,
  action_filter public.audit_action default null,
  pseudo_filter text default null
)
returns table (
  id uuid,
  action public.audit_action,
  actor_id uuid,
  actor_pseudo text,
  artwork_id uuid,
  artwork_title text,
  artwork_description text,
  storage_path text,
  client_ip text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  q text := trim(coalesce(pseudo_filter, ''));
begin
  if not public.is_staff() then
    raise exception 'Accès réservé au staff (Admin / SuperAdmin)';
  end if;

  return query
  select
    e.id,
    e.action,
    e.actor_id,
    p.pseudo,
    e.artwork_id,
    e.artwork_title,
    e.artwork_description,
    e.storage_path,
    e.client_ip,
    e.created_at
  from public.audit_events e
  join public.profiles p on p.id = e.actor_id
  where (action_filter is null or e.action = action_filter)
    and (q = '' or p.pseudo ilike '%' || q || '%')
  order by e.created_at desc
  limit greatest(1, least(coalesce(limit_count, 50), 200));
end;
$$;

revoke all on function public.admin_list_audit_events(integer, public.audit_action, text) from public;
grant execute on function public.admin_list_audit_events(integer, public.audit_action, text) to authenticated;
