# Fitness Coaching App
App nativa para gestión de clientes de fitness.
- **Coach Dashboard:** Permite asignar Rutinas (con progresión de 4 semanas generada automáticamente) y Dietas (calculadas por macros y comidas) seleccionando a los atletas de la base de datos.
- **Athlete Dashboard:** Consume los datos de Supabase en tiempo real. Muestra la dieta asignada y permite registrar métricas.
- **Flujo de Auth:** Zustand (`useAuthStore.js`) controla la sesión y el rol (`coach` o `athlete`) para redirigir automáticamente al navegador correspondiente (App.js).

## Documentacion de continuidad

Para seguir evolucionando el modulo de compliance y el filtrado por coach:

- Ver indice de documentos en `docs/README.md`.
- Decision arquitectonica de asignacion coach-atleta en `docs/architecture/coach-athlete-assignment.md`.
- Roadmap de implementacion por fases en `docs/implementation/compliance-next-steps.md`.
- Checklist de QA y aceptacion en `docs/operations/qa-acceptance-checklist.md`.
- SQL de referencia para tabla intermedia en `docs/sql/001_create_coach_athlete_assignments.sql`.