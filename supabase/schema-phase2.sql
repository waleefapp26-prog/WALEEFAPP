-- Waleef Phase 2 schema additions: filters, safety (block/report), family/wali
-- invites, and subscription/payment columns.
--
-- IMPORTANT: unlike schema.sql, this file is ADDITIVE ONLY. It must never
-- drop a Phase 1 table (profiles/swipes/matches/conversations/messages) --
-- real user data now exists. Safe to re-run: uses `if not exists` for tables
-- and `create or replace`/scoped `drop function` only for functions.

-- ---------------------------------------------------------------------------
-- A. Safety: blocks + reports, and extended candidate discovery filters
-- ---------------------------------------------------------------------------

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists "blocks_select_own" on public.blocks;
create policy "blocks_select_own" on public.blocks for select to authenticated using (auth.uid() = blocker_id);
drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own" on public.blocks for insert to authenticated with check (auth.uid() = blocker_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports for select to authenticated using (auth.uid() = reporter_id);
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);

-- Extend get_candidate_profiles with optional filters + block exclusion.
-- The old (int) signature is being replaced with a longer parameter list, so
-- the old function must be dropped by its exact old signature first.
drop function if exists public.get_candidate_profiles(int);

create or replace function public.get_candidate_profiles(
  p_limit int default 20,
  p_age_min int default null,
  p_age_max int default null,
  p_location text default null,
  p_education text default null,
  p_interests text[] default null
)
returns setof public.profiles
language sql stable as $$
  select p.* from public.profiles p
  where p.id <> auth.uid()
    and p.onboarding_complete = true
    and (select gender from public.profiles me where me.id = auth.uid()) is distinct from p.gender
    and not exists (
      select 1 from public.swipes s where s.actor_id = auth.uid() and s.target_id = p.id
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
    )
    and (p_age_min is null or p.age >= p_age_min)
    and (p_age_max is null or p.age <= p_age_max)
    and (p_location is null or p.location ilike '%' || p_location || '%')
    and (p_education is null or p.education = p_education)
    and (p_interests is null or p.interests && p_interests)
  order by p.created_at desc
  limit p_limit;
$$;
grant execute on function public.get_candidate_profiles(int, int, int, text, text, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- B. Family/wali invites (token-based, no wali account needed)
-- ---------------------------------------------------------------------------

create table if not exists public.wali_invites (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  wali_name text not null,
  wali_relation text not null,
  wali_phone text,
  wali_email text not null,
  token uuid not null default gen_random_uuid() unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  notes text,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
alter table public.wali_invites enable row level security;
drop policy if exists "wali_invites_select_own" on public.wali_invites;
create policy "wali_invites_select_own" on public.wali_invites for select to authenticated using (auth.uid() = requester_id);
drop policy if exists "wali_invites_insert_own" on public.wali_invites;
create policy "wali_invites_insert_own" on public.wali_invites for insert to authenticated with check (auth.uid() = requester_id);
-- No update/select policy for anonymous users: the public /wali/[token] page
-- goes through the two security-definer RPCs below instead, so a valid
-- token (not a Supabase session) is the credential.

create or replace function public.get_wali_invite_by_token(p_token uuid)
returns table (
  id uuid,
  status text,
  wali_name text,
  requester_name text,
  match_other_name text
)
language sql stable security definer set search_path = public as $$
  select
    wi.id,
    wi.status,
    wi.wali_name,
    req.full_name as requester_name,
    other.full_name as match_other_name
  from public.wali_invites wi
  join public.profiles req on req.id = wi.requester_id
  left join public.matches m on m.id = wi.match_id
  left join public.profiles other on other.id = (
    case when m.user_a = wi.requester_id then m.user_b else m.user_a end
  )
  where wi.token = p_token;
$$;
grant execute on function public.get_wali_invite_by_token(uuid) to anon, authenticated;

create or replace function public.respond_to_wali_invite(p_token uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('approved', 'declined') then
    raise exception 'invalid status';
  end if;

  update public.wali_invites
  set status = p_status, responded_at = now()
  where token = p_token and status = 'pending';
end;
$$;
grant execute on function public.respond_to_wali_invite(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- C. Subscriptions/payments
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists subscription_tier text not null default 'free'
  check (subscription_tier in ('free', 'premium', 'gold'));
alter table public.profiles add column if not exists subscription_expires_at timestamptz;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  gateway_payment_id text not null unique,
  plan text not null,
  amount numeric not null,
  currency text not null default 'QAR',
  status text not null,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select to authenticated using (auth.uid() = user_id);
-- No client-side insert/update policy: payments rows are only ever written
-- by the webhook route using the service-role key, which bypasses RLS.
