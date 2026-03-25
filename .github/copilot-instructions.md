# Contexto del Proyecto
Aplicación móvil de Fitness (Coach/Athlete) construida para nivel de producción. 
- Framework: React Native con Expo (ESTRICTAMENTE SDK 51, no usar SDK superiores).
- Estado Global: Zustand.
- Backend/BBDD: Supabase (PostgreSQL).
- Estilos: NativeWind (Tailwind CSS para React Native).

# Reglas Arquitectónicas (Senior Level)
1. Separación de responsabilidades: Mover progresivamente la lógica compleja y llamadas a Supabase a Custom Hooks (ej. `useDiet.js`, `useRoutine.js`) manteniendo los componentes de UI limpios.
2. React Native Estricto: Absolutamente todas las cadenas de texto deben ir envueltas en componentes `<Text>`. NUNCA texto suelto.
3. Manejo de Errores: Usar bloques `try/catch` para llamadas a Supabase y manejar los errores visualmente con `Alert.alert`.
4. Consultas Supabase: Preferir `.maybeSingle()` sobre `.single()` cuando se espere 1 o 0 resultados para evitar errores de PGRST116.

# Esquema Relacional de Base de Datos (Regla de Oro)
La base de datos tiene `Row Level Security (RLS)` y borrado en cascada (`Cascade`).
- **Autenticación:** Tabla `users` (id, role: 'coach'|'atleta', full_name, avatar_url).
- **Entrenamiento:** `mesocycles` (athlete_id) -> `workouts` (mesocycle_id, order) -> `exercises` (workout_id, coach_notes) -> `exercise_sets` (exercise_id, target_reps, target_rir) -> `workout_logs` (set_id, week_number, actual_weight, actual_reps).
- **Nutrición:** `diets` (athlete_id, phase, total_kcal, macros...) -> `meals` (diet_id, meal_order, target_kcal, macros...).
Nota: Todos los IDs primarios son UUID autogenerados (`gen_random_uuid()`). Las FKs conectan la jerarquía.