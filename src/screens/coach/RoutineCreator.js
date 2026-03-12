import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function RoutineCreator() {
  const { session } = useAuthStore();
  
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '' }]);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '' }]);
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
      // 1. CREAR EL MESOCICLO (Requisito de tu nueva estructura)
      const { data: mesoData, error: mesoError } = await supabase
        .from('mesocycles')
        .insert([{ 
          athlete_id: session?.user?.id,
          name: `Mesociclo base para: ${routineName}`,
        }])
        .select()
        .single();

      if (mesoError) throw mesoError;

      // 2. CREAR LA RUTINA (Vinculada al mesociclo anterior)
      const { data: routineData, error: routineError } = await supabase
        .from('workouts')
        .insert([{ 
          mesocycle_id: mesoData.id,
          id: routineName,
          day_name: 'Lunes', // Por defecto Lunes. Podrás añadir un selector luego.
          focus: routineName // Usamos el nombre como focus area temporalmente
        }])
        .select()
        .single();

      if (routineError) throw routineError;

      // 3. CREAR EJERCICIOS Y SERIES
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        
        // Insertar el ejercicio
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercices')
          .insert([{
            routine_id: routineData.id,
            name: ex.name,
            order_index: i + 1 // Para saber el orden (1, 2, 3...)
          }])
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Insertar las series
        const numSets = parseInt(ex.sets) || 1;
        const setsToInsert = [];

        for (let setNum = 1; setNum <= numSets; setNum++) {
          setsToInsert.push({
            exercise_id: exerciseData.id,
            set_number: setNum,
            target_reps: ex.reps // Guarda el rango tipo "10-12"
            // target_rir y rest_time se quedarán null por ahora hasta que añadas esos campos en el formulario
          });
        }

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(setsToInsert);

        if (setsError) throw setsError;
      }

      Alert.alert("¡De locos!", "La rutina, ejercicios y series se han guardado perfectamente.");
      
      setRoutineName('');
      setExercises([{ name: '', sets: '', reps: '' }]);

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
        {/* Nombre de la Rutina */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre de la Rutina / Foco</Text>
          <TextInput
            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            placeholder="Ej: Push Day / Pecho y Tríceps"
            placeholderTextColor="#94a3b8"
            value={routineName}
            onChangeText={setRoutineName}
          />
        </View>

        {/* Lista de Ejercicios */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ejercicios</Text>
          
          {exercises.map((exercise, index) => (
            <View key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-primary">Ejercicio {index + 1}</Text>
              </View>
              
              <TextInput
                className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg mb-3 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Nombre del ejercicio"
                placeholderTextColor="#94a3b8"
                value={exercise.name}
                onChangeText={(text) => updateExercise(index, 'name', text)}
              />
              
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Series (ej: 4)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={exercise.sets}
                    onChangeText={(text) => updateExercise(index, 'sets', text)}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Reps (ej: 10-12)"
                    placeholderTextColor="#94a3b8"
                    value={exercise.reps}
                    onChangeText={(text) => updateExercise(index, 'reps', text)}
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