import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useAuthStore = create((set) => ({
  session: null,
  userRole: null, // 'coach' o 'athlete'
  userProfile: null, 

  // Esta función ahora detecta automáticamente quién entra
  setSession: async (session) => {
    if (!session) {
      set({ session: null, userRole: null, userProfile: null });
      return;
    }

    // Buscamos el rol del usuario en la base de datos
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!error && data) {
      set({ session: session, userRole: data.role, userProfile: data });
    } else {
      set({ session: session, userRole: null, userProfile: null });
    }
  },

  setUserRole: (role) => set({ userRole: role }),

  // EL ARREGLO ESTÁ AQUÍ: Destruimos el token de Supabase primero
  logout: async () => {
    await supabase.auth.signOut(); // Esto borra la sesión real del dispositivo
    set({ session: null, userRole: null, userProfile: null }); // Esto limpia la pantalla
  },
}));