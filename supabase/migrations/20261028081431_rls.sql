-- 0002_rls.sql  |  Row Level Security for FitnessApp
--
-- Only TWO policy patterns exist, applied by loops so they cannot drift apart:
--   PLAN tables : athlete reads own, assigned coach reads + writes.
--   LOG tables  : athlete full access to own rows, assigned coach read-only.
-- Everything is "to authenticated"; anon gets nothing (the app requires login).

-- ---------------------------------------------------------------- lock down anon

revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

-- ---------------------------------------------------------------- helper functions
-- SECURITY DEFINER lets them read the tables below without triggering RLS recursion.
-- search_path = '' forces fully qualified names (blocks search_path hijacking).
-- (select auth.uid()) is evaluated once per query instead of once per row.

create function public.is_coach_of(target_athlete uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.coach_athlete_assignments a
    where a.athlete_id = target_athlete
      and a.coach_id = (select auth.uid())
      and a.is_active
  );
$$;

create function public.is_coach() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('coach', 'admin')
  );
$$;

revoke execute on function public.is_coach_of(uuid) from public, anon;
revoke execute on function public.is_coach() from public, anon;
grant execute on function public.is_coach_of(uuid) to authenticated;
grant execute on function public.is_coach() to authenticated;

-- ---------------------------------------------------------------- profiles

alter table public.profiles enable row level security;

create policy "read own, assigned athletes, own coach"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or public.is_coach_of(id)
    or exists (
      select 1 from public.coach_athlete_assignments a
      where a.coach_id = profiles.id
        and a.athlete_id = (select auth.uid())
        and a.is_active
    )
  );

create policy "update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- RLS works per ROW, not per column. Without this, any athlete could run
--   update profiles set role = 'admin' where id = auth.uid()
-- from the browser console. Column-level grants close that hole.
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, avatar_url, locale) on public.profiles to authenticated;

-- ---------------------------------------------------------------- assignments
-- Read-only for users. Created by an Edge Function using the service_role key
-- (the invite flow), so a coach can never "claim" an arbitrary user.

alter table public.coach_athlete_assignments enable row level security;

create policy "see own assignments"
  on public.coach_athlete_assignments for select to authenticated
  using (coach_id = (select auth.uid()) or athlete_id = (select auth.uid()));

revoke insert, update, delete on public.coach_athlete_assignments from authenticated;

-- ---------------------------------------------------------------- invitations

alter table public.invitations enable row level security;

create policy "coach manages own invitations"
  on public.invitations for all to authenticated
  using (coach_id = (select auth.uid()) and (select public.is_coach()))
  with check (coach_id = (select auth.uid()) and (select public.is_coach()));

-- ---------------------------------------------------------------- exercise library

alter table public.exercise_library enable row level security;

create policy "coach manages own library"
  on public.exercise_library for all to authenticated
  using (coach_id = (select auth.uid()) and (select public.is_coach()))
  with check (coach_id = (select auth.uid()) and (select public.is_coach()));

create policy "athlete reads exercises used in own plan"
  on public.exercise_library for select to authenticated
  using (exists (
    select 1 from public.workout_exercises we
    where we.exercise_id = exercise_library.id
      and we.athlete_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------- PLAN tables + LOG tables

do $$
declare t text;
begin
  foreach t in array array[
    'athlete_profiles', 'mesocycles', 'workouts', 'workout_exercises', 'planned_sets',
    'diets', 'meals', 'meal_options', 'meal_option_items'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format($p$
      create policy "athlete reads own, coach reads assigned" on public.%I
      for select to authenticated
      using (athlete_id = (select auth.uid()) or public.is_coach_of(athlete_id))
    $p$, t);

    execute format($p$
      create policy "coach writes assigned athletes" on public.%I
      for all to authenticated
      using (public.is_coach_of(athlete_id))
      with check (public.is_coach_of(athlete_id))
    $p$, t);
  end loop;

  foreach t in array array[
    'workout_sessions', 'set_logs', 'meal_logs', 'daily_checkins',
    'body_measurements', 'weekly_forms'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format($p$
      create policy "athlete manages own rows" on public.%I
      for all to authenticated
      using (athlete_id = (select auth.uid()))
      with check (athlete_id = (select auth.uid()))
    $p$, t);

    execute format($p$
      create policy "coach reads assigned athletes" on public.%I
      for select to authenticated
      using (public.is_coach_of(athlete_id))
    $p$, t);
  end loop;
end $$;

-- A coach may only create plans in their own name.
create policy "plan author must be the caller"
  on public.mesocycles as restrictive for insert to authenticated
  with check (coach_id = (select auth.uid()));

create policy "plan author must be the caller"
  on public.diets as restrictive for insert to authenticated
  with check (coach_id = (select auth.uid()));
