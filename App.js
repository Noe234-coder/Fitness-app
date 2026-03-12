import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/useAuthStore';
import { supabase } from './src/services/supabase';

// Importamos pantallas y navegadores
import LoginScreen from './src/screens/auth/LoginScreen';
import CoachNavigator from './src/navigation/CoachNavigator';
import AthleteNavigator from './src/navigation/AthleteNavigator';

export default function App() {
  const { session, setSession, userRole } = useAuthStore();

  // Escuchamos la sesión en tiempo real de Supabase
  useEffect(() => {
    // 1. Mirar si ya había una sesión guardada al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Quedarse escuchando por si el usuario entra o sale
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpieza al cerrar
    return () => subscription.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style={userRole === 'coach' ? "dark" : "light"} />
      
      {/* Lógica de navegación principal */}
      {(!session && !userRole) ? (
        <LoginScreen />
      ) : userRole === 'coach' ? (
        <CoachNavigator />
      ) : (
        <AthleteNavigator />
      )}
      
    </NavigationContainer>
  );
}