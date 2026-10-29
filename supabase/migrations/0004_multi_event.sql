-- Multiple events: each event owns its agenda, guests (invitations) and wishes.
-- The existing single event keeps id 1, so every current guest link keeps working.

/* ---------- event ---------- */

alter table public.event drop constraint if exists event_id_check;

create sequence if not exists public.event_id_seq owned by public.event.id;
alter table public.event alter column id set default nextval('public.event_id_seq');

alter table public.event rename column groom to host_a;
alter table public.event rename column bride to host_b;

-- Keep in sync with EVENT_TYPES in src/lib/types.ts.
alter table public.event
  add column if not exists type text not null default 'wedding'
    check (type in ('wedding', 'engagement', 'birthday', 'housewarming', 'other')),
  add column if not exists name text not null default '',
  add column if not exists created_at timestamptz not null default now();

-- Rows created before this migration belong to event 1; make sure it exists.
insert into public.event (id)
select 1
 where not exists (select 1 from public.event)
   and (exists (select 1 from public.guest) or exists (select 1 from public.schedule_day));

-- Continue numbering after the existing row(s).
select setval('public.event_id_seq', coalesce((select max(id) from public.event), 0) + 1, false);

update public.event
   set name = coalesce(nullif(trim(both ' &' from host_a || ' & ' || host_b), ''), 'Event ' || id)
 where name = '';

/* ---------- event_id on owned rows ---------- */

alter table public.schedule_day add column if not exists event_id int references public.event(id) on delete cascade;
alter table public.guest add column if not exists event_id int references public.event(id) on delete cascade;
-- Duplicates guest.event_id so wish lists filter without a join.
alter table public.wish add column if not exists event_id int references public.event(id) on delete cascade;

update public.schedule_day set event_id = 1 where event_id is null;
update public.guest set event_id = 1 where event_id is null;
update public.wish w set event_id = g.event_id from public.guest g where g.id = w.guest_id and w.event_id is null;

alter table public.schedule_day alter column event_id set not null;
alter table public.guest alter column event_id set not null;
alter table public.wish alter column event_id set not null;

create index if not exists schedule_day_event_idx on public.schedule_day (event_id, sort);
create index if not exists guest_event_idx on public.guest (event_id, created_at);
create index if not exists wish_event_idx on public.wish (event_id, created_at);

/* ---------- agenda, scoped to one event ---------- */

drop function if exists public.save_agenda(jsonb);

-- Replaces one event's agenda in one transaction, so a failed insert can't leave it half-deleted.
-- p_days: [{ "title": text, "date": "YYYY-MM-DD" | null, "items": [{ "time": text, "name": text }] }]
create or replace function public.save_agenda(p_event_id int, p_days jsonb)
returns void language plpgsql as $$
declare
  d jsonb;
  d_sort int := 0;
  new_id uuid;
begin
  delete from public.schedule_day where event_id = p_event_id;
  for d in select value from jsonb_array_elements(p_days) loop
    insert into public.schedule_day (event_id, title, date, sort)
    values (p_event_id, coalesce(d->>'title', ''), nullif(d->>'date', '')::date, d_sort)
    returning id into new_id;
    insert into public.timeline_item (day_id, time, name, sort)
    select new_id, coalesce(it->>'time', ''), coalesce(it->>'name', ''), (ord - 1)::int
      from jsonb_array_elements(coalesce(d->'items', '[]'::jsonb)) with ordinality as t(it, ord);
    d_sort := d_sort + 1;
  end loop;
end;
$$;

revoke execute on function public.save_agenda(int, jsonb) from public, anon, authenticated;

/* ---------- per-event totals for the admin events list ---------- */

create or replace view public.event_summary with (security_invoker = true) as
select e.id,
       e.name,
       e.type,
       e.host_a,
       e.host_b,
       e.event_date,
       e.created_at,
       count(g.id)::int as guests,
       count(g.opened_at)::int as opened,
       count(*) filter (where g.rsvp_status = 'yes')::int as rsvp_yes,
       count(*) filter (where g.rsvp_status = 'no')::int as rsvp_no,
       coalesce(sum(g.rsvp_count) filter (where g.rsvp_status = 'yes'), 0)::int as attending
  from public.event e
  left join public.guest g on g.event_id = e.id
 group by e.id;

revoke all on public.event_summary from anon, authenticated;
