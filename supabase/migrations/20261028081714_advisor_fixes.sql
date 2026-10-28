-- 0003_advisor_fixes.sql  |  Fixes from Supabase's security + performance advisors

-- 1. handle_new_user() is a trigger function. Nobody should call it over the API
--    (/rest/v1/rpc/handle_new_user). Triggers still fire without EXECUTE grants.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. The RLS helpers must stay callable by signed-in users (policies run as the caller),
--    but they don't need to be part of the public API. Functions in a schema that the
--    API does not expose cannot be called via /rest/v1/rpc. Policies store the function's
--    internal id, so moving the schema keeps every policy working unchanged.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter function public.is_coach_of(uuid) set schema private;
alter function public.is_coach() set schema private;

-- 3. Composite foreign keys need an index whose leading columns match the FK,
--    otherwise deleting a parent scans the whole child table. These replace the
--    single-column parent indexes created in 0001.
drop index public.workouts_mesocycle_id_idx;
drop index public.workout_exercises_workout_id_idx;
drop index public.workout_sessions_workout_id_idx;
drop index public.meals_diet_id_idx;
drop index public.meal_options_meal_id_idx;
drop index public.meal_option_items_meal_option_id_idx;

create index on public.workouts (mesocycle_id, athlete_id);
create index on public.workout_exercises (workout_id, athlete_id);
create index on public.planned_sets (workout_exercise_id, athlete_id);
create index on public.workout_sessions (workout_id, athlete_id);
create index on public.set_logs (session_id, athlete_id);
create index on public.set_logs (workout_exercise_id, athlete_id);
create index on public.meals (diet_id, athlete_id);
create index on public.meal_options (meal_id, athlete_id);
create index on public.meal_option_items (meal_option_id, athlete_id);
create index on public.meal_logs (meal_id, athlete_id);
create index on public.meal_logs (chosen_option_id, athlete_id);
create index on public.weekly_forms (diet_id, athlete_id);
create index on public.mesocycles (coach_id);
create index on public.diets (coach_id);

-- Not changed on purpose: "multiple permissive policies" (performance WARN).
-- It comes from keeping exactly two policy patterns. At ~40 athletes the cost is
-- negligible; revisit if the app grows to thousands of users.
