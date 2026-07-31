-- Waleef Phase 4 schema additions: guardian-by-email dashboard + OTP, real
-- wali chat oversight, proposal approach behavior, two-tier verification,
-- match freeze/rate, new notification types, premium ranking boost,
-- pseudonym, delete-conversation.
--
-- ADDITIVE ONLY, safe to re-run: `if not exists` for tables/columns,
-- `create or replace`/scoped `drop function` only for functions, `drop
-- policy if exists` before every `create policy`.
--
-- The authoritative question bank content itself (103 bilingual questions)
-- was already seeded directly via the Supabase REST API using the existing
-- `questions` table -- no DDL was needed for that part, so it is not in this
-- file.

-- ---------------------------------------------------------------------------
-- C. Family/wali improvements
-- ---------------------------------------------------------------------------

alter table public.wali_invites add column if not exists chat_involved boolean not null default false;

-- Lets the requester (not the wali) toggle oversight on/off for their most
-- recent invite tied to a match. A security-definer RPC rather than a raw
-- UPDATE + RLS policy, since a blanket "requester can update own row" policy
-- would also let them rewrite status/wali_email from the client.
create or replace function public.set_wali_chat_involvement(p_match_id uuid, p_involved boolean)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_invite_id uuid;
begin
  select id into v_invite_id from public.wali_invites
  where match_id = p_match_id and requester_id = auth.uid()
  order by created_at desc
  limit 1;

  if v_invite_id is null then
    raise exception 'no wali invite for this match';
  end if;

  update public.wali_invites set chat_involved = p_involved where id = v_invite_id;
  return p_involved;
end;
$$;
grant execute on function public.set_wali_chat_involvement(uuid, boolean) to authenticated;

