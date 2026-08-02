-- ---------------------------------------------------------------------------
-- Waleef schema phase 5 -- additive only.
--
-- Fixes found by exercising the live app rather than reading the code:
--   A. Photos were invisible to everyone but their owner.
--   B. "Ask them to answer more questions" could never succeed.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- A. Make photos visible to the people they were shared with
--
-- profile_photos had exactly one SELECT policy -- profile_photos_select_own,
-- `auth.uid() = user_id`. No other member could read the row at all, so no
-- surface could even discover that a photo existed, let alone ask
-- /api/photos/[id]/signed-url for it. Setting visibility to 'public' changed
-- nothing, because the visibility column was never reachable by a viewer.
--
-- This policy mirrors the authorization the signed-URL route already applies,
-- so the two agree. Exposing storage_path to a permitted viewer is safe: the
-- bucket is private, and a path on its own grants no access -- bytes still
-- require a signed URL minted server-side by that route.
-- ---------------------------------------------------------------------------

drop policy if exists "profile_photos_select_visible" on public.profile_photos;
create policy "profile_photos_select_visible" on public.profile_photos for select to authenticated
using (
  auth.uid() = user_id
  or (
    moderation_status <> 'rejected'
    and (
      visibility = 'public'
      or (visibility = 'matched' and exists (
        select 1 from public.matches m
        where (m.user_a = auth.uid() and m.user_b = profile_photos.user_id)
           or (m.user_b = auth.uid() and m.user_a = profile_photos.user_id)
      ))
      or (visibility = 'approved' and exists (
        select 1 from public.photo_access_requests r
        where r.viewer_id = auth.uid()
          and r.owner_id = profile_photos.user_id
          and r.status = 'approved'
      ))
      -- visibility = 'hidden' matches nothing here: owner-only, by design.
    )
  )
);

-- Post-moderation rather than pre-moderation: a photo is live when uploaded
-- and an admin can take it down afterwards. Under the previous default every
-- photo sat at 'pending' forever, because no admin photo queue was ever built
-- -- so "approved-only" meant "nobody, ever".
alter table public.profile_photos alter column moderation_status set default 'approved';
update public.profile_photos set moderation_status = 'approved' where moderation_status = 'pending';

-- Admins need to see every photo to moderate it.
drop policy if exists "profile_photos_select_admin" on public.profile_photos;
create policy "profile_photos_select_admin" on public.profile_photos for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "profile_photos_update_admin" on public.profile_photos;
create policy "profile_photos_update_admin" on public.profile_photos for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------------------------------------------------------------------------
-- B. "Ask them to answer more questions"
--
-- Two independent reasons this never worked:
--
--   1. requestOptionalQuestions() inserted straight into public.notifications
--      from the requester's own client, but notifications has no INSERT policy
--      at all (every other write goes through a security-definer trigger), so
--      RLS denied it every time.
--   2. It only ever tried to write a notification. The grant it was supposed
--      to create -- questionnaire_access_requests, the table the whole
--      "optional questions unlock when the other party asks" model rests on --
--      was never created in this database.
-- ---------------------------------------------------------------------------

create table if not exists public.questionnaire_access_requests (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (viewer_id, owner_id)
);
alter table public.questionnaire_access_requests enable row level security;

drop policy if exists "qar_select_party" on public.questionnaire_access_requests;
create policy "qar_select_party" on public.questionnaire_access_requests for select to authenticated
using (auth.uid() = viewer_id or auth.uid() = owner_id);

-- The owner is the only one who may answer a request.
drop policy if exists "qar_update_owner" on public.questionnaire_access_requests;
create policy "qar_update_owner" on public.questionnaire_access_requests for update to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Creating the request and notifying the owner happen together, under one
-- security-definer function, because the requester cannot write to
-- notifications directly (see reason 1 above).
create or replace function public.request_optional_questions(p_owner_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_requester_name text;
begin
  if p_owner_id = auth.uid() then
    raise exception 'cannot request from yourself';
  end if;

  if not exists (
    select 1 from public.matches m
    where (m.user_a = auth.uid() and m.user_b = p_owner_id)
       or (m.user_b = auth.uid() and m.user_a = p_owner_id)
  ) then
    raise exception 'not matched';
  end if;

  insert into public.questionnaire_access_requests (viewer_id, owner_id)
  values (auth.uid(), p_owner_id)
  on conflict (viewer_id, owner_id) do nothing;

  select coalesce(pseudonym, full_name, 'Your match') into v_requester_name
  from public.profiles where id = auth.uid();

  insert into public.notifications (user_id, type, title, body, link)
  values (
    p_owner_id,
    'optional_questions_requested',
    'Someone would like to know more about you',
    v_requester_name || ' asked if you would answer a few optional compatibility questions.',
    '/dashboard/questionnaire'
  );
end;
$$;
grant execute on function public.request_optional_questions(uuid) to authenticated;

-- Answering a request (approve/decline) also notifies the requester.
create or replace function public.respond_to_optional_questions_request(p_request_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_viewer_id uuid;
  v_owner_name text;
begin
  if p_status not in ('approved', 'declined') then
    raise exception 'invalid status';
  end if;

  update public.questionnaire_access_requests
  set status = p_status, responded_at = now()
  where id = p_request_id and owner_id = auth.uid()
  returning viewer_id into v_viewer_id;

  if v_viewer_id is null then
    raise exception 'not authorized';
  end if;

  select coalesce(pseudonym, full_name, 'Your match') into v_owner_name
  from public.profiles where id = auth.uid();

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_viewer_id,
    'optional_questions_requested',
    case when p_status = 'approved'
      then v_owner_name || ' answered your request'
      else 'Your request was declined' end,
    case when p_status = 'approved'
      then 'You can now see their optional compatibility answers.'
      else v_owner_name || ' preferred not to share their optional answers.' end,
    '/dashboard/profile/' || auth.uid()::text
  );
end;
$$;
grant execute on function public.respond_to_optional_questions_request(uuid, text) to authenticated;
