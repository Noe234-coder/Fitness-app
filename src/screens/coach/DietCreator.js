import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function DietCreator() {
  const { session } = useAuthStore();
  
  // 1. Estado para los totales del día
  const [phase, setPhase] = useState('');
  const [totals, setTotals] = useState({ kcal: '', protein: '', carbs: '', fats: '' });

  // 2. Estado para la lista dinámica de comidas (empezamos con 1 vacía)
  const [meals, setMeals] = useState([
    { target_kcal: '', target_protein: '', target_carbs: '', target_fats: '' }
  ]);

  const addMeal = () => {
    setMeals([...meals, { target_kcal: '', target_protein: '', target_carbs: '', target_fats: '' }]);
  };

  const updateMeal = (index, field, value) => {
    const newMeals = [...meals];
    newMeals[index][field] = value;
    setMeals(newMeals);
  };

  const updateTotals = (field, value) => {
    setTotals({ ...totals, [field]: value });
  };

  const handleSaveDiet = async () => {
    if (!phase.trim()) {
      Alert.alert("Falta información", "Por favor, indica la fase o nombre de la dieta.");
      return;
    }

    try {
      // A. CREAR LA DIETA (Cabecera)
      const { data: dietData, error: dietError } = await supabase
        .from('diets')
        .insert([{ 
          athlete_id: session?.user?.id, // ID temporal para pruebas, luego será el del atleta
          phase: phase,
          total_kcal: parseInt(totals.kcal) || 0,
          total_proteins: parseInt(totals.protein) || 0,
          total_carbs: parseInt(totals.carbs) || 0,
          total_fats: parseInt(totals.fats) || 0
        }])
        .select()
        .single();

      if (dietError) throw dietError;

      // B. CREAR LAS COMIDAS (Meals)
      const mealsToInsert = meals.map((meal, index) => ({
        diet_id: dietData.id,
        meal_order: index + 1,
        target_kcal: parseInt(meal.target_kcal) || 0,
        target_protein: parseInt(meal.target_protein) || 0,
        target_carbs: parseInt(meal.target_carbs) || 0,
        target_fats: parseInt(meal.target_fats) || 0
      }));

      const { error: mealsError } = await supabase
        .from('meals')
        .insert(mealsToInsert);

      if (mealsError) throw mealsError;

      Alert.alert("¡Menú servido!", "La dieta y sus comidas se han guardado a la perfección.");
      
      // Limpiar formulario
      setPhase('');
      setTotals({ kcal: '', protein: '', carbs: '', fats: '' });
      setMeals([{ target_kcal: '', target_protein: '', target_carbs: '', target_fats: '' }]);

    } catch (error) {
      console.error("Error al guardar dieta:", error.message);
      Alert.alert("Error en Supabase", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Crear Plan Nutricional</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* SECCIÓN 1: Totales del Día */}
        <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-6 border border-slate-200 dark:border-slate-700">
          <Text className="font-bold text-primary mb-4 text-lg">Objetivos Diarios</Text>
          
          <TextInput
            className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-3 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
            placeholder="Fase (ej: Volumen Limpio)"
            placeholderTextColor="#94a3b8"
            value={phase}
            onChangeText={setPhase}
          />

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1 ml-1">Kcal Totales</Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                placeholder="ej: 3241"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={totals.kcal}
                onChangeText={(val) => updateTotals('kcal', val)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1 ml-1">Proteína (g)</Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                placeholder="ej: 158"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={totals.protein}
                onChangeText={(val) => updateTotals('protein', val)}
              />
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1 ml-1">Hidratos (g)</Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                placeholder="ej: 590"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={totals.carbs}
                onChangeText={(val) => updateTotals('carbs', val)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1 ml-1">Grasas (g)</Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                placeholder="ej: 73"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={totals.fats}
                onChangeText={(val) => updateTotals('fats', val)}
              />
            </View>
          </View>
        </View>

        {/* SECCIÓN 2: Desglose por Comidas */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Distribución de Comidas</Text>
          
          {meals.map((meal, index) => (
            <View key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-slate-700 dark:text-slate-300">Comida {index + 1}</Text>
              </View>
              
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="Kcal (ej: 743)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={meal.target_kcal}
                    onChangeText={(text) => updateMeal(index, 'target_kcal', text)}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="Prot (ej: 36)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={meal.target_protein}
                    onChangeText={(text) => updateMeal(index, 'target_protein', text)}
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="HC (ej: 100)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={meal.target_carbs}
                    onChangeText={(text) => updateMeal(index, 'target_carbs', text)}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="Grasas (ej: 22)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={meal.target_fats}
                    onChangeText={(text) => updateMeal(index, 'target_fats', text)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          onPress={addMeal}
          className="flex-row items-center justify-center p-3 mb-8 bg-primary/10 rounded-xl border border-primary/20"
        >
          <MaterialIcons name="add" size={20} color="#007fff" />
          <Text className="text-primary font-bold ml-2">Añadir otra comida</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
        <TouchableOpacity 
          onPress={handleSaveDiet}
          className="bg-primary p-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Guardar Dieta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}