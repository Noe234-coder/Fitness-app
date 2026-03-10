import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/useAuthStore';

// 1. Pantalla de Login
function LoginScreen() {
  const setUserRole = useAuthStore((state) => state.setUserRole);

  return (
    <SafeAreaView className="flex-1 bg-background-dark items-center justify-center p-6">
      <Text className="text-4xl font-display font-bold text-white mb-10">JGG TEAM</Text>
      
      <TouchableOpacity 
        className="w-full bg-primary py-4 rounded-xl items-center mb-4 active:opacity-80"
        onPress={() => setUserRole('coach')}
      >
        <Text className="text-white font-bold text-lg">Entrar como Entrenador</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="w-full bg-slate-800 py-4 rounded-xl items-center active:opacity-80"
        onPress={() => setUserRole('athlete')}
      >
        <Text className="text-white font-bold text-lg">Entrar como Atleta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// 2. Pantalla Temporal Entrenador
function CoachDashboard() {
  const logout = useAuthStore((state) => state.logout);
  
  return (
    <View className="flex-1 bg-background-light items-center justify-center p-6">
      <Text className="text-3xl font-bold text-slate-800 mb-6">Panel de Entrenador</Text>
      <TouchableOpacity 
        onPress={logout} 
        className="w-full bg-red-500 py-4 rounded-xl items-center active:opacity-80"
      >
        <Text className="text-white font-bold text-lg">Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// 3. Pantalla Temporal Atleta
function AthleteDashboard() {
  const logout = useAuthStore((state) => state.logout);
  
  return (
    <View className="flex-1 bg-background-dark items-center justify-center p-6">
      <Text className="text-3xl font-bold text-white mb-6">Panel de Atleta</Text>
      <TouchableOpacity 
        onPress={logout} 
        className="w-full bg-red-500 py-4 rounded-xl items-center active:opacity-80"
      >
        <Text className="text-white font-bold text-lg">Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// COMPONENTE PRINCIPAL
export default function App() {
  const userRole = useAuthStore((state) => state.userRole);

  return (
    <NavigationContainer>
      <StatusBar style={userRole === 'coach' ? "dark" : "light"} />
      
      {/* Sistema de Rutas Antibombas */}
      {!userRole ? (
        <LoginScreen />
      ) : userRole === 'coach' ? (
        <CoachDashboard />
      ) : (
        <AthleteDashboard />
      )}
      
    </NavigationContainer>
  );
}