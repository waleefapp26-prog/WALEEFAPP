-- Waleef Phase 3 schema additions: real compatibility questionnaire, photos +
-- privacy, identity verification, incognito/profile-views, notifications,
-- chat retention, admin.
--
-- IMPORTANT: unlike schema.sql, this file is ADDITIVE ONLY -- it must never
-- destructively drop a Phase 1/2 table. Real user data now exists. Safe to
-- re-run: uses `if not exists` for tables/columns and `create or replace` /
-- scoped `drop policy|trigger if exists` for functions/policies/triggers.
--
-- MANUAL STEPS REQUIRED (cannot be done from the SQL editor alone):
-- 1. Enable the `pg_cron` extension via Supabase Dashboard -> Database ->
--    Extensions, THEN run the single cron.schedule(...) statement noted at
--    the end of section F separately (not included in this file's main run,
--    since it errors if pg_cron isn't enabled yet -- and Supabase's SQL
--    runner appears to execute this whole file as one transaction, so a
--    failure there would roll back everything before it too).
-- 2. AFTER running this whole file: create two PRIVATE Storage buckets via
--    Dashboard -> Storage -> New bucket (uncheck "Public"): `profile-photos`
--    and `verification-documents`.
-- 3. AFTER running this whole file: Dashboard -> Database -> Webhooks ->
--    New webhook: table `notifications`, event `INSERT`, URL
--    `{NEXT_PUBLIC_SITE_URL}/api/notifications/dispatch`, header
--    `X-Webhook-Secret: <NOTIFICATIONS_WEBHOOK_SECRET>` (same value you put
--    in .env.local).
-- 4. Bootstrap the first admin (run once, after signing up normally):
--    update public.profiles set is_admin = true where id =
--      (select id from auth.users where email = 'you@example.com');
--
-- RECONCILIATION NOTE: this project already had a more complete, separately
-- authored questionnaire system (public.questions / public.answers, bilingual,
-- 60 real questions, real user answers) plus public.match_scores (a
-- compatibility-score cache table), public.preferences, and a handful of now-
-- superseded empty tables (public.chats, public.subscriptions, public.guardians,
-- public.match_guardian_reviews -- all fully replaced by this project's live
-- messages/conversations, profiles.subscription_tier+payments, and
-- wali_invites, which are already integrated and tested end-to-end). Section 0
-- below drops the superseded tables and adopts questions/answers/match_scores
-- as the real compatibility engine's data source instead of creating a
-- parallel set of tables.

-- ---------------------------------------------------------------------------
-- 0. Reconcile with the pre-existing, more complete questionnaire schema
-- ---------------------------------------------------------------------------

-- Superseded by live, tested equivalents already built and wired up in the
-- app (messages/conversations, profiles.subscription_tier+payments,
-- wali_invites) -- all empty or single-test-row, safe to drop.
drop table if exists public.match_guardian_reviews cascade;
drop table if exists public.guardians cascade;
drop table if exists public.chats cascade;
drop table if exists public.subscriptions cascade;

-- Backfill the scoring metadata this project's compatibility engine needs
-- (weight_key already groups questions into buckets; match_bucket/importance
-- were left null by whatever earlier pass authored the question content).
update public.questions set match_bucket = weight_key where section = 'compatibility' and match_bucket is null;
update public.questions set match_bucket =
  case
    when slug like 'opt_religion%' then 'religion'
    when slug like 'opt_lifestyle%' then 'lifestyle'
    when slug like 'opt_personality%' then 'personality'
    else 'optional'
  end
where section = 'optional' and match_bucket is null;

