# Plan de implementacion: siguientes pasos

## Fase 1: Datos y seguridad (bloqueante)

1. Crear tabla intermedia coach_athlete_assignments.
2. Crear indices y trigger updated_at.
3. Aplicar RLS de ownership por coach.
4. Cargar asignaciones iniciales.

Entregable:

- Migracion SQL aplicada y verificada.

## Fase 2: Backend app (lectura filtrada)

1. Extender hook useCoachCompliance para filtrar por coach autenticado.
2. Reemplazar fetchAthleteProfiles global por fetchAssignedAthletes.
3. Mantener fallback controlado solo para entorno sin asignaciones.

Entregable:

- Dashboard, Insights y AthleteDetail mostrando solo atletas asignados.

## Fase 3: UX y operacion

1. Crear estado vacio cuando coach no tenga atletas asignados.
2. Mensaje accionable para admins: "asigna atletas para ver metricas".
3. Pull-to-refresh ya implementado, conservar en nuevo flujo.

Entregable:

- Flujo coach robusto sin datos mock.

## Fase 4: Gobierno y calidad

1. Agregar script SQL de verificacion post-migracion.
2. Checklist de pruebas manuales por rol (coach/athlete).
3. Confirmar que role usa valores permitidos en toda la app.

Entregable:

- Release checklist completado.

## Prioridad recomendada

- Ejecutar primero Fase 1 y Fase 2 antes de nuevas features.

## Criterios de exito

- Un coach no puede ver atletas de otro coach.
- KPIs de Insights cambian al cambiar cartera del coach.
- AthleteDetail solo abre atletas asignados.
- No aparecen errores RLS en consultas del coach.
