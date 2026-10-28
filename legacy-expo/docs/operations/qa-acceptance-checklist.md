# Checklist QA y aceptacion

## Precondiciones

- weekly_forms existe y recibe formularios.
- coach_athlete_assignments creada y poblada.
- RLS activa en weekly_forms y coach_athlete_assignments.

## Pruebas por rol

### Coach

1. Login como coach A.
2. Abrir Dashboard y validar que solo aparecen atletas asignados a coach A.
3. Abrir Insights y validar KPIs con los mismos atletas.
4. Abrir AthleteDetail desde Dashboard y verificar que muestra datos reales.
5. Hacer pull-to-refresh en las tres pantallas y confirmar recarga sin crash.

### Coach no asignado

1. Login como coach sin atletas.
2. Validar estado vacio en Dashboard e Insights.
3. Confirmar que no se muestran atletas globales.

### Athlete

1. Login como atleta.
2. Guardar formulario semanal.
3. Volver a login de coach asignado y validar visibilidad de ese formulario.

## Pruebas de seguridad

1. Coach A no puede leer atletas de coach B.
2. Athlete no puede consultar listas del modulo coach.
3. Insercion o update fuera de ownership debe fallar por RLS.

## Pruebas de datos

1. Reasignar un atleta de coach A a coach B:
   - Cerrar asignacion activa anterior.
   - Crear nueva asignacion activa.
2. Verificar que Dashboard/Insights reflejan la reasignacion.

## Criterio Go/No-Go

Go:

- Todos los puntos de seguridad y filtrado cumplen.
- No hay errores en pantallas de coach.

No-Go:

- Cualquier coach ve atletas no asignados.
- Cualquier consulta falla por RLS sin fallback manejado.