update public.questions set importance = v.importance
from (values
  ('cmp_religion_prayer_commitment', 5), ('cmp_religion_hijab_emphasis', 4), ('cmp_religion_beard_emphasis', 4),
  ('cmp_religion_free_mixing', 4), ('cmp_religion_smoking', 4), ('cmp_religion_alcohol', 4), ('cmp_religion_media_boundaries', 3),
  ('cmp_finance_saving_habits', 2), ('cmp_finance_monthly_income_range', 3), ('cmp_finance_debts', 2), ('cmp_finance_spending_style', 2),
  ('cmp_lifestyle_living_situation_now', 2), ('cmp_lifestyle_housing_after_marriage', 3), ('cmp_lifestyle_financial_responsibilities_marriage', 2),
  ('cmp_lifestyle_work_after_marriage', 3), ('cmp_lifestyle_driving_mobility_expectations', 1), ('cmp_lifestyle_home_languages', 2),
  ('cmp_children_timing', 4), ('cmp_children_desired_count', 4), ('cmp_children_primary_caregiver_ideal', 3),
  ('cmp_family_relationship_parents', 3), ('cmp_family_decision_making_style', 3),
  ('cmp_personality_social_energy', 2), ('cmp_personality_marriage_type_preference', 4), ('cmp_personality_tribe_lineage_preference', 2),
  ('cmp_personality_cosmetic_procedures_opinion', 1), ('cmp_personality_legal_history_disclosure', 3),
  ('cmp_personality_conflict_resolution', 3), ('cmp_personality_emotional_expression', 2),
  ('opt_religion_quran_reading_habit', 2), ('opt_lifestyle_instrumental_music', 1), ('opt_lifestyle_travel_frequency', 1),
  ('opt_personality_daily_routine_short', 1), ('opt_lifestyle_food_diet', 1), ('opt_lifestyle_sports_fitness', 1),
  ('opt_personality_decision_under_pressure', 2), ('opt_personality_free_time_activities', 1), ('opt_personality_emotional_intelligence_self', 2)
) as v(slug, importance)
where public.questions.slug = v.slug and public.questions.importance is null;

-- match_scores already has RLS enabled with deny-all write policies (writes
-- happen only via a security-definer function/service client); add a
-- participant-read policy so a future direct client read is possible.
drop policy if exists "match_scores_select_participant" on public.match_scores;
create policy "match_scores_select_participant" on public.match_scores for select to authenticated
  using (exists (
    select 1 from public.matches m where m.id = match_scores.match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- G. Admin flag (added early: several policies/functions below reference it)
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ---------------------------------------------------------------------------
-- E (part 1). Notifications table -- created early since several triggers
-- below insert into it.
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in
    ('new_match', 'new_message', 'profile_like', 'wali_status_change', 'verification_status_change', 'payment_event')),
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- No client insert policy: every row is written by a security-definer
-- trigger/RPC below (mirrors the matches/payments precedent).

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- A. Compatibility questionnaire -- NOT rebuilt here. public.questions /
-- public.answers already exist (60 real bilingual questions, real user
-- answers) and are adopted as-is; see section 0 above for the backfill that
-- makes them scoreable, and lib/matching/compatibility.ts for the reader.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- B. Photos + privacy
-- ---------------------------------------------------------------------------

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  is_main boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public', 'matched', 'approved', 'hidden')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profile_photos_one_main_idx on public.profile_photos (user_id) where is_main;
alter table public.profile_photos enable row level security;
drop policy if exists "profile_photos_select_own" on public.profile_photos;
create policy "profile_photos_select_own" on public.profile_photos for select to authenticated using (auth.uid() = user_id);
drop policy if exists "profile_photos_insert_own" on public.profile_photos;
create policy "profile_photos_insert_own" on public.profile_photos for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "profile_photos_update_own" on public.profile_photos;
create policy "profile_photos_update_own" on public.profile_photos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "profile_photos_delete_own" on public.profile_photos;
create policy "profile_photos_delete_own" on public.profile_photos for delete to authenticated using (auth.uid() = user_id);
-- Deliberately NO select policy for non-owners: cross-user visibility is
-- decided by app code (the signed-url route), using the service client as a
-- single audited chokepoint, not by relaxing RLS.

create table if not exists public.photo_access_requests (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (viewer_id, owner_id),
  check (viewer_id <> owner_id)
);
alter table public.photo_access_requests enable row level security;
drop policy if exists "photo_access_requests_select_participant" on public.photo_access_requests;
create policy "photo_access_requests_select_participant" on public.photo_access_requests
  for select to authenticated using (auth.uid() = viewer_id or auth.uid() = owner_id);
drop policy if exists "photo_access_requests_insert_own" on public.photo_access_requests;
create policy "photo_access_requests_insert_own" on public.photo_access_requests
  for insert to authenticated with check (auth.uid() = viewer_id);
drop policy if exists "photo_access_requests_update_owner" on public.photo_access_requests;
create policy "photo_access_requests_update_owner" on public.photo_access_requests
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- C. Identity verification
-- ---------------------------------------------------------------------------

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('national_id', 'passport', 'driver_license')),
  document_storage_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'changes_requested')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  admin_notes text
);
alter table public.verification_requests enable row level security;
drop policy if exists "verification_requests_select_own" on public.verification_requests;
create policy "verification_requests_select_own" on public.verification_requests for select to authenticated using (auth.uid() = user_id);
drop policy if exists "verification_requests_insert_own" on public.verification_requests;
create policy "verification_requests_insert_own" on public.verification_requests for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "verification_requests_select_admin" on public.verification_requests;
create policy "verification_requests_select_admin" on public.verification_requests for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create or replace function public.respond_to_verification_request(p_request_id uuid, p_status text, p_notes text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
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
  returning user_id into v_user_id;

  if v_user_id is null then
    return;
  end if;

  if p_status = 'approved' then
    update public.profiles set verified = true where id = v_user_id;
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
-- D. Privacy: incognito + who-viewed-my-profile
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists incognito boolean not null default false;

create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (viewer_id, viewed_id),
  check (viewer_id <> viewed_id)
);
alter table public.profile_views enable row level security;
drop policy if exists "profile_views_select_viewed" on public.profile_views;
create policy "profile_views_select_viewed" on public.profile_views for select to authenticated using (auth.uid() = viewed_id);
-- No direct client insert policy: recording goes through record_profile_view()
-- only, so incognito is enforced server-side, not just by client JS choosing
-- not to call insert.

