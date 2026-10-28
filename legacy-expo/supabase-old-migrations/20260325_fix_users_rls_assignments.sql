-- =============================================================
-- FIX 1: Trigger para auto-crear perfil en public.users
--        cuando un usuario se registra via Supabase Auth.
--
-- El rol se toma de user_metadata.role (si se pasa en signup).
-- Si no se pasa, por defecto se asigna 'atleta'.
-- El full_name se toma de user_metadata.full_name o del email.
-- =============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'atleta'),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- =============================================================
-- FIX 2: Políticas RLS en public.users para que el coach
--         pueda leer los perfiles de sus atletas (y de todos
--         los atletas al listarlos para asignar).
-- =============================================================

-- Política: todo usuario autenticado puede leer su propio perfil
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users
  for select
  using (auth.uid() = id);

-- Política: coaches pueden leer todos los perfiles con rol atleta/athlete
drop policy if exists "Coaches can read athlete profiles" on public.users;
create policy "Coaches can read athlete profiles"
  on public.users
  for select
  using (
    exists (
      select 1
      from public.users as me
      where me.id = auth.uid()
        and me.role in ('coach', 'admin')
    )
  );

-- Política: el propio usuario puede actualizar su perfil
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- =============================================================
-- FIX 3: Añadir constraint UNIQUE (coach_id, athlete_id) en
--         coach_athlete_assignments para permitir upsert limpio.
--
-- Esto permite histórico de asignaciones por par coach-atleta
-- y que el upsert use onConflict: 'coach_id,athlete_id'.
-- =============================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coach_athlete_assignments_coach_athlete_unique'
  ) then
    alter table public.coach_athlete_assignments
      add constraint coach_athlete_assignments_coach_athlete_unique
      unique (coach_id, athlete_id);
  end if;
end;
$$;


-- =============================================================
-- BACKFILL: Si ya existen usuarios en auth.users que no tienen
--           fila en public.users, los insertamos ahora.
--
-- Requiere permisos de service_role. Omitir si no aplica.
-- =============================================================

-- insert into public.users (id, role, full_name, avatar_url)
-- select
--   au.id,
--   coalesce(au.raw_user_meta_data->>'role', 'atleta'),
--   coalesce(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
--   au.raw_user_meta_data->>'avatar_url'
-- from auth.users au
-- where not exists (
--   select 1 from public.users pu where pu.id = au.id
-- );
