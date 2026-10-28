import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUserRole = useAuthStore((state) => state.setUserRole);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Por favor, rellena tu email y contraseña.');
      return;
    }
    
    setLoading(true);
    
    // PASO 1: Hablar con el "Portero" (Supabase Auth)
    const { error: authError, data: authData } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert('Error de acceso', authError.message);
      setLoading(false);
      return;
    }

    // Si pasamos el portero, tenemos el UUID del usuario
    const userId = authData.user.id;

    // PASO 2: Hablar con el "Camarero" (Tu tabla 'users')
    const { data: profileData, error: profileError } = await supabase
      .from('users') // Busca en tu tabla creada
      .select('role') // Queremos saber su rol
      .eq('id', userId) // Donde el ID coincida con el UUID del portero
      .maybeSingle(); // 0 o 1 resultado sin error PGRST116

    setLoading(false);

    if (profileError || !profileData) {
      Alert.alert(
        'Perfil no encontrado', 
        'Has iniciado sesión, pero no tienes un perfil creado en la base de datos.'
      );
      // Por seguridad, si no tiene rol, le cerramos la sesión
      supabase.auth.signOut(); 
    } else {
      // PASO 3: ¡Éxito! Guardamos el rol en Zustand y la app navegará sola
      setUserRole(profileData.role); 
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark items-center justify-center p-6">
      <View className="w-full max-w-sm">
        <Text className="text-5xl font-display font-bold text-white mb-1 text-center">JGG</Text>
        <Text className="text-primary font-bold tracking-widest text-center mb-10 text-xl">TEAM</Text>
        
        {/* Formulario Real */}
        <View className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <Text className="text-white font-bold text-lg mb-4">Iniciar Sesión</Text>
          
          <TextInput
            className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl mb-4 border border-slate-700 focus:border-primary"
            placeholder="Correo electrónico"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl mb-6 border border-slate-700 focus:border-primary"
            placeholder="Contraseña"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity 
            className="w-full bg-primary py-4 rounded-xl items-center flex-row justify-center active:opacity-80"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botones temporales de desarrollo */}
        <View className="mt-10 pt-8 border-t border-slate-800">
          <Text className="text-slate-500 text-center text-[10px] font-bold tracking-wider mb-4">ACCESO RÁPIDO (DESARROLLO)</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              className="flex-1 bg-slate-800/50 py-3 rounded-lg items-center border border-slate-700"
              onPress={() => setUserRole('coach')}
            >
              <Text className="text-slate-300 font-medium text-sm">Vista Coach</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-slate-800/50 py-3 rounded-lg items-center border border-slate-700"
              onPress={() => setUserRole('athlete')}
            >
              <Text className="text-slate-300 font-medium text-sm">Vista Atleta</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}