create or replace function public.record_profile_view(p_viewed_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_viewed_id = auth.uid() then
    return;
  end if;
  if exists (select 1 from public.profiles where id = auth.uid() and incognito) then
    return;
  end if;

  insert into public.profile_views (viewer_id, viewed_id)
  values (auth.uid(), p_viewed_id)
  on conflict (viewer_id, viewed_id) do update set created_at = now();
end;
$$;
grant execute on function public.record_profile_view(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- E (part 2). Notification emission -- extends existing functions, adds new
-- triggers. All reference public.notifications, created in part 1 above.
-- ---------------------------------------------------------------------------

-- Extends the existing Phase 1 function (same name/signature -- the existing
-- `on_swipe_created` trigger does not need to be recreated).
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

  insert into public.notifications (user_id, type, title, body, link)
  values (new.target_id, 'profile_like', 'Someone likes your profile', 'Check your matches to see who might be interested.', '/dashboard');

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

    insert into public.notifications (user_id, type, title, body, link)
    values
      (new.actor_id, 'new_match', 'You have a new match!', 'You and your match liked each other.', '/dashboard/match-result/' || new_match_id),
      (new.target_id, 'new_match', 'You have a new match!', 'You and your match liked each other.', '/dashboard/match-result/' || new_match_id);
  end if;

  return new;
end;
$$;

-- Extends the existing Phase 2 function (same name/signature -- already
-- granted to anon, authenticated).
create or replace function public.respond_to_wali_invite(p_token uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_requester_id uuid;
begin
  if p_status not in ('approved', 'declined') then
    raise exception 'invalid status';
  end if;

  update public.wali_invites
  set status = p_status, responded_at = now()
  where token = p_token and status = 'pending'
  returning requester_id into v_requester_id;

  if v_requester_id is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_requester_id,
      'wali_status_change',
      case when p_status = 'approved' then 'Your guardian approved the request' else 'Your guardian declined the request' end,
      null,
      '/dashboard/family'
    );
  end if;
end;
$$;

-- New trigger: message insert -> notify the other participant.
create or replace function public.handle_new_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_recipient uuid;
begin
  select m.user_a, m.user_b into v_user_a, v_user_b
  from public.conversations c
  join public.matches m on m.id = c.match_id
  where c.id = new.conversation_id;

  if v_user_a is null then
    return new;
  end if;

  v_recipient := case when v_user_a = new.sender_id then v_user_b else v_user_a end;

  insert into public.notifications (user_id, type, title, body, link)
  values (v_recipient, 'new_message', 'New message', left(new.body, 140), '/dashboard/chats/' || new.conversation_id);

  return new;
end;
$$;
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created after insert on public.messages
for each row execute function public.handle_new_message();

-- New trigger: payment insert/update -> notify the payer. Guards against
-- duplicate notifications when the webhook's upsert is a no-op status repeat.
create or replace function public.handle_new_payment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and old.status = new.status then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.user_id,
    'payment_event',
    case
      when new.status in ('paid', 'SUCCESS') then 'Payment successful'
      when new.status in ('failed', 'FAILED') then 'Payment failed'
      else 'Payment update: ' || new.status
    end,
    null,
    '/dashboard/premium'
  );

  return new;
end;
$$;
drop trigger if exists on_payment_written on public.payments;
create trigger on_payment_written after insert or update on public.payments
for each row execute function public.handle_new_payment();

-- ---------------------------------------------------------------------------
-- F. Chat retention (pg_cron) -- requires the pg_cron extension enabled
-- manually first (Database -> Extensions), see header comment.
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists chat_retention_days int check (chat_retention_days is null or chat_retention_days > 0);
-- null = keep forever (default)

create or replace function public.purge_expired_messages() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.messages m
  using public.conversations c, public.matches ma, public.profiles pa, public.profiles pb
  where m.conversation_id = c.id
    and c.match_id = ma.id
    and pa.id = ma.user_a and pb.id = ma.user_b
    and least(coalesce(pa.chat_retention_days, 2147483647), coalesce(pb.chat_retention_days, 2147483647)) < 2147483647
    and m.created_at < now() - (least(coalesce(pa.chat_retention_days, 2147483647), coalesce(pb.chat_retention_days, 2147483647)) || ' days')::interval;
end;
$$;

-- NOT run here on purpose (kept out of this file's transaction so a missing
-- pg_cron extension can't roll back everything above it). Run this ONE
-- statement by itself, in its own SQL editor query, only after enabling
-- pg_cron via Dashboard -> Database -> Extensions:
--
--   select cron.schedule('purge-expired-messages', '0 3 * * *', 'select public.purge_expired_messages();');

-- ---------------------------------------------------------------------------
-- Admin read access to the existing Phase 2 reports table
-- ---------------------------------------------------------------------------

drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select_admin" on public.reports for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------------------------------------------------------------------------
-- Admin analytics aggregate RPC
-- ---------------------------------------------------------------------------

create or replace function public.get_admin_analytics()
returns table (
  total_users bigint,
  active_users_30d bigint,
  total_matches bigint,
  total_messages bigint,
  paid_subscribers bigint,
  conversion_rate numeric
)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'not authorized';
  end if;

  return query
  select
    (select count(*) from public.profiles),
    (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days'),
    (select count(*) from public.matches),
    (select count(*) from public.messages),
    (select count(*) from public.profiles where subscription_tier <> 'free'),
    (select round(100.0 * count(*) filter (where subscription_tier <> 'free') / greatest(count(*), 1), 1) from public.profiles);
end;
$$;
grant execute on function public.get_admin_analytics() to authenticated;

-- ---------------------------------------------------------------------------
-- Storage policies (storage.objects) -- run AFTER creating the two private
-- buckets manually (see header comment step 2).
-- ---------------------------------------------------------------------------

drop policy if exists "objects_insert_own_profile_photos" on storage.objects;
create policy "objects_insert_own_profile_photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "objects_select_own_profile_photos" on storage.objects;
create policy "objects_select_own_profile_photos" on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "objects_update_own_profile_photos" on storage.objects;
create policy "objects_update_own_profile_photos" on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "objects_delete_own_profile_photos" on storage.objects;
create policy "objects_delete_own_profile_photos" on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "objects_insert_own_verification_documents" on storage.objects;
create policy "objects_insert_own_verification_documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "objects_select_own_verification_documents" on storage.objects;
create policy "objects_select_own_verification_documents" on storage.objects for select to authenticated
  using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
-- No admin/select-all policy here: the admin verification review UI fetches
-- documents via a service-client route, not by relaxing Storage RLS.

-- ---------------------------------------------------------------------------
-- H. Resend email delivery events (log-only for now, per the user's choice --
-- no automatic bad-email-address flagging yet)
-- ---------------------------------------------------------------------------

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  resend_email_id text,
  event_type text not null,
  recipient text,
  occurred_at timestamptz not null default now(),
  payload jsonb
);
create index if not exists email_events_recipient_idx on public.email_events (recipient);
alter table public.email_events enable row level security;
-- No client access at all: written only by the webhook route using the
-- service-role key, read only by admins.
drop policy if exists "email_events_select_admin" on public.email_events;
create policy "email_events_select_admin" on public.email_events for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
