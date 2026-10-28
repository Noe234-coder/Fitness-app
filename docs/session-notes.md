# Session notes (handoff for Claude Code)

Read after `PLAN.md`. PLAN.md says *what* is done and next; this file holds the *how* and the gotchas that are
not obvious from the code. Update it at the end of each session (newest session on top).

## Last session: 2026-10-28 — step 1 (Foundation) finished

### Where things stand
- Branch `rebuild` (PRs go to `master`). Step 1 done and tested on a phone. **Next: step 1b, invite flow.**
- Commits are small and explain the "why"; read `git log --oneline` for the story of step 1.

### Environment and how to run things
- Supabase CLI is pinned in `mise.toml` (2.122.0); run it as `supabase …` (or `mise exec -- supabase …`).
- The repo is linked to `kgsteocdauztgpnasdki`. Linking used the author's `supabase login` (no DB password).
  `supabase migration list` will need `--linked` in the next CLI major (it warns already).
- Local stack: `supabase start` / `supabase stop`. The first start pulls images; Docker "toomanyrequests" errors
  retry by themselves. Local URL and keys: `supabase status -o env` (demo keys, not secret).
- Tests: `supabase test db` (pgTAP, `supabase/tests/database/rls.test.sql`, 57 tests).
  `cd web && npm test` (Vitest), `npm run lint` (oxlint), `npm run build`, Node 22 check:
  `mise exec node@22 -- npm run build`.
- Types: `cd web && npm run types:db` (generated from the LOCAL stack, formatted with oxfmt). Remote-generated
  types differ only cosmetically (older generator: no `ComputedFields`, nullable view columns).
- `web/.env.local` points at the REMOTE project. To run the app against the local stack without touching it:
  `env VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=<local PUBLISHABLE_KEY> npx vite`
  (process env beats `.env` files in Vite).
- Local test users must be recreated after `supabase stop`/`start` if the volume is reset: create them with the
  admin API (`POST /auth/v1/admin/users` with the local secret key, `email_confirm: true`), then
  `update public.profiles set role='coach' …` via `docker exec supabase_db_fitness-app psql -U postgres`.

### What Claude can and cannot do here
- **Cannot `git push`**: no GitHub credentials in the shell. The author pushes. Don't ask for a token.
- **Cannot turn off Vercel Deployment Protection** (the auto-mode classifier blocks it as weakening security).
  Previews need a Vercel login until the author turns it off in the dashboard.
- Vercel MCP read access works: team `team_KLuBSWr18iTGPWV5SVsa8h6g`, project `prj_WjCIKHAq5clhGbwFLJB6OSAE8JKK`.
  Branch preview URL: https://fitness-app-git-rebuild-man-d650.vercel.app
- Supabase MCP works (`get_advisors`, `execute_sql`, …). Supabase dashboard settings were changed through
  Claude in Chrome when the author asked. Never `supabase config push`.
- Don't use `pkill -f <pattern>` in a compound command: it can kill its own shell.

### Remote state
- Accounts: `coach@test.com` (role coach, the author) and `athlete@test.com` (role athlete). No `full_name` set.
- Auth: sign-ups off; Site URL / redirect URLs in PLAN.md. Email confirmation is on.
- Security advisors: no findings (last checked 2026-10-28).

### Decisions taken in step 1 (beyond PLAN.md) and why
- Template defaults kept: Vite 8, React 19, TypeScript 7, **oxlint** (not ESLint). **oxfmt** only formats `db.ts`.
- **react-router v8** in declarative mode (`BrowserRouter`/`Routes`); it needs Node ≥ 22.22, hence
  `engines: ">=22.22"`. Vercel warns that this open range auto-upgrades Node majors (accepted).
- Tailwind v4 `@theme` in `web/src/index.css`; dark mode is class-based and on by default (`<html class="dark">`).
  Inter is self-hosted (`@fontsource-variable/inter`), not Google Fonts (offline + GDPR).
- i18n keys are typed (`TranslationKey`, `i18next.d.ts`); a Vitest test checks es/en have the same keys.
  Language order: localStorage → browser → es; after login `profiles.locale` wins; the switch writes it back.
- Role comes from `profiles` via TanStack Query (`useProfile` in `web/src/auth/useAuth.ts`); `admin` uses `/coach`.
  Route guards are UX only; RLS is the security.
- Supabase auth errors are mapped by `error.code` to i18n keys (`web/src/auth/authErrors.ts`).
- pgTAP: one transaction, **no savepoints** (rolling back a savepoint erases pgTAP's results). Blocks run in
  sequence, so later expected counts include earlier writes. Expected errors name the SQLSTATE.
- The JS bundle is ~563 kB (mostly supabase-js), so Vite warns. Accepted until the coach panel can be code-split.
- `npm audit`: 4 low findings in `deepmerge` via `vite-plugin-pwa` → `workbox-build` (build-time only). Accepted.

### Open items / ideas for later
- Turn off Vercel preview protection before friends test (author, in the dashboard).
- Coach deletion is blocked by NO ACTION FKs: needs a design before delete-account (PLAN.md open questions).
- No "forgot password" flow yet (needs a reset page + the redirect URLs already set).
- Material Symbols (Stitch icons) not added yet: decide font vs inline SVGs in step 2.
- Set `full_name` for the two remote accounts (or let the invite flow ask for it).

### Step 1b sketch (not agreed yet: plan it with the author first)
- Edge Function `invite-athlete`: checks the caller is a coach (`private.is_coach()` logic, server-side), calls
  `auth.admin.inviteUserByEmail` with the service-role key (Edge Function secrets only), and records the
  `invitations` row and the `coach_athlete_assignments` row (as PLAN.md says; `inviteUserByEmail` creates the
  auth user immediately, so the assignment can be created at the same time). Open question for the author:
  what happens if the email already has an account or an active coach.
- Screens: coach "invite athlete" form; "set your password" page for the invite link (needs the redirect URLs).
- pgTAP tests for anything new in the schema; the security advisors after any migration.
