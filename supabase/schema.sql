-- Waleef Phase 1 schema: profiles, swipes, matches, conversations, messages.
-- Paste this whole file into the Supabase SQL editor and run it.
-- Safe to re-run from scratch: it tears down its own objects first (only do
-- this on a fresh project with no real user data yet).

drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.matches cascade;
drop table if exists public.swipes cascade;
drop table if exists public.profiles cascade;
drop type if exists public.swipe_action cascade;
drop function if exists public.handle_new_swipe() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.get_candidate_profiles(int) cascade;

-- profiles -----------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age int,
  gender text check (gender in ('male', 'female')),
  phone text,
  location text,
  prayer_frequency text[] not null default '{}',
  hijab_preference text,
  education text,
  occupation text,
  bio text,
  interests text[] not null default '{}',
  looking_for text,
  avatar_url text,
  verified boolean not null default false,
  premium boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_onboarding_complete_idx on public.profiles (onboarding_complete);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- bootstrap a bare profile row the instant an auth.users row appears, so a
-- profiles row always exists even before the onboarding wizard is completed
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- swipes (like/pass) --------------------------------------------------------
create type public.swipe_action as enum ('like', 'pass');
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  action public.swipe_action not null,
  created_at timestamptz not null default now(),
  unique (actor_id, target_id),
  check (actor_id <> target_id)
);
create index swipes_target_idx on public.swipes (target_id);

-- matches (mutual likes) -----------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

-- conversations & messages ---------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- mutual-like -> match + conversation trigger --------------------------------
create or replace function public.handle_new_swipe() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  reciprocal_exists boolean;
  new_match_id uuid;
  lo uuid;
  hi uuid;
begin
  if new.action <> 'like' then
    return new;
  end if;

  select exists (
    select 1 from public.swipes
    where actor_id = new.target_id and target_id = new.actor_id and action = 'like'
  ) into reciprocal_exists;

  if reciprocal_exists then
    lo := least(new.actor_id, new.target_id);
    hi := greatest(new.actor_id, new.target_id);

    insert into public.matches (user_a, user_b) values (lo, hi)
    on conflict (user_a, user_b) do nothing
    returning id into new_match_id;

    if new_match_id is null then
      select id into new_match_id from public.matches where user_a = lo and user_b = hi;
    end if;

    insert into public.conversations (match_id) values (new_match_id)
    on conflict (match_id) do nothing;
  end if;

  return new;
end;
$$;
create trigger on_swipe_created after insert on public.swipes
for each row execute function public.handle_new_swipe();

-- candidate discovery RPC: excludes self, already-swiped, same gender, and
-- incomplete profiles ---------------------------------------------------------
create or replace function public.get_candidate_profiles(p_limit int default 20)
returns setof public.profiles
language sql stable as $$
  select p.* from public.profiles p
  where p.id <> auth.uid()
    and p.onboarding_complete = true
    and (select gender from public.profiles me where me.id = auth.uid()) is distinct from p.gender
    and not exists (
      select 1 from public.swipes s where s.actor_id = auth.uid() and s.target_id = p.id
    )
  order by p.created_at desc
  limit p_limit;
$$;
grant execute on function public.get_candidate_profiles(int) to authenticated;

-- Row Level Security ----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- profiles: browsable by any authenticated user (candidate discovery needs
-- this); writable only by the owner. NOTE: this exposes `phone` to all
-- authenticated users since RLS is row-level, not column-level -- acceptable
-- simplification for Phase 1, flagged as a follow-up (a profiles_public view
-- excluding phone) for a later phase.
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- swipes: users only ever see their OWN outgoing swipes -- this is what
-- prevents someone from discovering who liked/passed on them before a mutual
-- match exists. Inserts only as yourself.
create policy "swipes_select_own" on public.swipes for select to authenticated using (auth.uid() = actor_id);
create policy "swipes_insert_own" on public.swipes for insert to authenticated with check (auth.uid() = actor_id);

-- matches: readable only by the two participants; no client-side writes at
-- all -- rows are only ever created by the SECURITY DEFINER trigger above.
create policy "matches_select_participant" on public.matches for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- conversations: readable only by participants of the underlying match
create policy "conversations_select_participant" on public.conversations for select to authenticated
  using (exists (
    select 1 from public.matches m
    where m.id = conversations.match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ));

-- messages: participants only, sender must be the requester
create policy "messages_select_participant" on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    join public.matches m on m.id = c.match_id
    where c.id = messages.conversation_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ));
create policy "messages_insert_participant" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = messages.conversation_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- Enable Realtime on messages so chat updates without a page refresh.
-- If this still errors (e.g. the supabase_realtime publication doesn't exist
-- on your project), enable Realtime for the `messages` table instead via
-- Database -> Replication in the dashboard.
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
