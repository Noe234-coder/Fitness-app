create extension if not exists pgcrypto;

create table if not exists public.weekly_forms (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.users(id) on delete cascade,
  diet_id uuid references public.diets(id) on delete set null,
  week_start_date date not null,
  iso_year integer not null,
  iso_week integer not null,
  diet_compliance_score smallint not null check (diet_compliance_score between 0 and 100),
  adherence_label text,
  hunger_score smallint check (hunger_score between 1 and 5),
  energy_score smallint check (energy_score between 1 and 5),
  digestion_score smallint check (digestion_score between 1 and 5),
  notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint weekly_forms_athlete_week_unique unique (athlete_id, iso_year, iso_week)
);

alter table public.weekly_forms
  add column if not exists diet_id uuid references public.diets(id) on delete set null,
  add column if not exists week_start_date date,
  add column if not exists iso_year integer,
  add column if not exists iso_week integer,
  add column if not exists diet_compliance_score smallint,
  add column if not exists adherence_label text,
  add column if not exists hunger_score smallint,
  add column if not exists energy_score smallint,
  add column if not exists digestion_score smallint,
  add column if not exists notes text,
  add column if not exists submitted_at timestamptz not null default timezone('utc', now()),
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.weekly_forms
set submitted_at = coalesce(submitted_at, timezone('utc', now())),
    created_at = coalesce(created_at, timezone('utc', now())),
    updated_at = coalesce(updated_at, timezone('utc', now()))
where submitted_at is null
   or created_at is null
   or updated_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'weekly_forms_athlete_week_unique'
  ) then
    alter table public.weekly_forms
      add constraint weekly_forms_athlete_week_unique unique (athlete_id, iso_year, iso_week);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'weekly_forms_diet_compliance_score_check'
  ) then
    alter table public.weekly_forms
      add constraint weekly_forms_diet_compliance_score_check
      check (diet_compliance_score between 0 and 100);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'weekly_forms_hunger_score_check'
  ) then
    alter table public.weekly_forms
      add constraint weekly_forms_hunger_score_check
      check (hunger_score between 1 and 5);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'weekly_forms_energy_score_check'
  ) then
    alter table public.weekly_forms
      add constraint weekly_forms_energy_score_check
      check (energy_score between 1 and 5);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'weekly_forms_digestion_score_check'
  ) then
    alter table public.weekly_forms
      add constraint weekly_forms_digestion_score_check
      check (digestion_score between 1 and 5);
  end if;
end;
$$;

create index if not exists weekly_forms_athlete_id_idx on public.weekly_forms (athlete_id);
create index if not exists weekly_forms_diet_id_idx on public.weekly_forms (diet_id);
create index if not exists weekly_forms_iso_lookup_idx on public.weekly_forms (iso_year, iso_week);

create or replace function public.set_weekly_forms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_weekly_forms_updated_at on public.weekly_forms;

create trigger trg_weekly_forms_updated_at
before update on public.weekly_forms
for each row
execute function public.set_weekly_forms_updated_at();

alter table public.weekly_forms enable row level security;

drop policy if exists "Athletes can read their weekly forms" on public.weekly_forms;
create policy "Athletes can read their weekly forms"
on public.weekly_forms
for select
using (auth.uid() = athlete_id);

drop policy if exists "Athletes can insert their weekly forms" on public.weekly_forms;
create policy "Athletes can insert their weekly forms"
on public.weekly_forms
for insert
with check (auth.uid() = athlete_id);

drop policy if exists "Athletes can update their weekly forms" on public.weekly_forms;
create policy "Athletes can update their weekly forms"
on public.weekly_forms
for update
using (auth.uid() = athlete_id)
with check (auth.uid() = athlete_id);

drop policy if exists "Coaches can read all weekly forms" on public.weekly_forms;
create policy "Coaches can read all weekly forms"
on public.weekly_forms
for select
using (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role in ('coach', 'admin')
  )
);