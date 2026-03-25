# Fitness Coaching App
App nativa para gestión de clientes de fitness.
- **Coach Dashboard:** Permite asignar Rutinas (con progresión de 4 semanas generada automáticamente) y Dietas (calculadas por macros y comidas) seleccionando a los atletas de la base de datos.
- **Athlete Dashboard:** Consume los datos de Supabase en tiempo real. Muestra la dieta asignada y permite registrar métricas.
- **Flujo de Auth:** Zustand (`useAuthStore.js`) controla la sesión y el rol (`coach` o `athlete`) para redirigir automáticamente al navegador correspondiente (App.js).