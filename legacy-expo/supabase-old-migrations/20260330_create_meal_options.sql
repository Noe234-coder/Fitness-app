-- ============================================================
-- Migración: Opciones de comida por meal
-- Jerarquía: diets → meals → meal_options → meal_option_items
-- ============================================================

-- Tabla de opciones por comida (hasta 5 por meal)
create table if not exists public.meal_options (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  option_order smallint not null default 1,
  label text not null default 'Opción 1',
  created_at timestamptz not null default timezone('utc', now()),
  constraint meal_options_meal_order_unique unique (meal_id, option_order)
);

-- Tabla de alimentos dentro de cada opción
create table if not exists public.meal_option_items (
  id uuid primary key default gen_random_uuid(),
  meal_option_id uuid not null references public.meal_options(id) on delete cascade,
  food_name text not null,
  quantity numeric(8,1) not null default 0,
  unit text not null default 'g',
  item_order smallint not null default 1,
  created_at timestamptz not null default timezone('utc', now())
);

-- Índices para consultas rápidas
create index if not exists idx_meal_options_meal_id on public.meal_options(meal_id);
create index if not exists idx_meal_option_items_option_id on public.meal_option_items(meal_option_id);

-- ============================================================
-- RLS: meal_options
-- ============================================================
alter table public.meal_options enable row level security;

-- Atleta puede leer opciones de sus propias comidas
create policy "Athletes can read own meal options"
  on public.meal_options for select
  using (
    exists (
      select 1 from public.meals m
      join public.diets d on d.id = m.diet_id
      where m.id = meal_options.meal_id
        and d.athlete_id = auth.uid()
    )
  );

-- Coach puede leer opciones de comidas de sus atletas asignados
create policy "Coaches can read assigned athlete meal options"
  on public.meal_options for select
  using (
    exists (
      select 1 from public.meals m
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where m.id = meal_options.meal_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- Coach puede insertar opciones para sus atletas asignados
create policy "Coaches can insert meal options for assigned athletes"
  on public.meal_options for insert
  with check (
    exists (
      select 1 from public.meals m
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where m.id = meal_options.meal_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- Coach puede actualizar opciones de sus atletas
create policy "Coaches can update meal options for assigned athletes"
  on public.meal_options for update
  using (
    exists (
      select 1 from public.meals m
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where m.id = meal_options.meal_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- Coach puede borrar opciones de sus atletas
create policy "Coaches can delete meal options for assigned athletes"
  on public.meal_options for delete
  using (
    exists (
      select 1 from public.meals m
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where m.id = meal_options.meal_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- ============================================================
-- RLS: meal_option_items
-- ============================================================
alter table public.meal_option_items enable row level security;

-- Atleta puede leer items de sus propias opciones
create policy "Athletes can read own meal option items"
  on public.meal_option_items for select
  using (
    exists (
      select 1 from public.meal_options mo
      join public.meals m on m.id = mo.meal_id
      join public.diets d on d.id = m.diet_id
      where mo.id = meal_option_items.meal_option_id
        and d.athlete_id = auth.uid()
    )
  );

-- Coach puede leer items de opciones de sus atletas asignados
create policy "Coaches can read assigned athlete meal option items"
  on public.meal_option_items for select
  using (
    exists (
      select 1 from public.meal_options mo
      join public.meals m on m.id = mo.meal_id
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where mo.id = meal_option_items.meal_option_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- Coach puede insertar items para sus atletas asignados
create policy "Coaches can insert meal option items for assigned athletes"
  on public.meal_option_items for insert
  with check (
    exists (
      select 1 from public.meal_options mo
      join public.meals m on m.id = mo.meal_id
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where mo.id = meal_option_items.meal_option_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- Coach puede actualizar items de sus atletas
create policy "Coaches can update meal option items for assigned athletes"
  on public.meal_option_items for update
  using (
    exists (
      select 1 from public.meal_options mo
      join public.meals m on m.id = mo.meal_id
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where mo.id = meal_option_items.meal_option_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );

-- Coach puede borrar items de sus atletas
create policy "Coaches can delete meal option items for assigned athletes"
  on public.meal_option_items for delete
  using (
    exists (
      select 1 from public.meal_options mo
      join public.meals m on m.id = mo.meal_id
      join public.diets d on d.id = m.diet_id
      join public.coach_athlete_assignments caa on caa.athlete_id = d.athlete_id
      where mo.id = meal_option_items.meal_option_id
        and caa.coach_id = auth.uid()
        and caa.is_active = true
    )
  );