-- One-time login codes for the guardian-by-email dashboard (distinct from the
-- existing single-token /wali/[token] flow): a wali enters their email, gets
-- a 6-digit code by email (sent by the app, not this trigger), then uses it
-- to see every invite tied to that email in one place.
create table if not exists public.wali_login_codes (
  id uuid primary key default gen_random_uuid(),
  wali_email text not null,
  code text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists wali_login_codes_email_idx on public.wali_login_codes (wali_email, code);
alter table public.wali_login_codes enable row level security;
-- No client policies at all: only ever written/read via the service client
-- (send route) and the security-definer RPC below (verify route).

create or replace function public.get_wali_invites_for_email(p_email text, p_code text)
returns table (
  id uuid,
  status text,
  wali_name text,
  requester_name text,
  match_other_name text,
  chat_involved boolean,
  created_at timestamptz,
  responded_at timestamptz,
  token uuid
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_valid boolean;
begin
  select exists (
    select 1 from public.wali_login_codes
    where wali_email = p_email and code = p_code and consumed_at is null and expires_at > now()
  ) into v_valid;

  if not v_valid then
    raise exception 'invalid or expired code';
  end if;

  update public.wali_login_codes
  set consumed_at = now()
  where wali_email = p_email and code = p_code and consumed_at is null;

  return query
  select
    wi.id, wi.status, wi.wali_name,
    req.full_name as requester_name,
    other.full_name as match_other_name,
    wi.chat_involved, wi.created_at, wi.responded_at, wi.token
  from public.wali_invites wi
  join public.profiles req on req.id = wi.requester_id
  left join public.matches m on m.id = wi.match_id
  left join public.profiles other on other.id = (
    case when m.user_a = wi.requester_id then m.user_b else m.user_a end
  )
  where wi.wali_email = p_email
  order by wi.created_at desc;
end;
$$;
grant execute on function public.get_wali_invites_for_email(text, text) to anon, authenticated;

-- Read-only oversight of a match's chat, for a wali whose invite has
-- chat_involved = true and status = 'approved'. Token-scoped, same trust
-- model as get_wali_invite_by_token (a valid token is the credential).
create or replace function public.get_conversation_messages_for_wali(p_token uuid)
returns table (
  id uuid,
  sender_id uuid,
  sender_name text,
  body text,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_match_id uuid;
  v_involved boolean;
  v_status text;
begin
  select match_id, chat_involved, status into v_match_id, v_involved, v_status
  from public.wali_invites where token = p_token;

  if v_match_id is null or v_involved is not true or v_status <> 'approved' then
    raise exception 'not authorized';
  end if;

  return query
  select msg.id, msg.sender_id, p.full_name, msg.body, msg.created_at
  from public.messages msg
  join public.conversations c on c.id = msg.conversation_id
  join public.profiles p on p.id = msg.sender_id
  where c.match_id = v_match_id
  order by msg.created_at asc;
end;
$$;
grant execute on function public.get_conversation_messages_for_wali(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- D. Multi-tier verification (ID/document tier + photo/selfie tier)
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists photo_verified boolean not null default false;

alter table public.verification_requests drop constraint if exists verification_requests_document_type_check;
alter table public.verification_requests add constraint verification_requests_document_type_check
  check (document_type in ('national_id', 'passport', 'driver_license', 'selfie'));

create or replace function public.respond_to_verification_request(p_request_id uuid, p_status text, p_notes text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_document_type text;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'not authorized';
  end if;
  if p_status not in ('approved', 'rejected', 'changes_requested') then
    raise exception 'invalid status';
  end if;

  update public.verification_requests
  set status = p_status, reviewed_at = now(), reviewed_by = auth.uid(), admin_notes = p_notes
  where id = p_request_id
  returning user_id, document_type into v_user_id, v_document_type;

  if v_user_id is null then
    return;
  end if;

  if p_status = 'approved' then
    if v_document_type = 'selfie' then
      update public.profiles set photo_verified = true where id = v_user_id;
    else
      update public.profiles set verified = true where id = v_user_id;
    end if;
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_user_id,
    'verification_status_change',
    case p_status
      when 'approved' then 'Verification approved'
      when 'rejected' then 'Verification rejected'
      else 'Changes requested on your verification'
    end,
    p_notes,
    '/dashboard/verification'
  );
end;
$$;
grant execute on function public.respond_to_verification_request(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- E. Post-engagement: freeze a match, rate the experience
-- ---------------------------------------------------------------------------

alter table public.matches add column if not exists status text not null default 'active'
  check (status in ('active', 'frozen'));

create or replace function public.set_match_status(p_match_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('active', 'frozen') then
    raise exception 'invalid status';
  end if;
  update public.matches
  set status = p_status
  where id = p_match_id and (user_a = auth.uid() or user_b = auth.uid());
end;
$$;
grant execute on function public.set_match_status(uuid, text) to authenticated;

create table if not exists public.match_ratings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  rated_by uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now(),
  unique (match_id, rated_by)
);
alter table public.match_ratings enable row level security;
drop policy if exists "match_ratings_select_participant" on public.match_ratings;
create policy "match_ratings_select_participant" on public.match_ratings for select to authenticated
  using (exists (
    select 1 from public.matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ));
drop policy if exists "match_ratings_insert_own" on public.match_ratings;
create policy "match_ratings_insert_own" on public.match_ratings for insert to authenticated
  with check (auth.uid() = rated_by and exists (
    select 1 from public.matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- F. New notification types
-- ---------------------------------------------------------------------------

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'new_match', 'new_message', 'profile_like', 'wali_status_change', 'verification_status_change',
    'payment_event', 'high_compatibility_match', 'profile_completion_reminder', 'optional_questions_requested'
  ));

-- Scheduled separately (see schema-phase3.sql's note on purge_expired_messages
-- for the same pattern): a nightly reminder for accounts stuck mid-onboarding.
create or replace function public.notify_incomplete_profiles()
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  select p.id, 'profile_completion_reminder', 'Finish setting up your profile',
    'Complete your profile to start seeing matches.', '/profile/create'
  from public.profiles p
  where p.onboarding_complete = false
    and p.created_at < now() - interval '2 days'
    and not exists (
      select 1 from public.notifications n
      where n.user_id = p.id and n.type = 'profile_completion_reminder'
        and n.created_at > now() - interval '7 days'
    );
end;
$$;
grant execute on function public.notify_incomplete_profiles() to authenticated;
-- Manual step (run once in the SQL editor, not in this file -- see
-- schema-phase3.sql's identical caveat about multi-statement transactions):
--   select cron.schedule('notify-incomplete-profiles', '0 10 * * *',
--     $$select public.notify_incomplete_profiles()$$);

-- ---------------------------------------------------------------------------
-- G. Premium visibility boost + H. pseudonym + delete conversation
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists pseudonym text;

drop function if exists public.get_candidate_profiles(int, int, int, text, text, text[]);

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
  order by
    case p.subscription_tier when 'gold' then 0 when 'premium' then 1 else 2 end,
    p.created_at desc
  limit p_limit;
$$;
grant execute on function public.get_candidate_profiles(int, int, int, text, text, text[]) to authenticated;

create or replace function public.delete_conversation(p_conversation_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_match_id uuid;
begin
  select match_id into v_match_id from public.conversations
  where id = p_conversation_id
    and match_id in (select id from public.matches where user_a = auth.uid() or user_b = auth.uid());

  if v_match_id is null then
    raise exception 'not authorized';
  end if;

  delete from public.messages where conversation_id = p_conversation_id;
  delete from public.conversations where id = p_conversation_id;
end;
$$;
grant execute on function public.delete_conversation(uuid) to authenticated;
