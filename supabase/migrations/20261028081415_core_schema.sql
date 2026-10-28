-- 0001_schema.sql  |  FitnessApp core schema
--
-- Conventions (the reasons the old database got messy are fixed here):
--  1. Every athlete-owned table has its own athlete_id, so RLS is a one-line check.
--  2. Parents expose unique (id, athlete_id). Children use a COMPOSITE foreign key
--     (parent_id, athlete_id), so the database itself guarantees a child can never
--     point at another athlete's parent row.
--  3. Numbers are numeric/int, never text. Units live in the column name.
--  4. Anything computable (tonnage, averages, diet totals) is a view, not a column.
--  5. History is protected: log tables reference plan tables with NO ACTION (a coach
--     cannot delete a plan row that has logs), while deleting the athlete cascades
--     everything (GDPR erasure works).

create type public.user_role as enum ('admin', 'coach', 'athlete');

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- people

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'athlete',
  full_name   text not null default '',
  avatar_url  text,
  locale      text not null default 'es' check (locale in ('es', 'en')),
  created_at  timestamptz not null default now()
);

-- SECURITY: the role is NEVER read from signup metadata (users control that).
-- Everybody starts as 'athlete'. Promote the first coach manually in the SQL editor.
create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.athlete_profiles (
  athlete_id         uuid primary key references public.profiles (id) on delete cascade,
  long_term_goal     text,
  short_term_goal    text,
  program_start_date date,
  updated_at         timestamptz not null default now()
);

create table public.coach_athlete_assignments (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references public.profiles (id) on delete cascade,
  athlete_id    uuid not null references public.profiles (id) on delete cascade,
  is_active     boolean not null default true,
  assigned_at   timestamptz not null default now(),
  unassigned_at timestamptz,
  check (coach_id <> athlete_id)
);
-- An athlete has at most ONE active coach (this is what makes "multi-coach later" safe).
create unique index one_active_coach_per_athlete
  on public.coach_athlete_assignments (athlete_id) where is_active;
create index on public.coach_athlete_assignments (coach_id) where is_active;

create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references public.profiles (id) on delete cascade,
  email       text not null check (email = lower(email)),
  expires_at  timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
create index on public.invitations (coach_id);

-- ---------------------------------------------------------------- training plan

create table public.exercise_library (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references public.profiles (id) on delete cascade,
  name          text not null,
  muscle_group  text,
  video_url     text,
  default_notes text,
  created_at    timestamptz not null default now(),
  unique (coach_id, name)
);

create table public.mesocycles (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  coach_id   uuid not null references public.profiles (id),
  name       text not null,
  starts_on  date,
  status     text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  unique (id, athlete_id)
);
create unique index one_active_mesocycle_per_athlete
  on public.mesocycles (athlete_id) where status = 'active';

create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  mesocycle_id uuid not null,
  athlete_id   uuid not null,
  name         text not null,              -- "Torso", "Pierna"...
  position     smallint not null,
  unique (id, athlete_id),
  foreign key (mesocycle_id, athlete_id)
    references public.mesocycles (id, athlete_id) on delete cascade
);
create index on public.workouts (mesocycle_id);

create table public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null,
  athlete_id  uuid not null,
  exercise_id uuid not null references public.exercise_library (id),
  slot_label  text,                        -- sheet column "G. MUSCULAR", e.g. "Empuje inclinado"
  position    smallint not null,
  coach_notes text,                        -- sheet column "ANOTACIONES"
  unique (id, athlete_id),
  foreign key (workout_id, athlete_id)
    references public.workouts (id, athlete_id) on delete cascade
);
create index on public.workout_exercises (workout_id);
create index on public.workout_exercises (exercise_id);

-- One row per prescribed set. Sheet "6/12" -> reps 6..12. Sheet RIR "1 A 0" -> rir 0..1.
-- Sheet "F+P" (failure + partials) -> rir 0 and technique = 'failure_partials'.
create table public.planned_sets (
  id                  uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null,
  athlete_id          uuid not null,
  set_number          smallint not null check (set_number > 0),
  reps_min            smallint check (reps_min > 0),
  reps_max            smallint check (reps_max > 0),
  rir_min             smallint check (rir_min >= 0),
  rir_max             smallint check (rir_max >= 0),
  technique           text check (technique in ('failure', 'failure_partials')),
  unique (workout_exercise_id, set_number),
  check (reps_min <= reps_max),
  check (rir_min <= rir_max),
  foreign key (workout_exercise_id, athlete_id)
    references public.workout_exercises (id, athlete_id) on delete cascade
);

