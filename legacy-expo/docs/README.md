# Documentacion de continuidad

Este directorio centraliza las decisiones y pasos operativos para evolucionar el sistema de compliance.

## Contenido

- architecture/coach-athlete-assignment.md: decision de modelado para relacion coach-atleta.
- implementation/compliance-next-steps.md: plan por fases para pasar de entorno actual a produccion.
- operations/qa-acceptance-checklist.md: checklist de validacion funcional, seguridad y datos.
- sql/001_create_coach_athlete_assignments.sql: SQL de referencia para crear la tabla intermedia.

## Objetivo inmediato

Estandarizar la asignacion coach-atleta para poder filtrar Dashboard, Insights y AthleteDetail por coach autenticado.
