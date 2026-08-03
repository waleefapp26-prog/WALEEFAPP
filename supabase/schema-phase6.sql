-- ---------------------------------------------------------------------------
-- Waleef schema phase 6 -- additive only.
--
-- Real success stories.
--
-- The landing page shipped three hardcoded "success stories" -- Ahmed &
-- Fatima in London, Yusuf & Aisha in New York, Omar & Maryam in Dubai -- with
-- invented quotes and invented match percentages, presented to visitors as
-- real members. Nobody on the platform said any of it. This table is where
-- real, consented, admin-approved stories live; the landing section now reads
-- from it and renders nothing at all when it is empty.
-- ---------------------------------------------------------------------------

create table if not exists public.success_stories (
  id uuid primary key default gen_random_uuid(),
  -- Nullable so a story can be recorded for a couple who have since deleted
  -- their match, and so admins can enter one gathered offline.
  match_id uuid references public.matches(id) on delete set null,
  -- Display name for the couple, e.g. "A & F" -- deliberately not derived from
  -- profiles, so publishing never leaks a real name the couple didn't agree to.
  couple_name text not null,
  couple_name_ar text,
  location text,
  location_ar text,
  story_en text not null,
  story_ar text,
  -- Explicit record that the couple agreed to publication.
  consented boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.success_stories enable row level security;

-- Public read, but only stories that are both consented and approved. This is
-- the one table anonymous visitors can select from, because the landing page
-- and /success-stories are public.
drop policy if exists "success_stories_select_public" on public.success_stories;
create policy "success_stories_select_public" on public.success_stories for select
to anon, authenticated
using (approved and consented);

drop policy if exists "success_stories_select_admin" on public.success_stories;
create policy "success_stories_select_admin" on public.success_stories for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "success_stories_insert_admin" on public.success_stories;
create policy "success_stories_insert_admin" on public.success_stories for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "success_stories_update_admin" on public.success_stories;
create policy "success_stories_update_admin" on public.success_stories for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "success_stories_delete_admin" on public.success_stories;
create policy "success_stories_delete_admin" on public.success_stories for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create index if not exists success_stories_published_idx
  on public.success_stories (created_at desc) where approved and consented;
