import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useAuthStore = create((set) => ({
  session: null,
  userRole: null, // 'coach' o 'athlete'
  userProfile: null, // Aquí guardaremos toda la fila de la tabla 'users'
  
  setSession: async (session) => {
    // Si no hay sesión (el usuario ha cerrado sesión o no ha entrado), limpiamos todo
    if (!session) {
      set({ session: null, userRole: null, userProfile: null });
      return;
    }

    // Si hay sesión, vamos a tu tabla 'users' a buscar quién es esta persona
    const { data: profileData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error && profileData) {
      // Guardamos la sesión, el rol exacto y todo su perfil
      set({ 
        session: session, 
        userRole: profileData.role, 
        userProfile: profileData 
      });
    } else {
      console.error("Error fetching user profile:", error);
      // Por seguridad, si falla, solo guardamos la sesión pero sin rol
      set({ session: session, userRole: null, userProfile: null });
    }
  },

  // Función útil para el botón de "Cerrar sesión"
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, userRole: null, userProfile: null });
  }
}));