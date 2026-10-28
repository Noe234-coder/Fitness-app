# FitnessApp — rebuild plan

## Goal
A mobile-first web app (PWA) that replaces one personal trainer's Google Sheets (workouts, meal plans,
daily tracking) and WhatsApp follow-up. ~30-40 athletes, one coach now, multi-coach possible later.
Test group: the trainer, the author, and some friends.

## Current state (2026-10-28)
- **Supabase project `FitnessApp`** (ref `kgsteocdauztgpnasdki`, region eu-west-3 Paris) is live and empty.
  The 3 migrations in `supabase/migrations/` are applied. Security advisors: no findings.
  The repo is linked (`supabase link`); `supabase migration list --linked` shows local = remote.
- **`web/`** (step 1, slices 1-4 done): Vite + React + TS + Tailwind theme from Stitch, es/en i18n, PWA shell,
  email/password login with routing by role (`/athlete`, `/coach`). Types in `web/src/types/db.ts`
  (`npm run types:db`, generated from the local stack). Next: first Vercel preview deploy.
- **Auth settings (dashboard, 2026-10-28):** public sign-ups OFF (accounts come from the dashboard now, from
  invites in step 1b). Site URL `https://fitness-app-git-rebuild-man-d650.vercel.app`; redirect URLs
  `https://fitness-app-git-rebuild-man-d650.vercel.app/**` and `http://localhost:5173/**`. Switch the Site URL
  to the production URL when `rebuild` is merged. Accounts: one coach (the author), one test athlete.
- **Vercel:** previews deploy from `rebuild` and are behind Vercel Authentication (Deployment Protection),
  so only people logged into the Vercel team can open them.
- **Local development:** Supabase CLI pinned in `mise.toml`. `supabase start` runs the local stack;
  `supabase test db` runs the pgTAP tests (57 passing).
- **Old Supabase project** (ref `tqdzqynijzhcurzihhsl`) is **paused**. Its RLS let any user make themselves
  admin. It is reference only; never point new code at it.
- **Old Expo / React Native app** moved to `legacy-expo/` as reference. It is not built or maintained.
- **Stitch designs** in `stitch/<screen>/code.html` + `screen.png`: the visual source for the new UI.
- No data is imported from the Google Sheets. Everything starts empty.

## Repo layout
```
PLAN.md, CLAUDE.md      this plan and the rules for Claude Code
supabase/migrations/    the ONLY source of truth for the database
supabase/tests/         pgTAP tests (RLS, grants, integrity); run with `supabase test db`
stitch/                 UI designs (Tailwind HTML + screenshots)
web/                    the new PWA (created in step 1)
legacy-expo/            old app, old docs, old migrations — read only
```

## Decisions (and why)
| Decision | Reason |
|---|---|
| New Supabase project (EU region), old one paused | Old policies/data carried baggage; rebuild is cheap |
| All schema changes as files in `supabase/migrations/` | The old DB was built by clicking; nobody could see how it got messy |
| `athlete_id` on every athlete-owned table + composite FKs | One-line, fast RLS; DB guarantees children cannot cross athletes |
| Roles never come from the client; column-level grants on `profiles` | RLS is per row, so `update profiles set role='admin'` must be blocked by grants |
| RLS helpers live in schema `private` | Callable inside policies but not exposed as API endpoints |
| **Web PWA instead of Expo** | Athletes open a link and add it to the home screen: no app stores, no Apple fee, instant updates |
| Vite + React + TypeScript + Tailwind + TanStack Query + `vite-plugin-pwa` | Offline set logging (bad gym signal), generated DB types, Stitch Tailwind HTML converts to components |
| Client-generated UUIDs + upsert on `(session_id, workout_exercise_id, set_number)` | Replaying queued offline writes is idempotent |
| i18n from day one: Spanish default, English second (`react-i18next`) | Most users are Spanish; retrofitting strings is expensive |
| Decimal input `inputmode="decimal"`, accepts "86,5" and stores 86.5 | Spanish keyboards type decimal commas |
| Computed values (tonnage, weekly averages, diet totals) are views | No stale duplicated numbers |
| `subscriptions` table parked | Billing is a later problem |
| "Multiple permissive policies" advisor WARN accepted | Price of keeping only two policy patterns; negligible at ~40 athletes |

## Data model
See `supabase/migrations/`.
Sheet-to-table mapping:
- Workout sheet row -> `workout_exercises` + `planned_sets` (reps range, RIR range, technique "F+P")
- Workout diary columns -> `workout_sessions` + `set_logs` (extra sets beyond the plan are allowed)
- TONELAJE -> view `exercise_session_volume`
- Daily weight/steps/sleep/stress -> `daily_checkins` (sleep stored in minutes, shown as h:mm)
- MEDIA / VARIACION rows -> view `weekly_checkin_stats` (variation = compare with previous week in the UI)

## Build order (~2 h/week)
1. **Foundation (2-3 sessions)**
   - Scaffold `web/` (Vite + React + TS + Tailwind + TanStack Query + react-i18next + vite-plugin-pwa).
     Tailwind theme (colours, fonts) taken from the Stitch HTML.
   - `supabase init` (keep existing `migrations/`), `supabase link --project-ref kgsteocdauztgpnasdki`,
     `supabase migration list` must show local = remote. `supabase gen types typescript` -> `web/src/types/db.ts`.
   - Port the RLS scenarios to pgTAP (`supabase/tests/database/rls.test.sql`); run with `supabase test db`
     against the local stack.
   - Login screen only (email + password, Spanish/English), route guard by role. No sign-up screen: accounts
     come from invites. First coach: Dashboard -> Auth -> Add user, then in the SQL editor
     `update public.profiles set role = 'coach' where id = '<user id>';`
   - Deploy preview on Vercel so phones can test it. Needs an SPA rewrite in `web/vercel.json` (reloading
     `/coach` must not 404) and the Vercel URL as Auth Site URL / redirect URL in the Supabase dashboard.
1b. **Invite flow:** Edge Function (service_role key server-side only) that invites an email and creates the
   coach assignment. Then turn off public sign-ups in the dashboard.
2. **Athlete workout logging (3-4 sessions):** view plan, log sets offline, show previous session's numbers
   next to each set. `supabase/seed.sql` with one sample plan typed in from the trainer's "Torso" day.
   -> first test with friends.
3. **Daily check-in + weekly stats + charts** (athlete sees own weight/lift progress).
4. **Meals:** view plan, choose option, tick off.
5. **Coach panel:** plan editor, "clone plan to another athlete", "who has not logged this week".
   This is how the trainer enters real plans, replacing the sheets.

## Confirmed (2026-10-28)
- Stress scale is 1-10 (matches the check constraint).
- The first coach account is the author's own; the trainer is invited later.
- Hosting: Vercel (account to be created; project root directory `web/`, env vars set in Vercel, auto-deploy on push).
- The repo stays public (no secret keys in it).

## Open questions
- Weekly form scores (compliance, hunger, energy, digestion) assumed 1-10; confirm with the trainer.
- GDPR: health-related data of other people. Needs consent text, export and delete-account, privacy page
  before real athletes use it.
- Deleting a coach account: today it is blocked once the coach has written plans (`mesocycles.coach_id`,
  `diets.coach_id` and `exercise_library` references use NO ACTION). Needs its own design (e.g. hand plans and
  library over to another coach, or anonymise the coach) before delete-account ships.

## Definition of done for each step
Migrations applied cleanly, RLS tests green, `supabase gen types` committed, works on a phone-sized screen,
Spanish and English strings present, Supabase security advisors show no new findings.
