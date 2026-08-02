# Waleef

A halal matrimonial platform for the Qatar market — serious, family-involved
matchmaking with real compatibility scoring, privacy controls, identity
verification, and full English/Arabic bilingual support.

## Tech stack

- **Next.js 15** (App Router), React 19, TypeScript
- **Supabase**: Postgres, Auth (email OTP + Google OAuth), Realtime, Storage
- **Resend** for transactional email
- **Stripe** for payments (Checkout + signed webhooks)
- **Vitest** for unit tests
- CSS Modules (no Tailwind) with shared tokens in `styles/tokens.css`
- Hand-rolled i18n (`lib/i18n/`) — cookie-backed locale, RTL via `dir` on
  `<html>`, no routing changes needed for the language switch

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

### Environment variables

| Variable | Where it's used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/server clients (RLS-bound) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations (webhooks, admin routes) — never expose to the browser |
| `NEXT_PUBLIC_SITE_URL` | Building absolute links in emails/callbacks |
| `RESEND_API_KEY` | Wali invite emails, guardian login codes, notification emails. **Not set today** — without it the app still saves the invite but tells the member it could not email their guardian and shows a link to share instead. |
| `STRIPE_SECRET_KEY` | Stripe Checkout session creation |
| `STRIPE_WEBHOOK_SECRET` | Verifies the Stripe webhook signature on `/api/payments/webhook` |
| `NOTIFICATIONS_WEBHOOK_SECRET` | Verifies the Supabase Database Webhook that triggers `/api/notifications/dispatch` |

### Database setup

Run these in the Supabase SQL Editor, **in this exact order**, only once per project:

1. `supabase/schema.sql` — **destructive**, drops and recreates core tables. Only ever run this on a brand-new project. Never re-run it once real users exist.
2. `supabase/schema-phase2.sql` — additive (filters, blocks/reports, wali invites, payments).
3. `supabase/schema-phase3.sql` — additive (compatibility questionnaire wiring, photos, verification, privacy, notifications, admin). Safe to re-run.
4. `supabase/schema-phase4.sql` — additive (guardian-by-email dashboard + OTP, wali chat oversight, two-tier verification, match freeze/rate, new notification types, premium ranking). Safe to re-run.
5. `supabase/schema-phase5.sql` — additive (photo visibility policy so members can actually see each other's photos, post-moderation default, and the optional-questions request flow). Safe to re-run.

`schema-phase3.sql`, `schema-phase4.sql` and `schema-phase5.sql` each have a header comment with the manual steps required around them (enabling `pg_cron`, creating Storage buckets, configuring the notifications webhook) — read them before running.

The authoritative bilingual question bank (103 questions: 22 registration + 44
detailed-compatibility + 37 optional, sourced from the client's revised
question-bank document) was seeded directly against the `questions` table via
the Supabase REST API — there's no SQL file for it since no schema change was
needed, only data. If you ever reset the database from `schema.sql`, that
content needs reseeding (see the git history for the seeding script).

### Storage buckets

Create two **private** buckets via Dashboard → Storage → New bucket (uncheck "Public"):
- `profile-photos`
- `verification-documents`

Cross-user photo/document access always goes through a signed-URL Route Handler that checks visibility rules server-side — the buckets themselves are never public.

### Notifications webhook

Dashboard → Database → Webhooks → New webhook:
- Table: `notifications`, Event: `INSERT`
- URL: `{NEXT_PUBLIC_SITE_URL}/api/notifications/dispatch`
- Header: `X-Webhook-Secret: <your NOTIFICATIONS_WEBHOOK_SECRET value>`

### Chat retention (pg_cron)

Enable the `pg_cron` extension (Dashboard → Database → Extensions), then run once in the SQL Editor:

```sql
select cron.schedule('purge-expired-messages', '0 3 * * *', 'select public.purge_expired_messages();');
```

### Admin bootstrap

There's no self-serve admin signup. Flag the first admin manually after they've signed up normally:

```sql
update public.profiles set is_admin = true where id =
  (select id from auth.users where email = 'you@example.com');
```

Admin dashboard lives at `/admin` (users, verification queue, abuse reports, analytics).

## Testing

```bash
npm run test
```

Covers the pure-logic pieces that are worth locking down: the compatibility
scoring engine, the notification channel fan-out logic, and the AI coach
provider abstraction. No e2e suite — the app is verified manually against a
real Supabase project for now.

## Architecture / phase summary

- **Phase 1**: real auth (email OTP + Google), profile creation, candidate
  matching deck, mutual-match detection, real persisted 1:1 chat with
  Realtime.
- **Phase 2**: search/filters, block/report, wali email-invite flow
  (token-based, no wali account needed), Stripe payments, a rule-based
  "AI coach" (deliberately not a real LLM — no API key/billing needed).
- **Phase 3**: real compatibility scoring (a pre-existing, more complete
  bilingual questionnaire system was discovered and adopted rather than
  duplicated — see `supabase/schema-phase3.sql`'s reconciliation note),
  photo upload with per-photo privacy tiers (public/matched/approved/hidden,
  enforced via signed URLs, not public buckets), identity verification with
  an admin review queue, incognito mode + "who viewed my profile", configurable
  chat retention, a notifications system (in-app + email real, push stubbed),
  and a basic admin dashboard.
- **Phase 4**: full English/Arabic bilingual support with a navbar language
  toggle (`lib/i18n/`, RTL via `dir` on `<html>`); a full landing-page redesign
  using the real logo image, new Trust/FAQ sections, and a recolored footer;
  the authoritative 103-question bilingual question bank with real
  reveal-gating (registration always visible, detailed-compatibility unlocks
  after a mutual match, optional questions self-serve + nudgeable by a match);
  a dynamic onboarding wizard driven by the question bank (replacing the old
  hardcoded 4-step form) with conditional (`show_if`) question logic; a
  guardian-by-email dashboard with a one-time email code (see every wali
  invite tied to one email in one place); read-only wali oversight of a
  match's chat; proposal "approach" now actually changes behavior (self skips
  the wali email); two independent verification tiers (ID document + photo);
  match freeze/reopen and 1-5 star match ratings; two new notification types
  (`high_compatibility_match`, `optional_questions_requested`) plus a
  `profile_completion_reminder` function (cron scheduling is a manual step,
  same pattern as `purge_expired_messages`); premium/gold ranking boost in
  candidate discovery; an optional display pseudonym; delete-conversation; and
  a message-count-aware nudge in the (still rule-based) AI coach.

### Deferred (not built yet)

- Favorites / saved profiles
- Saved searches (a `preferences` table already exists with basic
  age-range/location-range columns from earlier work, not yet wired to any UI)
- Content library (articles, courses) and a dedicated success-stories table/UI
  — the landing page's testimonials section still uses static example content
- Real-LLM AI coach (the current one is intentionally rule-based; swapping in
  a real LLM is a one-file change via `lib/ai-coach/index.ts`'s
  `activeCoachProvider`)
- Real Web Push notifications (needs a service worker + VAPID keys; the
  `NotificationChannel` interface already has a stub ready for this)
- Full-app UI string translation: the i18n infrastructure is complete and the
  landing page, nav/footer chrome, and the entire question bank are bilingual,
  but most of the ~30 dashboard screens' UI strings (buttons, labels, empty
  states) are still English-only and would need dictionary entries added
  incrementally
- Employment-status candidate filter (employment now lives in the generic
  `answers` table rather than a dedicated `profiles` column, so filtering by
  it needs a small RPC change, not just a UI change)
