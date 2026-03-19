import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function RoutineCreator() {
  const { session } = useAuthStore();
  
  const [routineName, setRoutineName] = useState('');
  // 1. AÑADIDO: 'rir' y 'notes' al estado inicial
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', rir: '', notes: '' }]);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', rir: '', notes: '' }]);
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert("Falta información", "Por favor, ponle un nombre a la rutina.");
      return;
    }
    if (!exercises[0].name.trim()) {
      Alert.alert("Falta información", "Añade al menos un ejercicio a la rutina.");
      return;
    }

    try {
      // 1. CREAR EL MESOCICLO
      const { data: mesoData, error: mesoError } = await supabase
        .from('mesocycles')
        .insert([{ 
          athlete_id: session?.user?.id, // ID temporal para pruebas
          name: `Mesociclo: ${routineName}`,
          is_active: true
        }])
        .select()
        .single();

      if (mesoError) throw mesoError;

      // 2. CREAR EL WORKOUT (Rutina)
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert([{ 
          mesocycle_id: mesoData.id,
          day_name: 'Día 1',
          focus: routineName,
          order: 1 // Tu nuevo campo funcionando perfectamente
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // 3. CREAR EJERCICIOS, PLANTILLA DE SERIES Y LOGS DE 4 SEMANAS
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        
        // A. Insertar el ejercicio
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .insert([{
            workout_id: workoutData.id,
            name: ex.name,
            order: i + 1,
            coach_notes: ex.notes || null // <--- 2. AÑADIDO: Guardamos las notas técnicas (si las hay)
          }])
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // B. Insertar las series "Plantilla" (exercise_sets)
        const numSets = parseInt(ex.sets) || 1;
        const setsToInsert = [];

        for (let setNum = 1; setNum <= numSets; setNum++) {
          setsToInsert.push({
            exercise_id: exerciseData.id,
            set_order: setNum,
            target_reps: ex.reps, 
            target_rir: ex.rir || null // <--- 3. AÑADIDO: Guardamos el RIR objetivo
          });
        }

        const { data: insertedSets, error: setsError } = await supabase
          .from('exercise_sets')
          .insert(setsToInsert)
          .select();

        if (setsError) throw setsError;

        // C. Generar las filas vacías para las 4 semanas en 'workout_logs'
        const logsToInsert = [];
        
        for (const set of insertedSets) {
          for (let week = 1; week <= 4; week++) {
            logsToInsert.push({
              set_id: set.id,
              week_number: week,
              actual_weight: null,
              actual_reps: null
            });
          }
        }

        const { error: logsError } = await supabase
          .from('workout_logs')
          .insert(logsToInsert);

        if (logsError) throw logsError;
      }

      Alert.alert("¡Brutal!", "Rutina creada con RIR, notas y sus 4 semanas generadas.");
      
      setRoutineName('');
      setExercises([{ name: '', sets: '', reps: '', rir: '', notes: '' }]);

    } catch (error) {
      console.error("Error al guardar:", error.message);
      Alert.alert("Error en Supabase", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Crear Nueva Rutina</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Enfoque de la Rutina</Text>
          <TextInput
            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            placeholder="Ej: Push / Fuerza Pectoral"
            placeholderTextColor="#94a3b8"
            value={routineName}
            onChangeText={setRoutineName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ejercicios</Text>
          
          {exercises.map((exercise, index) => (
            <View key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-primary">Ejercicio {index + 1}</Text>
              </View>
              
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg mb-2 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Nombre del ejercicio"
                placeholderTextColor="#94a3b8"
                value={exercise.name}
                onChangeText={(text) => updateExercise(index, 'name', text)}
              />

              {/* AÑADIDO: Input para notas técnicas */}
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg mb-3 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                placeholder="Notas del Coach (opcional)"
                placeholderTextColor="#94a3b8"
                multiline
                value={exercise.notes}
                onChangeText={(text) => updateExercise(index, 'notes', text)}
              />
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="Series"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={exercise.sets}
                    onChangeText={(text) => updateExercise(index, 'sets', text)}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="Reps (ej: 10-12)"
                    placeholderTextColor="#94a3b8"
                    value={exercise.reps}
                    onChangeText={(text) => updateExercise(index, 'reps', text)}
                  />
                </View>
                {/* AÑADIDO: Input para RIR */}
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                    placeholder="RIR (ej: 1-2)"
                    placeholderTextColor="#94a3b8"
                    value={exercise.rir}
                    onChangeText={(text) => updateExercise(index, 'rir', text)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          onPress={addExercise}
          className="flex-row items-center justify-center p-3 mb-8 bg-primary/10 rounded-xl border border-primary/20"
        >
          <MaterialIcons name="add" size={20} color="#007fff" />
          <Text className="text-primary font-bold ml-2">Añadir otro ejercicio</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
        <TouchableOpacity 
          onPress={handleSaveRoutine}
          className="bg-primary p-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Guardar Rutina</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}