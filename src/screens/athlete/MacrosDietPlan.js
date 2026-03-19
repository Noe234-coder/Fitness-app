import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function MacrosDietPlan() {
  const { session } = useAuthStore();
  const [diet, setDiet] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta automáticamente nada más abrir la pantalla
  useEffect(() => {
    fetchDietData();
  }, []);

  const fetchDietData = async () => {
    try {
      setLoading(true);
      
      // 1. Buscamos la dieta asignada a este atleta
      const { data: dietData, error: dietError } = await supabase
        .from('diets')
        .select('*')
        .eq('athlete_id', session?.user?.id)
        .single(); // Pedimos un único resultado (la dieta actual)

      if (dietError) {
        // Si el error es PGRST116 significa que simplemente no encontró resultados (no hay dieta asignada aún)
        if (dietError.code !== 'PGRST116') throw dietError;
      }

      if (dietData) {
        setDiet(dietData);
        
        // 2. Si hay dieta, buscamos sus comidas (meals) ordenadas por el número de comida
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('diet_id', dietData.id)
          .order('meal_order', { ascending: true });

        if (mealsError) throw mealsError;
        setMeals(mealsData || []);
      }
    } catch (error) {
      console.error("Error al cargar la dieta:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga mientras trae los datos de Supabase
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando tu plan nutricional...</Text>
      </SafeAreaView>
    );
  }

  // Si termina de cargar y no encuentra dieta, mostramos este estado vacío
  if (!diet) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark p-6">
        <MaterialIcons name="restaurant-menu" size={64} color="#cbd5e1" />
        <Text className="text-xl font-bold text-slate-800 dark:text-white mt-4 text-center">Sin plan activo</Text>
        <Text className="text-slate-500 text-center mt-2">Tu entrenador aún no te ha asignado un plan nutricional. ¡Mucha paciencia!</Text>
      </SafeAreaView>
    );
  }

  // Si encuentra la dieta, pintamos la interfaz premium
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Tu Dieta: {diet.phase}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* CABECERA: Totales del día */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <Text className="text-center text-slate-400 dark:text-slate-400 font-bold mb-4 tracking-wider text-xs">OBJETIVOS DIARIOS</Text>
          
          <View className="flex-row justify-center items-end mb-6">
            <Text className="text-6xl font-black text-slate-900 dark:text-white">{diet.total_kcal}</Text>
            <Text className="text-lg text-slate-400 font-bold mb-2 ml-1">kcal</Text>
          </View>

          <View className="flex-row justify-between border-t border-slate-100 dark:border-slate-700 pt-5 px-2">
            <View className="items-center">
              <Text className="text-xs text-slate-400 font-bold mb-1 tracking-wider">PROTEÍNA</Text>
              <Text className="text-xl font-black text-primary">{diet.total_proteins}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-slate-400 font-bold mb-1 tracking-wider">CARBOS</Text>
              <Text className="text-xl font-black text-[#f59e0b]">{diet.total_carbs}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-slate-400 font-bold mb-1 tracking-wider">GRASAS</Text>
              <Text className="text-xl font-black text-[#ef4444]">{diet.total_fats}g</Text>
            </View>
          </View>
        </View>

        {/* LISTA: Desglose por Comidas */}
        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 ml-1 tracking-wider">DESGLOSE POR COMIDAS</Text>
        
        {meals.map((meal) => (
          <View key={meal.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 shadow-sm flex-row items-center">
            {/* Círculo con el número */}
            <View className="bg-primary/10 dark:bg-primary/20 h-12 w-12 rounded-full items-center justify-center mr-4">
              <Text className="font-black text-primary text-lg">{meal.meal_order}</Text>
            </View>
            
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-bold text-slate-900 dark:text-white text-base">Comida {meal.meal_order}</Text>
                <Text className="font-black text-slate-700 dark:text-slate-300">{meal.target_kcal} kcal</Text>
              </View>
              
              <View className="flex-row gap-4 mt-1">
                <Text className="text-xs text-slate-400 font-medium">P: <Text className="font-bold text-slate-700 dark:text-slate-200">{meal.target_protein}g</Text></Text>
                <Text className="text-xs text-slate-400 font-medium">CH: <Text className="font-bold text-slate-700 dark:text-slate-200">{meal.target_carbs}g</Text></Text>
                <Text className="text-xs text-slate-400 font-medium">G: <Text className="font-bold text-slate-700 dark:text-slate-200">{meal.target_fats}g</Text></Text>
              </View>
            </View>
          </View>
        ))}
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}