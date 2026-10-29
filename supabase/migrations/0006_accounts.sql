-- Customer logins: each couple gets an account that can manage only the events assigned to it.
-- The site owner still signs in with ADMIN_PASSWORD and sees everything.

create table if not exists public.account (
  id uuid primary key default gen_random_uuid(),
  -- Stored lower-case; sign-in matches case-insensitively.
  username text not null unique check (username = lower(username) and char_length(username) between 3 and 40),
  name text not null default '',
  -- scrypt$<salt hex>$<hash hex>, written by the server (src/lib/password.ts).
  password_hash text not null,
  -- Bumped on password reset so existing sessions stop working.
  token_version int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.account enable row level security;

-- An event belongs to at most one customer account; deleting the account keeps the event.
alter table public.event add column if not exists account_id uuid references public.account(id) on delete set null;
create index if not exists event_account_idx on public.event (account_id);

-- Same view as 0004 plus the owner, appended last so existing columns keep their positions.
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
       coalesce(sum(g.rsvp_count) filter (where g.rsvp_status = 'yes'), 0)::int as attending,
       e.account_id
  from public.event e
  left join public.guest g on g.event_id = e.id
 group by e.id;

revoke all on public.event_summary from anon, authenticated;
revoke all on public.account from anon, authenticated;
