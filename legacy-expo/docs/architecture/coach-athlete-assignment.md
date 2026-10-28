# Decision de arquitectura: relacion coach-atleta

## Contexto

Estado actual detectado:

- users solo contiene: id, role, full_name, avatar_url.
- No existe columna coach_id en users.
- No existe tabla intermedia coach-athlete.
- El modulo de coach hoy consulta todos los atletas.

Impacto:

- No se puede aplicar aislamiento por coach en Dashboard, Insights y AthleteDetail.
- Las metricas de compliance no representan cartera real del coach.

## Decision

Crear tabla intermedia dedicada para asignacion entre coach y atleta.

Nombre recomendado:

- coach_athlete_assignments

Razon:

- Escalable para historico (altas, bajas, reasignaciones).
- Evita acoplar users con una sola relacion fija.
- Facilita politicas RLS por ownership.

## Modelo recomendado

Campos minimos:

- id uuid pk
- coach_id uuid fk -> users.id
- athlete_id uuid fk -> users.id
- is_active boolean default true
- assigned_at timestamptz default now()
- unassigned_at timestamptz null
- created_at timestamptz default now()
- updated_at timestamptz default now()

Restricciones:

- unique parcial para una asignacion activa por atleta.
- check de roles en politicas (coach para coach_id, athlete o atleta para athlete_id).

## Regla funcional

- Un atleta puede tener solo un coach activo a la vez.
- Puede tener historico de asignaciones inactivas.

## Integracion app

Consultar primero atletas asignados al coach y luego cruzar con weekly_forms y diets.

Consulta conceptual:

1) obtener athlete_id desde coach_athlete_assignments where coach_id = auth.uid() and is_active = true
2) usar ese set de athlete_id en Dashboard, Insights, AthleteDetail

## RLS objetivo

- Coach: select sobre sus propias asignaciones activas e inactivas.
- Athlete: opcional select sobre su asignacion activa.
- Service role: gestion administrativa completa.

## Riesgos si no se aplica

- Exposicion de datos de atletas no asignados.
- KPIs de compliance inconsistentes por coach.
- Dificultad para auditar reasignaciones.
