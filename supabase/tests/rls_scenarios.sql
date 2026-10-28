-- Behavioural tests for 0001/0002 against the local Supabase imitation.
-- IDs: C,D coaches; A (coach C), B (coach D), F athletes. A never sees B and vice versa.

create schema t;
grant usage on schema t to anon, authenticated;

create function t.as_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  execute 'set local role authenticated';
end $$;

create function t.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'set local role anon';
end $$;

create function t.fails(q text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return true; end $$;

create function t.affected(q text) returns bigint language plpgsql as $$
declare n bigint;
begin execute q; get diagnostics n = row_count; return n; end $$;

create function t.check(name text, ok boolean) returns void language plpgsql as $$
begin raise notice '% : %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

-- ------------------------------------------------------------------ seed (as postgres)
insert into auth.users (id, email, raw_user_meta_data) values
  ('c0000000-0000-0000-0000-00000000000c', 'c@x.test', '{"full_name":"Coach C"}'),
  ('d0000000-0000-0000-0000-00000000000d', 'd@x.test', '{"full_name":"Coach D"}'),
  ('a0000000-0000-0000-0000-00000000000a', 'a@x.test', '{"full_name":"Athlete A"}'),
  ('b0000000-0000-0000-0000-00000000000b', 'b@x.test', '{"full_name":"Athlete B"}'),
  ('f0000000-0000-0000-0000-00000000000f', 'f@x.test', '{"full_name":"Sneaky","role":"admin"}');

select t.check('signup metadata role=admin is ignored (profile role is athlete)',
  (select role::text from public.profiles where id = 'f0000000-0000-0000-0000-00000000000f') = 'athlete');

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
begin;
select t.as_user('a0000000-0000-0000-0000-00000000000a');
select t.check('A sees own profile + own coach only (2 profiles)', (select count(*) from public.profiles) = 2);
select t.check('A cannot promote self to admin (column grant)', t.fails($q$update public.profiles set role = 'admin' where id = 'a0000000-0000-0000-0000-00000000000a'$q$));
select t.check('A can rename self', t.affected($q$update public.profiles set full_name = 'Ana' where id = 'a0000000-0000-0000-0000-00000000000a'$q$) = 1);
select t.check('A sees only own workout', (select count(*) from public.workouts) = 1 and (select count(*) from public.workouts where athlete_id = 'b0000000-0000-0000-0000-00000000000b') = 0);
select t.check('A cannot edit plan (0 rows updated)', t.affected($q$update public.workouts set name = 'hack'$q$) = 0);
select t.check('A cannot insert a workout', t.fails($q$insert into public.workouts (mesocycle_id, athlete_id, name, position) values ('10000000-0000-0000-0000-00000000000a','a0000000-0000-0000-0000-00000000000a','x',9)$q$));
select t.check('A can log a set on own session', not t.fails($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',3,8,42.5)$q$));
select t.check('A cannot log a set as B', t.fails($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('b0000000-0000-0000-0000-00000000000b','40000000-0000-0000-0000-00000000000b','30000000-0000-0000-0000-00000000000b',2,8,50)$q$));
select t.check('A cannot attach own set to B''s session (composite FK)', t.fails($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000b','30000000-0000-0000-0000-00000000000a',9,8,50)$q$));
select t.affected($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',1,11,42.5) on conflict (session_id, workout_exercise_id, set_number) do update set reps = excluded.reps, weight_kg = excluded.weight_kg$q$);
select t.check('offline replay is idempotent (upsert twice -> one row, updated)',
  t.affected($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number, reps, weight_kg) values ('a0000000-0000-0000-0000-00000000000a','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',1,11,42.5) on conflict (session_id, workout_exercise_id, set_number) do update set reps = excluded.reps, weight_kg = excluded.weight_kg$q$) = 1
  and (select count(*) from public.set_logs where session_id = '40000000-0000-0000-0000-00000000000a' and set_number = 1) = 1
  and (select reps from public.set_logs where session_id = '40000000-0000-0000-0000-00000000000a' and set_number = 1) = 11);
select t.check('A sees only own assignment', (select count(*) from public.coach_athlete_assignments) = 1);
select t.check('A cannot create an assignment', t.fails($q$insert into public.coach_athlete_assignments (coach_id, athlete_id) values ('a0000000-0000-0000-0000-00000000000a','b0000000-0000-0000-0000-00000000000b')$q$));
select t.check('A sees only exercises used in own plan (1)', (select count(*) from public.exercise_library) = 1);
select t.check('A weekly_checkin_stats: own rows only (view respects RLS)', (select count(*) from public.weekly_checkin_stats) = 1 and (select days_logged from public.weekly_checkin_stats) = 2);
select t.check('A tonnage view: 10x40 + 9x40 = 760 (after rollback of earlier edits not applicable; set 1 now 11x42.5)', (select sum(tonnage_kg) from public.exercise_session_volume) = 11*42.5 + 9*40 + 8*42.5);
select t.check('A sees own diet totals only', (select count(*) from public.diet_totals) = 1 and (select kcal from public.diet_totals) = 600);
select t.check('A sees own meal items (2)', (select count(*) from public.meal_option_items) = 2);
select t.check('A weekly form on a Monday ok', not t.fails($q$insert into public.weekly_forms (athlete_id, week_start_date, diet_compliance_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-26',8)$q$));
select t.check('A weekly form on a Tuesday rejected (check)', t.fails($q$insert into public.weekly_forms (athlete_id, week_start_date, diet_compliance_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-27',8)$q$));
select t.check('A check-in stress 11 rejected, 7 accepted', t.fails($q$insert into public.daily_checkins (athlete_id, checkin_date, stress_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-28',11)$q$) and not t.fails($q$insert into public.daily_checkins (athlete_id, checkin_date, stress_score) values ('a0000000-0000-0000-0000-00000000000a','2026-10-28',7)$q$));
select t.check('A cannot read B check-ins', (select count(*) from public.daily_checkins where athlete_id = 'b0000000-0000-0000-0000-00000000000b') = 0);
rollback;

-- ------------------------------------------------------------------ athlete B
begin;
select t.as_user('b0000000-0000-0000-0000-00000000000b');
select t.check('B sees own profile + coach D (2)', (select count(*) from public.profiles) = 2);
select t.check('B sees only own set log (1)', (select count(*) from public.set_logs) = 1);
select t.check('B cannot see A workouts', (select count(*) from public.workouts where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0);
select t.check('B cannot update A set logs (0 rows)', t.affected($q$update public.set_logs set reps = 99 where athlete_id = 'a0000000-0000-0000-0000-00000000000a'$q$) = 0);
rollback;

-- ------------------------------------------------------------------ coach C
begin;
select t.as_user('c0000000-0000-0000-0000-00000000000c');
select t.check('C sees self + assigned athlete A only (2 profiles)', (select count(*) from public.profiles) = 2);
select t.check('C reads A check-ins (2), not B (0)', (select count(*) from public.daily_checkins where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 2 and (select count(*) from public.daily_checkins where athlete_id = 'b0000000-0000-0000-0000-00000000000b') = 0);
select t.check('C cannot edit A set logs (read-only)', t.affected($q$update public.set_logs set reps = 1$q$) = 0);
select t.check('C cannot delete A set logs', t.affected($q$delete from public.set_logs$q$) = 0);
select t.check('C can edit A planned sets (2) and not B (0)', t.affected($q$update public.planned_sets set reps_max = 15 where athlete_id = 'a0000000-0000-0000-0000-00000000000a'$q$) = 2 and t.affected($q$update public.planned_sets set reps_max = 15 where athlete_id = 'b0000000-0000-0000-0000-00000000000b'$q$) = 0);
select t.check('C cannot create a workout for unassigned B', t.fails($q$insert into public.workouts (mesocycle_id, athlete_id, name, position) values ('10000000-0000-0000-0000-00000000000b','b0000000-0000-0000-0000-00000000000b','x',9)$q$));
select t.check('C cannot author a mesocycle in D''s name', t.fails($q$insert into public.mesocycles (athlete_id, coach_id, name) values ('a0000000-0000-0000-0000-00000000000a','d0000000-0000-0000-0000-00000000000d','x')$q$));
select t.check('C can author a draft mesocycle for A in own name', not t.fails($q$insert into public.mesocycles (athlete_id, coach_id, name) values ('a0000000-0000-0000-0000-00000000000a','c0000000-0000-0000-0000-00000000000c','Meso A2')$q$));
select t.check('C cannot claim B via assignments', t.fails($q$insert into public.coach_athlete_assignments (coach_id, athlete_id) values ('c0000000-0000-0000-0000-00000000000c','b0000000-0000-0000-0000-00000000000b')$q$));
select t.check('C sees only own library (1); cannot add exercise for D', (select count(*) from public.exercise_library) = 1 and t.fails($q$insert into public.exercise_library (coach_id, name) values ('d0000000-0000-0000-0000-00000000000d','spy')$q$));
select t.check('C can add own exercise', not t.fails($q$insert into public.exercise_library (coach_id, name) values ('c0000000-0000-0000-0000-00000000000c','Curl')$q$));
select t.check('C can create own invitation', not t.fails($q$insert into public.invitations (coach_id, email) values ('c0000000-0000-0000-0000-00000000000c','new@x.test')$q$));
select t.check('C cannot promote anyone (column grant)', t.fails($q$update public.profiles set role = 'admin' where id = 'a0000000-0000-0000-0000-00000000000a'$q$));
rollback;

-- ------------------------------------------------------------------ athlete cannot invite / anon
begin;
select t.as_user('a0000000-0000-0000-0000-00000000000a');
select t.check('athlete cannot create an invitation', t.fails($q$insert into public.invitations (coach_id, email) values ('a0000000-0000-0000-0000-00000000000a','z@x.test')$q$));
rollback;

begin;
select t.as_anon();
select t.check('anon cannot read profiles', t.fails($q$select count(*) from public.profiles$q$));
select t.check('anon cannot read workouts', t.fails($q$select count(*) from public.workouts$q$));
select t.check('anon cannot read views', t.fails($q$select count(*) from public.weekly_checkin_stats$q$));
select t.check('anon cannot call is_coach()', t.fails($q$select private.is_coach()$q$));
rollback;

-- ------------------------------------------------------------------ integrity (as postgres)
select t.check('second active coach for A rejected (unique index)', t.fails($q$insert into public.coach_athlete_assignments (coach_id, athlete_id) values ('d0000000-0000-0000-0000-00000000000d','a0000000-0000-0000-0000-00000000000a')$q$));
select t.check('set_log cannot cross athletes (composite FK) even for superuser', t.fails($q$insert into public.set_logs (athlete_id, session_id, workout_exercise_id, set_number) values ('b0000000-0000-0000-0000-00000000000b','40000000-0000-0000-0000-00000000000a','30000000-0000-0000-0000-00000000000a',7)$q$));
select t.check('cannot delete a workout_exercise that has logs', t.fails($q$delete from public.workout_exercises where id = '30000000-0000-0000-0000-00000000000a'$q$));
select t.check('reps_min > reps_max rejected', t.fails($q$insert into public.planned_sets (workout_exercise_id, athlete_id, set_number, reps_min, reps_max) values ('30000000-0000-0000-0000-00000000000a','a0000000-0000-0000-0000-00000000000a',9,12,6)$q$));
select t.check('second active mesocycle for A rejected', t.fails($q$insert into public.mesocycles (athlete_id, coach_id, name, status) values ('a0000000-0000-0000-0000-00000000000a','c0000000-0000-0000-0000-00000000000c','dup','active')$q$));

begin;
select t.check('GDPR: deleting athlete A removes the user', t.affected($q$delete from auth.users where id = 'a0000000-0000-0000-0000-00000000000a'$q$) = 1);
select t.check('GDPR: all A data gone (sets, sessions, workouts, diets, checkins, assignment)',
  (select count(*) from public.set_logs where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.workout_sessions where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.workout_exercises where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.diets where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.daily_checkins where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0
  and (select count(*) from public.coach_athlete_assignments where athlete_id = 'a0000000-0000-0000-0000-00000000000a') = 0);
select t.check('GDPR: B data untouched', (select count(*) from public.set_logs where athlete_id = 'b0000000-0000-0000-0000-00000000000b') = 1);
rollback;
