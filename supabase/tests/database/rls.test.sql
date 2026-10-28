-- RLS, grants and integrity tests. Run with: supabase test db (local stack only).
-- IDs: C,D coaches; A (coach C), B (coach D), F athletes. A never sees B and vice versa.
--
-- The whole file is ONE transaction that ends in rollback, so it never leaves data behind.
-- The actor blocks are NOT isolated from each other (pgTAP records results inside the
-- transaction, so rolling back a savepoint would also erase those results). Writes made
-- in one block are therefore visible to later blocks; the expected numbers account for it.
-- Expected error codes: 42501 = no privilege / RLS violation, 23503 = foreign key,
-- 23505 = unique, 23514 = check constraint.

begin;
create extension if not exists pgtap with schema extensions;
select plan(57);

-- ------------------------------------------------------------------ helpers
create schema t;
grant usage on schema t to anon, authenticated;

-- Act as a signed-in user: the same JWT claims and role PostgREST sets for an API request.
create function t.as_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  execute 'set local role authenticated';
end $$;

create function t.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'set local role anon';
end $$;

-- Back to the superuser that runs the tests (used for seeding and integrity checks).
create function t.as_postgres() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'reset role';
end $$;

-- Number of rows a statement touched. RLS hides rows instead of raising, so
-- "0 rows updated" is how a blocked UPDATE/DELETE shows up.
create function t.affected(q text) returns bigint language plpgsql as $$
declare n bigint;
begin execute q; get diagnostics n = row_count; return n; end $$;

-- ------------------------------------------------------------------ seed (as postgres)
insert into auth.users (id, email, raw_user_meta_data) values
  ('c0000000-0000-0000-0000-00000000000c', 'c@x.test', '{"full_name":"Coach C"}'),
  ('d0000000-0000-0000-0000-00000000000d', 'd@x.test', '{"full_name":"Coach D"}'),
  ('a0000000-0000-0000-0000-00000000000a', 'a@x.test', '{"full_name":"Athlete A"}'),
  ('b0000000-0000-0000-0000-00000000000b', 'b@x.test', '{"full_name":"Athlete B"}'),
  ('f0000000-0000-0000-0000-00000000000f', 'f@x.test', '{"full_name":"Sneaky","role":"admin"}');

select is(
  (select role::text from public.profiles where id = 'f0000000-0000-0000-0000-00000000000f'), 'athlete',
  'signup metadata role=admin is ignored (profile role is athlete)');

update public.profiles set role = 'coach'
 where id in ('c0000000-0000-0000-0000-00000000000c', 'd0000000-0000-0000-0000-00000000000d');

insert into public.coach_athlete_assignments (coach_id, athlete_id) values
  ('c0000000-0000-0000-0000-00000000000c', 'a0000000-0000-0000-0000-00000000000a'),
  ('d0000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-00000000000b');

insert into public.exercise_library (id, coach_id, name) values
  ('e1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000c', 'Press inclinado'),
  ('e1000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-00000000000d', 'Remo');

