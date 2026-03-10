import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  userRole: null, // 'coach' o 'athlete'
  setSession: (session) => set({ session }),
  setUserRole: (role) => set({ userRole: role }),
  logout: () => set({ session: null, userRole: null }),
}));