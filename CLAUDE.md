# FitnessApp — rules for Claude Code

Read `PLAN.md` first, then `docs/session-notes.md` (how to run things, gotchas, last session's handoff).
Work on the step PLAN.md marks as next; don't jump ahead. At the end of a session, update `docs/session-notes.md`.

## The author
- A student who knows SQL/Postgres well and is learning the rest. Explain the *why* behind design choices
  briefly (in the chat and in commit messages), not just the what.
- Time is ~2 hours per week: prefer small, finished, testable slices over large half-done ones.

## Repo
- `legacy-expo/` is the old React Native app: read it for ideas, never edit it, never import from it.
- `stitch/<screen>/code.html` + `screen.png` are the UI designs. Reuse their Tailwind classes, colours and layout.
- The new app lives in `web/`.
- Node: the author runs Node 26 locally. Keep `web/` compatible with Node 22+
  (`"engines": {"node": ">=22"}` in `web/package.json`) and check with `mise exec node@22 -- npm run build`.
  Vercel follows `engines` over its dashboard setting, so it builds with the newest Node it supports that matches `>=22`.
- Hosting: Vercel project `fitness-app` (root directory `web/`). Build env vars are set in Vercel, never committed.

## Database
- Supabase project ref: `kgsteocdauztgpnasdki` (eu-west-3). Never use the old project `tqdzqynijzhcurzihhsl`.
- ALL schema changes go through new files in `supabase/migrations/`. Never edit via the dashboard, never edit an applied migration.
- Every athlete-owned table has `athlete_id`, RLS enabled, composite FKs `(parent_id, athlete_id)`, and an index
  whose leading columns match each FK.
- Athlete-owned tables use only the two existing policy patterns (plan tables / log tables). Ask before inventing a
  third, or before adding a policy to any other table.
- RLS helper functions live in schema `private`, not `public`.
- Numbers are `numeric`/`int`, never `text`. Computed values are views with `security_invoker = true`.
- After every migration: run `supabase gen types typescript` and commit the result; check the security advisors.
- Auth settings (sign-ups, Site URL, redirect URLs) are changed in the Supabase dashboard and recorded in PLAN.md.
  Never run `supabase config push`: it overwrites the remote auth settings with the local `config.toml`.
- RLS tests must pass before any task is called done. A new table without a test is not done.

## Security
- The `service_role` key lives only in Edge Functions / server env. Never in browser code, never committed.
- Only the URL and the publishable/anon key go in the frontend, via `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Roles are never taken from client-supplied data or signup metadata.
- Do not delete data or run destructive commands without asking first.

## Frontend
- Mobile first (design for ~390 px wide), large touch targets, usable one-handed in a gym.
- No hard-coded user-facing strings: everything through i18n (es default, en).
- Decimal inputs accept comma and dot; store dot.
- Logging must work offline: client-generated UUIDs, upsert, queue and replay.

## Working style
- Small commits, one concern each. Explain the reasoning for design choices briefly in the commit or PR.