insert into public.mesocycles (id, athlete_id, coach_id, name, status) values
  ('10000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-00000000000c', 'Meso A', 'active'),
  ('10000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'd0000000-0000-0000-0000-00000000000d', 'Meso B', 'active');

insert into public.workouts (id, mesocycle_id, athlete_id, name, position) values
  ('20000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 'Torso', 1),
  ('20000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'Pierna', 1);

insert into public.workout_exercises (id, workout_id, athlete_id, exercise_id, position) values
  ('30000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 'e1000000-0000-0000-0000-000000000001', 1),
  ('30000000-0000-0000-0000-00000000000b', '20000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'e1000000-0000-0000-0000-000000000002', 1);

insert into public.planned_sets (workout_exercise_id, athlete_id, set_number, reps_min, reps_max, rir_min, rir_max) values
  ('30000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 1, 5, 9, 0, 1),
  ('30000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 2, 5, 9, 0, 1),
  ('30000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 1, 8, 10, 0, 0);

insert into public.workout_sessions (id, athlete_id, workout_id) values
  ('40000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-00000000000a'),
  ('40000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', '20000000-0000-0000-0000-00000000000b');

insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values
  ('a0000000-0000-0000-0000-00000000000a', '40000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-00000000000a', 1, 10, 40),
  ('a0000000-0000-0000-0000-00000000000a', '40000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-00000000000a', 2, 9, 40),
  ('b0000000-0000-0000-0000-00000000000b', '40000000-0000-0000-0000-00000000000b', '30000000-0000-0000-0000-00000000000b', 1, 8, 100);

insert into public.daily_checkins (athlete_id, checkin_date, weight_fasted_kg, steps, sleep_minutes, stress_score) values
  ('a0000000-0000-0000-0000-00000000000a', '2026-10-26', 85.50, 12261, 522, 4),
  ('a0000000-0000-0000-0000-00000000000a', '2026-10-27', 87.25, 11000, 400, 6),
  ('b0000000-0000-0000-0000-00000000000b', '2026-10-26', 70.00, 8000, 450, 3);

insert into public.diets (id, athlete_id, coach_id, name, is_active) values
  ('50000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-00000000000c', 'Dieta A', true),
  ('50000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'd0000000-0000-0000-0000-00000000000d', 'Dieta B', true);
insert into public.meals (id, diet_id, athlete_id, position, name, target_kcal) values
  ('60000000-0000-0000-0000-00000000000a', '50000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 1, 'Desayuno', 600),
  ('60000000-0000-0000-0000-00000000000b', '50000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 1, 'Desayuno', 500);
insert into public.meal_options (id, meal_id, athlete_id, position, label) values
  ('70000000-0000-0000-0000-00000000000a', '60000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 1, 'Opcion A');
insert into public.meal_option_items (meal_option_id, athlete_id, position, food_name, quantity) values
  ('70000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 1, 'Avena', 80),
  ('70000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-00000000000a', 2, 'Leche', 250);

-- ------------------------------------------------------------------ athlete A
select t.as_user('a0000000-0000-0000-0000-00000000000a');

select is((select count(*) from public.profiles), 2::bigint, 'A sees own profile + own coach only');
select throws_ok($q$update public.profiles set role = 'admin' where id = 'a0000000-0000-0000-0000-00000000000a'$q$,
  '42501', null, 'A cannot promote self to admin (column grant)');
select is(t.affected($q$update public.profiles set full_name = 'Ana' where id = 'a0000000-0000-0000-0000-00000000000a'$q$),
  1::bigint, 'A can rename self');
select ok((select count(*) from public.workouts) = 1
      and (select count(*) from public.workouts where athlete_id = 'b0000000-0000-0000-0000-00000000000b') = 0,
  'A sees only own workout');
select is(t.affected($q$update public.workouts set name = 'hack'$q$), 0::bigint, 'A cannot edit plan (0 rows updated)');
select throws_ok($q$insert into public.workouts (mesocycle_id, athlete_id, name, position) values ('10000000-0000-0000-0000-00000000000a','a0000000-0000-0000-0000-00000000000a','x',9)$q$,
  '42501', null, 'A cannot insert a workout');
select lives_ok($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',3,8,42.5)$q$,
  'A can log a set on own session');
select throws_ok($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('b0000000-0000-0000-0000-00000000000b','40000000-0000-0000-0000-00000000000b','30000000-0000-0000-0000-00000000000b',2,8,50)$q$,
  '42501', null, 'A cannot log a set as B');
select throws_ok($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000b','30000000-0000-0000-0000-00000000000a',9,8,50)$q$,
  '23503', null, 'A cannot attach own set to B''s session (composite FK)');
select lives_ok($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',1,11,42.5) on conflict (session_id, workout_exercise_id, set_number) do update set reps = excluded.reps, weight_kg = excluded.weight_kg$q$,
  'offline replay: first upsert of set 1 works');
select ok(
  t.affected($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',1,11,42.5) on conflict (session_id, workout_exercise_id, set_number) do update set reps = excluded.reps, weight_kg = excluded.weight_kg$q$) = 1
  and (select count(*) from public.set_logs where session_id = '40000000-0000-0000-0000-00000000000a' and set_number = 1) = 1
  and (select reps from public.set_logs where session_id = '40000000-0000-0000-0000-00000000000a' and set_number = 1) = 11,
  'offline replay is idempotent (upsert twice -> one row, updated)');
select is((select count(*) from public.coach_athlete_assignments), 1::bigint, 'A sees only own assignment');
select throws_ok($q$insert into public.coach_athlete_assignments (coach_id, athlete_id) values ('a0000000-0000-0000-0000-00000000000a','b0000000-0000-0000-0000-00000000000b')$q$,
  '42501', null, 'A cannot create an assignment');
select is((select count(*) from public.exercise_library), 1::bigint, 'A sees only exercises used in own plan');
select ok((select count(*) from public.weekly_checkin_stats) = 1 and (select days_logged from public.weekly_checkin_stats) = 2,
  'A weekly_checkin_stats: own rows only (view respects RLS)');
select is((select sum(tonnage_kg) from public.exercise_session_volume), 11 * 42.5 + 9 * 40 + 8 * 42.5,
  'A tonnage view: own sets only (11x42.5 + 9x40 + 8x42.5)');
select ok((select count(*) from public.diet_totals) = 1 and (select kcal from public.diet_totals) = 600,
  'A sees own diet totals only');
select is((select count(*) from public.meal_option_items), 2::bigint, 'A sees own meal items');
select lives_ok($q$insert into public.weekly_forms (athlete_id, week_start_date, diet_compliance_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-26',8)$q$,
  'A weekly form on a Monday ok');
select throws_ok($q$insert into public.weekly_forms (athlete_id, week_start_date, diet_compliance_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-27',8)$q$,
  '23514', null, 'A weekly form on a Tuesday rejected (check)');
select throws_ok($q$insert into public.daily_checkins (athlete_id, checkin_date, stress_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-28',11)$q$,
  '23514', null, 'A check-in stress 11 rejected');
select lives_ok($q$insert into public.daily_checkins (athlete_id, checkin_date, stress_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-28',7)$q$,
  'A check-in stress 7 accepted');
select is((select count(*) from public.daily_checkins where athlete_id = 'b0000000-0000-0000-0000-00000000000b'), 0::bigint,
  'A cannot read B check-ins');

-- ------------------------------------------------------------------ athlete B
select t.as_user('b0000000-0000-0000-0000-00000000000b');

select is((select count(*) from public.profiles), 2::bigint, 'B sees own profile + coach D');
select is((select count(*) from public.set_logs), 1::bigint, 'B sees only own set log');
select is((select count(*) from public.workouts where athlete_id = 'a0000000-0000-0000-0000-00000000000a'), 0::bigint,
  'B cannot see A workouts');
select is(t.affected($q$update public.set_logs set reps = 99 where athlete_id = 'a0000000-0000-0000-0000-00000000000a'$q$),
  0::bigint, 'B cannot update A set logs (0 rows)');

-- ------------------------------------------------------------------ coach C
select t.as_user('c0000000-0000-0000-0000-00000000000c');

select is((select count(*) from public.profiles), 2::bigint, 'C sees self + assigned athlete A only');
select is((select count(*) from public.daily_checkins where athlete_id = 'a0000000-0000-0000-0000-00000000000a'), 3::bigint,
  'C reads A check-ins (2 seeded + 1 logged by A above)');
select is((select count(*) from public.daily_checkins where athlete_id = 'b0000000-0000-0000-0000-00000000000b'), 0::bigint,
  'C cannot read B check-ins');
select is(t.affected($q$update public.set_logs set reps = 1$q$), 0::bigint, 'C cannot edit A set logs (read-only)');
select is(t.affected($q$delete from public.set_logs$q$), 0::bigint, 'C cannot delete A set logs');
select is(t.affected($q$update public.planned_sets set reps_max = 15 where athlete_id = 'a0000000-0000-0000-0000-00000000000a'$q$),
  2::bigint, 'C can edit A planned sets');
select is(t.affected($q$update public.planned_sets set reps_max = 15 where athlete_id = 'b0000000-0000-0000-0000-00000000000b'$q$),
  0::bigint, 'C cannot edit B planned sets');
select throws_ok($q$insert into public.workouts (mesocycle_id, athlete_id, name, position) values ('10000000-0000-0000-0000-00000000000b','b0000000-0000-0000-0000-00000000000b','x',9)$q$,
  '42501', null, 'C cannot create a workout for unassigned B');
select throws_ok($q$insert into public.mesocycles (athlete_id, coach_id, name) values ('a0000000-0000-0000-0000-00000000000a','d0000000-0000-0000-0000-00000000000d','x')$q$,
  '42501', null, 'C cannot author a mesocycle in D''s name');
select lives_ok($q$insert into public.mesocycles (athlete_id, coach_id, name) values ('a0000000-0000-0000-0000-00000000000a','c0000000-0000-0000-0000-00000000000c','Meso A2')$q$,
  'C can author a draft mesocycle for A in own name');
select throws_ok($q$insert into public.coach_athlete_assignments (coach_id, athlete_id) values ('c0000000-0000-0000-0000-00000000000c','b0000000-0000-0000-0000-00000000000b')$q$,
  '42501', null, 'C cannot claim B via assignments');
select is((select count(*) from public.exercise_library), 1::bigint, 'C sees only own library');
select throws_ok($q$insert into public.exercise_library (coach_id, name) values ('d0000000-0000-0000-0000-00000000000d','spy')$q$,
  '42501', null, 'C cannot add an exercise to D''s library');
select lives_ok($q$insert into public.exercise_library (coach_id, name) values ('c0000000-0000-0000-0000-00000000000c','Curl')$q$,
  'C can add own exercise');
select lives_ok($q$insert into public.invitations (coach_id, email) values ('c0000000-0000-0000-0000-00000000000c','new@x.test')$q$,
  'C can create own invitation');
select throws_ok($q$update public.profiles set role = 'admin' where id = 'a0000000-0000-0000-0000-00000000000a'$q$,
  '42501', null, 'C cannot promote anyone (column grant)');

-- ------------------------------------------------------------------ athlete cannot invite
select t.as_user('a0000000-0000-0000-0000-00000000000a');

select throws_ok($q$insert into public.invitations (coach_id, email) values ('a0000000-0000-0000-0000-00000000000a','z@x.test')$q$,
  '42501', null, 'athlete cannot create an invitation');

-- ------------------------------------------------------------------ anon
select t.as_anon();

select throws_ok($q$select count(*) from public.profiles$q$, '42501', null, 'anon cannot read profiles');
select throws_ok($q$select count(*) from public.workouts$q$, '42501', null, 'anon cannot read workouts');
select throws_ok($q$select count(*) from public.weekly_checkin_stats$q$, '42501', null, 'anon cannot read views');
select throws_ok($q$select private.is_coach()$q$, '42501', null, 'anon cannot call private.is_coach()');

-- ------------------------------------------------------------------ integrity (as postgres: constraints hold even without RLS)
select t.as_postgres();

select throws_ok($q$insert into public.coach_athlete_assignments (coach_id, athlete_id) values ('d0000000-0000-0000-0000-00000000000d','a0000000-0000-0000-0000-00000000000a')$q$,
  '23505', null, 'second active coach for A rejected (unique index)');
select throws_ok($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number) values ('b0000000-0000-0000-0000-00000000000b','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',7)$q$,
  '23503', null, 'set_log cannot cross athletes (composite FK) even for superuser');
select throws_ok($q$delete from public.workout_exercises where id = '30000000-0000-0000-0000-00000000000a'$q$,
  '23503', null, 'cannot delete a workout_exercise that has logs');
select throws_ok($q$insert into public.planned_sets (workout_exercise_id, athlete_id, set_number, reps_min, reps_max) values ('30000000-0000-0000-0000-00000000000a','a0000000-0000-0000-0000-00000000000a',9,12,6)$q$,
  '23514', null, 'reps_min > reps_max rejected');
select throws_ok($q$insert into public.mesocycles (athlete_id, coach_id, name, status) values ('a0000000-0000-0000-0000-00000000000a','c0000000-0000-0000-0000-00000000000c','dup','active')$q$,
  '23505', null, 'second active mesocycle for A rejected');

-- ------------------------------------------------------------------ GDPR erasure (last: it deletes A)
select is(t.affected($q$delete from auth.users where id = 'a0000000-0000-0000-0000-00000000000a'$q$), 1::bigint,
  'GDPR: deleting athlete A removes the user');
select ok(
  (select count(*) from public.set_logs where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.workout_sessions where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.workout_exercises where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.diets where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.daily_checkins where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.coach_athlete_assignments where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0,
  'GDPR: all A data gone (sets, sessions, workouts, diets, checkins, assignment)');
select is((select count(*) from public.set_logs where athlete_id = 'b0000000-0000-0000-0000-00000000000b'), 1::bigint,
  'GDPR: B data untouched');

select * from finish();
rollback;