-- ---------------------------------------------------------------- training logs

create table public.workout_sessions (
  id           uuid primary key default gen_random_uuid(),  -- client may supply (offline sync)
  athlete_id   uuid not null references public.profiles (id) on delete cascade,
  workout_id   uuid not null,
  performed_on date not null default current_date,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (id, athlete_id),
  foreign key (workout_id, athlete_id) references public.workouts (id, athlete_id)
);
create index on public.workout_sessions (athlete_id, performed_on desc);
create index on public.workout_sessions (workout_id);

create table public.set_logs (
  id                  uuid primary key default gen_random_uuid(),  -- client may supply
  athlete_id          uuid not null references public.profiles (id) on delete cascade,
  session_id          uuid not null,
  workout_exercise_id uuid not null,
  set_number          smallint not null check (set_number > 0),    -- may exceed planned sets
  reps                smallint check (reps >= 0),
  weight_kg           numeric(6, 2) check (weight_kg >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- This unique constraint is what makes offline replay safe (upsert on it).
  unique (session_id, workout_exercise_id, set_number),
  foreign key (session_id, athlete_id)
    references public.workout_sessions (id, athlete_id) on delete cascade,
  foreign key (workout_exercise_id, athlete_id)
    references public.workout_exercises (id, athlete_id)
);
create index on public.set_logs (athlete_id, workout_exercise_id);

-- ---------------------------------------------------------------- nutrition

create table public.diets (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  coach_id   uuid not null references public.profiles (id),
  name       text not null,
  phase      text,
  starts_on  date,
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, athlete_id)
);
create unique index one_active_diet_per_athlete on public.diets (athlete_id) where is_active;

create table public.meals (
  id               uuid primary key default gen_random_uuid(),
  diet_id          uuid not null,
  athlete_id       uuid not null,
  position         smallint not null,
  name             text not null,
  target_kcal      integer check (target_kcal >= 0),
  target_protein_g integer check (target_protein_g >= 0),
  target_carbs_g   integer check (target_carbs_g >= 0),
  target_fats_g    integer check (target_fats_g >= 0),
  unique (id, athlete_id),
  foreign key (diet_id, athlete_id)
    references public.diets (id, athlete_id) on delete cascade
);
create index on public.meals (diet_id);

-- "Option A / Option B" of a meal. What is IN the option lives only in meal_option_items.
create table public.meal_options (
  id         uuid primary key default gen_random_uuid(),
  meal_id    uuid not null,
  athlete_id uuid not null,
  position   smallint not null,
  label      text not null,
  unique (id, athlete_id),
  foreign key (meal_id, athlete_id)
    references public.meals (id, athlete_id) on delete cascade
);
create index on public.meal_options (meal_id);

create table public.meal_option_items (
  id             uuid primary key default gen_random_uuid(),
  meal_option_id uuid not null,
  athlete_id     uuid not null,
  position       smallint not null,
  food_name      text not null,
  quantity       numeric(8, 2) not null check (quantity > 0),
  unit           text not null default 'g',
  foreign key (meal_option_id, athlete_id)
    references public.meal_options (id, athlete_id) on delete cascade
);
create index on public.meal_option_items (meal_option_id);

create table public.meal_logs (
  id               uuid primary key default gen_random_uuid(),
  athlete_id       uuid not null references public.profiles (id) on delete cascade,
  meal_id          uuid not null,
  chosen_option_id uuid,
  log_date         date not null default current_date,
  completed_at     timestamptz not null default now(),
  unique (athlete_id, meal_id, log_date),
  foreign key (meal_id, athlete_id) references public.meals (id, athlete_id),
  -- needs PostgreSQL 15+ (column list in SET NULL); Supabase projects have it
  foreign key (chosen_option_id, athlete_id)
    references public.meal_options (id, athlete_id) on delete set null (chosen_option_id)
);

-- ---------------------------------------------------------------- daily tracking

create table public.daily_checkins (
  id               uuid primary key default gen_random_uuid(),
  athlete_id       uuid not null references public.profiles (id) on delete cascade,
  checkin_date     date not null,
  weight_fasted_kg numeric(5, 2) check (weight_fasted_kg > 0),
  steps            integer check (steps >= 0),
  sleep_minutes    smallint check (sleep_minutes between 0 and 1440),  -- show as h:mm in the UI
  stress_score     smallint check (stress_score between 1 and 10),     -- ASSUMED 1-10, confirm
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (athlete_id, checkin_date)
);

