-- SQL de referencia para relacion coach-atleta
-- Ajustar y validar en entorno de staging antes de produccion.

create extension if not exists pgcrypto;

create table if not exists public.coach_athlete_assignments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.users(id) on delete cascade,
  athlete_id uuid not null references public.users(id) on delete cascade,
  is_active boolean not null default true,
  assigned_at timestamptz not null default timezone('utc', now()),
  unassigned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists coach_athlete_assignments_coach_idx
  on public.coach_athlete_assignments(coach_id);

create index if not exists coach_athlete_assignments_athlete_idx
  on public.coach_athlete_assignments(athlete_id);

create unique index if not exists coach_athlete_assignments_one_active_per_athlete
  on public.coach_athlete_assignments(athlete_id)
  where is_active = true;

create or replace function public.set_coach_athlete_assignments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_coach_athlete_assignments_updated_at
  on public.coach_athlete_assignments;

create trigger trg_coach_athlete_assignments_updated_at
before update on public.coach_athlete_assignments
for each row
execute function public.set_coach_athlete_assignments_updated_at();

alter table public.coach_athlete_assignments enable row level security;

drop policy if exists "Coach can read own assignments" on public.coach_athlete_assignments;
create policy "Coach can read own assignments"
on public.coach_athlete_assignments
for select
using (coach_id = auth.uid());

drop policy if exists "Coach can manage own assignments" on public.coach_athlete_assignments;
create policy "Coach can manage own assignments"
on public.coach_athlete_assignments
for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

-- Nota: para alta operativa por admin/service-role, gestionar desde backend seguro.
