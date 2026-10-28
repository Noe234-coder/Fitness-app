import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

export default function RoutineCreator() {
  // --- ESTADO PARA LOS ATLETAS ---
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  // Estados de la rutina
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', rir: '', notes: '' }]);

  // Cargar los atletas al entrar
  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('role', ['athlete', 'atleta'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error("Error al cargar atletas:", error.message);
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', rir: '', notes: '' }]);
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSaveRoutine = async () => {
    // VALIDACIÓN: Comprobar que hay un atleta seleccionado
    if (!selectedAthlete) {
      Alert.alert("Falta información", "Por favor, selecciona a un atleta de la lista superior.");
      return;
    }
    if (!routineName.trim()) {
      Alert.alert("Falta información", "Por favor, ponle un nombre a la rutina.");
      return;
    }
    if (!exercises[0].name.trim()) {
      Alert.alert("Falta información", "Añade al menos un ejercicio a la rutina.");
      return;
    }

    try {
      // 1. CREAR EL MESOCICLO (Asignado al atleta seleccionado)
      const { data: mesoData, error: mesoError } = await supabase
        .from('mesocycles')
        .insert([{ 
          athlete_id: selectedAthlete.id, // <--- MAGIA APLICADA AQUÍ
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
          order: 1
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // 3. CREAR EJERCICIOS, PLANTILLA DE SERIES Y LOGS DE 4 SEMANAS
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .insert([{
            workout_id: workoutData.id,
            name: ex.name,
            order: i + 1,
            coach_notes: ex.notes || null
          }])
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        const numSets = parseInt(ex.sets) || 1;
        const setsToInsert = [];

        for (let setNum = 1; setNum <= numSets; setNum++) {
          setsToInsert.push({
            exercise_id: exerciseData.id,
            set_order: setNum,
            target_reps: ex.reps, 
            target_rir: ex.rir || null
          });
        }

        const { data: insertedSets, error: setsError } = await supabase
          .from('exercise_sets')
          .insert(setsToInsert)
          .select();

        if (setsError) throw setsError;

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

      Alert.alert("¡Brutal!", `Rutina creada y asignada a ${selectedAthlete.full_name}.`);
      
      // Limpiar formulario
      setSelectedAthlete(null);
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
        
        {/* --- SECCIÓN: SELECTOR DE ATLETAS --- */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">¿Para quién es esta rutina?</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {athletes.map((athlete) => (
              <TouchableOpacity
                key={athlete.id}
                onPress={() => setSelectedAthlete(athlete)}
                className={`mr-3 p-3 rounded-2xl border flex-row items-center ${
                  selectedAthlete?.id === athlete.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  selectedAthlete?.id === athlete.id ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  <Text className={`font-black text-lg ${
                    selectedAthlete?.id === athlete.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {athlete.full_name ? athlete.full_name.charAt(0).toUpperCase() : 'A'}
                  </Text>
                </View>
                
                <View className="pr-2">
                  <Text className={`font-bold text-base ${
                    selectedAthlete?.id === athlete.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {athlete.full_name || 'Sin Nombre'}
                  </Text>
                  <Text className="text-xs text-slate-500">Atleta</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {athletes.length === 0 && (
              <Text className="text-slate-500 italic mt-2">No hay atletas registrados en la base de datos.</Text>
            )}
          </ScrollView>
        </View>
        {/* ------------------------------------------ */}

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