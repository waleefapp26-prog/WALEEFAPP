-- ---------------------------------------------------------------------------
-- Waleef schema phase 7 -- additive only. Safe to re-run.
--
-- Guardian (wali) permission tiers for chat oversight, replacing the single
-- on/off "can this guardian see the chat" flag with three ordered levels:
--   'none' (default) -> 'read' -> 'react' -> 'chat'
-- Each level includes everything below it. A member sets this per guardian
-- (a match can now have more than one wali invite -- see schema-phase{prior}
-- multi-guardian support) from the Family panel, not from inside the chat
-- screen.
--
-- 'react' and 'chat' both need the guardian to actually write something into
-- a conversation they have no Supabase session for -- there is no such thing
-- as an authenticated wali. Both go through security-definer RPCs keyed on
-- the invite's token, the same pattern schema-phase2's respond_to_wali_invite
-- already uses, rather than any RLS policy granting anon/authenticated write
-- access to messages or reactions directly.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- A. Permission column on wali_invites
-- ---------------------------------------------------------------------------

alter table public.wali_invites add column if not exists chat_permission text not null default 'none'
  check (chat_permission in ('none', 'read', 'react', 'chat'));

-- Backfill from the old boolean. Guarded so a re-run never clobbers a level
-- a member has already chosen -- chat_permission stays in sync with
-- chat_involved going forward (see set_wali_chat_permission below), so this
-- only ever affects rows that predate this migration.
update public.wali_invites
set chat_permission = case when chat_involved then 'read' else 'none' end
where chat_permission = 'none';

-- ---------------------------------------------------------------------------
-- B. Guardian-authored messages
--
-- A wali has no profiles row (no account at all), so sender_id can't hold
-- their identity. sender_id becomes nullable; a guardian-authored row points
-- at the invite instead, with the guardian's name denormalized onto the
-- message so Realtime payloads (which carry only the row itself, no joins)
-- have a display name to show immediately.
-- ---------------------------------------------------------------------------

alter table public.messages alter column sender_id drop not null;
alter table public.messages add column if not exists sender_wali_invite_id uuid
  references public.wali_invites(id) on delete set null;
alter table public.messages add column if not exists wali_sender_name text;

alter table public.messages drop constraint if exists messages_sender_check;
alter table public.messages add constraint messages_sender_check
  check (
    (sender_id is not null and sender_wali_invite_id is null)
    or (sender_id is null and sender_wali_invite_id is not null)
  );

-- ---------------------------------------------------------------------------
-- C. Guardian reactions
--
-- Deliberately small and wali-only for now (members don't have reactions
-- either) -- a fixed set of three, not a free-text emoji picker.
-- ---------------------------------------------------------------------------

create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  wali_invite_id uuid not null references public.wali_invites(id) on delete cascade,
  emoji text not null check (emoji in ('❤️', '👍', '🤲')),
  created_at timestamptz not null default now(),
  unique (message_id, wali_invite_id)
);
create index if not exists message_reactions_message_idx on public.message_reactions (message_id);