create table public.body_measurements (
  id              uuid primary key default gen_random_uuid(),
  athlete_id      uuid not null references public.profiles (id) on delete cascade,
  measured_on     date not null,
  chest_cm        numeric(5, 1) check (chest_cm > 0),
  right_bicep_cm  numeric(5, 1) check (right_bicep_cm > 0),
  left_bicep_cm   numeric(5, 1) check (left_bicep_cm > 0),
  waist_cm        numeric(5, 1) check (waist_cm > 0),
  glute_cm        numeric(5, 1) check (glute_cm > 0),
  quad_right_cm   numeric(5, 1) check (quad_right_cm > 0),
  quad_left_cm    numeric(5, 1) check (quad_left_cm > 0),
  calf_right_cm   numeric(5, 1) check (calf_right_cm > 0),
  calf_left_cm    numeric(5, 1) check (calf_left_cm > 0),
  created_at      timestamptz not null default now(),
  unique (athlete_id, measured_on)
);

-- iso_year / iso_week / adherence_label were dropped: they are derivable from the date / score.
create table public.weekly_forms (
  id                    uuid primary key default gen_random_uuid(),
  athlete_id            uuid not null references public.profiles (id) on delete cascade,
  diet_id               uuid,
  week_start_date       date not null check (extract(isodow from week_start_date) = 1), -- a Monday
  diet_compliance_score smallint not null check (diet_compliance_score between 1 and 10), -- ASSUMED scale
  hunger_score          smallint check (hunger_score between 1 and 10),
  energy_score          smallint check (energy_score between 1 and 10),
  digestion_score       smallint check (digestion_score between 1 and 10),
  notes                 text,
  submitted_at          timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (athlete_id, week_start_date),
  foreign key (diet_id, athlete_id)
    references public.diets (id, athlete_id) on delete set null (diet_id)
);

-- ---------------------------------------------------------------- shared triggers + indexes

do $$
declare t text;
begin
  foreach t in array array['athlete_profiles', 'set_logs', 'daily_checkins', 'weekly_forms'] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;

  -- Postgres does NOT index foreign keys automatically, and RLS filters on athlete_id constantly.
  foreach t in array array[
    'mesocycles', 'workouts', 'workout_exercises', 'planned_sets', 'diets', 'meals',
    'meal_options', 'meal_option_items', 'meal_logs', 'body_measurements', 'weekly_forms'
  ] loop
    execute format('create index on public.%I (athlete_id)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- views (replace the sheet formulas)
-- security_invoker = the view runs with the CALLER's permissions, so RLS still applies.

-- Sheet "MEDIA" row, per athlete per week. Empty weeks simply have no row (no #DIV/0!).
create view public.weekly_checkin_stats with (security_invoker = true) as
select
  athlete_id,
  date_trunc('week', checkin_date)::date  as week_start,
  count(*)                                as days_logged,
  round(avg(weight_fasted_kg), 2)         as avg_weight_kg,
  round(avg(steps))                       as avg_steps,
  round(avg(sleep_minutes))               as avg_sleep_minutes,
  round(avg(stress_score), 1)             as avg_stress
from public.daily_checkins
group by athlete_id, date_trunc('week', checkin_date)::date;

-- Sheet "TONELAJE" column: sum(reps x weight), per exercise per session.
create view public.exercise_session_volume with (security_invoker = true) as
select
  l.athlete_id,
  l.session_id,
  l.workout_exercise_id,
  s.performed_on,
  sum(l.reps)                       as total_reps,
  sum(l.reps * l.weight_kg)         as tonnage_kg
from public.set_logs l
join public.workout_sessions s on s.id = l.session_id
group by l.athlete_id, l.session_id, l.workout_exercise_id, s.performed_on;

create view public.diet_totals with (security_invoker = true) as
select
  d.id as diet_id,
  d.athlete_id,
  coalesce(sum(m.target_kcal), 0)      as kcal,
  coalesce(sum(m.target_protein_g), 0) as protein_g,
  coalesce(sum(m.target_carbs_g), 0)   as carbs_g,
  coalesce(sum(m.target_fats_g), 0)    as fats_g
from public.diets d
left join public.meals m on m.diet_id = d.id
group by d.id, d.athlete_id;