alter table public.message_reactions enable row level security;
drop policy if exists "message_reactions_select_participant" on public.message_reactions;
create policy "message_reactions_select_participant" on public.message_reactions for select to authenticated
  using (
    exists (
      select 1 from public.messages msg
      join public.conversations c on c.id = msg.conversation_id
      join public.matches m on m.id = c.match_id
      where msg.id = message_reactions.message_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );
-- No insert/update/delete policy for authenticated or anon: every write goes
-- through react_to_message_as_wali below.

do $$
begin
  alter publication supabase_realtime add table public.message_reactions;
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- D. RPCs
-- ---------------------------------------------------------------------------

-- Member-facing: set one guardian's permission level. Requester-owned, same
-- authorization shape as every other wali_invites mutation the member makes.
create or replace function public.set_wali_chat_permission(p_wali_invite_id uuid, p_permission text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_result text;
begin
  if p_permission not in ('none', 'read', 'react', 'chat') then
    raise exception 'invalid permission';
  end if;

  update public.wali_invites
  set chat_permission = p_permission, chat_involved = (p_permission <> 'none')
  where id = p_wali_invite_id and requester_id = auth.uid()
  returning chat_permission into v_result;

  if v_result is null then
    raise exception 'not authorized';
  end if;

  return v_result;
end;
$$;
grant execute on function public.set_wali_chat_permission(uuid, text) to authenticated;

-- Guardian-facing: how much can this token do. Used by the wali chat page to
-- decide whether to render a composer / reaction buttons at all.
create or replace function public.get_wali_chat_permission(p_token uuid)
returns text
language plpgsql stable security definer set search_path = public as $$
declare
  v_permission text;
  v_status text;
begin
  select chat_permission, status into v_permission, v_status
  from public.wali_invites where token = p_token;

  if v_status is null or v_status <> 'approved' then
    return 'none';
  end if;

  return coalesce(v_permission, 'none');
end;
$$;
grant execute on function public.get_wali_chat_permission(uuid) to anon, authenticated;

-- Replaces the phase4 version: gate on chat_permission instead of the old
-- boolean, left-join profiles (an inner join silently dropped every
-- guardian-authored row, since those have sender_id = null), and flag which
-- rows are the guardian's own so the UI can style them differently.
drop function if exists public.get_conversation_messages_for_wali(uuid);
create or replace function public.get_conversation_messages_for_wali(p_token uuid)
returns table (
  id uuid,
  sender_id uuid,
  sender_name text,
  is_wali boolean,
  body text,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_match_id uuid;
  v_permission text;
  v_status text;
begin
  select match_id, chat_permission, status into v_match_id, v_permission, v_status
  from public.wali_invites where token = p_token;

  if v_match_id is null or v_permission = 'none' or v_status <> 'approved' then
    raise exception 'not authorized';
  end if;

  return query
  select
    msg.id,
    msg.sender_id,
    coalesce(p.full_name, msg.wali_sender_name, 'Guardian'),
    (msg.sender_id is null),
    msg.body,
    msg.created_at
  from public.messages msg
  join public.conversations c on c.id = msg.conversation_id
  left join public.profiles p on p.id = msg.sender_id
  where c.match_id = v_match_id
  order by msg.created_at asc;
end;
$$;
grant execute on function public.get_conversation_messages_for_wali(uuid) to anon, authenticated;

-- Guardian-facing: the guardian's own reactions, so their chat view can show
-- which emoji they already left on which message (message_reactions has no
-- select policy for anon -- this is the only read path for a token holder).
create or replace function public.get_wali_reactions(p_token uuid)
returns table (message_id uuid, emoji text)
language plpgsql stable security definer set search_path = public as $$
declare
  v_invite_id uuid;
begin
  select id into v_invite_id from public.wali_invites where token = p_token and status = 'approved';
  if v_invite_id is null then
    return;
  end if;

  return query
  select r.message_id, r.emoji from public.message_reactions r where r.wali_invite_id = v_invite_id;
end;
$$;
grant execute on function public.get_wali_reactions(uuid) to anon, authenticated;

-- Guardian-facing: post into the couple's own conversation. Requires the
-- top tier ('chat'), not just 'react'.
create or replace function public.send_message_as_wali(p_token uuid, p_body text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.wali_invites%rowtype;
  v_conversation_id uuid;
  v_message_id uuid;
  v_body text := trim(p_body);
begin
  if v_body = '' then
    raise exception 'message is empty';
  end if;

  select * into v_invite from public.wali_invites where token = p_token;
  if v_invite.id is null or v_invite.status <> 'approved' or v_invite.chat_permission <> 'chat' then
    raise exception 'not authorized';
  end if;

  select id into v_conversation_id from public.conversations where match_id = v_invite.match_id;
  if v_conversation_id is null then
    raise exception 'conversation not found';
  end if;

  insert into public.messages (conversation_id, sender_id, sender_wali_invite_id, wali_sender_name, body)
  values (v_conversation_id, null, v_invite.id, v_invite.wali_name, v_body)
  returning id into v_message_id;

  return v_message_id;
end;
$$;
grant execute on function public.send_message_as_wali(uuid, text) to anon, authenticated;

-- Guardian-facing: react to a message, toggled -- clicking the same emoji
-- again removes it, a different emoji replaces it. Needs 'react' or 'chat'.
create or replace function public.react_to_message_as_wali(p_token uuid, p_message_id uuid, p_emoji text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.wali_invites%rowtype;
  v_message_match_id uuid;
  v_existing_id uuid;
begin
  if p_emoji not in ('❤️', '👍', '🤲') then
    raise exception 'invalid emoji';
  end if;

  select * into v_invite from public.wali_invites where token = p_token;
  if v_invite.id is null or v_invite.status <> 'approved' or v_invite.chat_permission not in ('react', 'chat') then
    raise exception 'not authorized';
  end if;

  select c.match_id into v_message_match_id
  from public.messages msg
  join public.conversations c on c.id = msg.conversation_id
  where msg.id = p_message_id;

  if v_message_match_id is null or v_message_match_id <> v_invite.match_id then
    raise exception 'message not found';
  end if;

  select id into v_existing_id from public.message_reactions
  where message_id = p_message_id and wali_invite_id = v_invite.id;

  if v_existing_id is not null then
    delete from public.message_reactions where id = v_existing_id and emoji = p_emoji;
    if found then
      return false;
    end if;
    update public.message_reactions set emoji = p_emoji, created_at = now() where id = v_existing_id;
    return true;
  end if;

  insert into public.message_reactions (message_id, wali_invite_id, emoji) values (p_message_id, v_invite.id, p_emoji);
  return true;
end;
$$;
grant execute on function public.react_to_message_as_wali(uuid, uuid, text) to anon, authenticated;
