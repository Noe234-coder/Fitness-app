import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../../store/useAuthStore';
import { useTraining } from '../../hooks/useTraining';

const CIRCUMFERENCE = 125.6; // 2 * PI * 20

export default function AthleteDashboard() {
  const { session } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { fetchActiveMesocycle, fetchWorkouts, fetchWorkoutDetail, saveSetLog } = useTraining();

  const [loading, setLoading] = useState(true);
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [mesocycle, setMesocycle] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkoutIdx, setSelectedWorkoutIdx] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [exercises, setExercises] = useState([]);
  const [logInputs, setLogInputs] = useState({});
  const [savingSetId, setSavingSetId] = useState(null);

  useEffect(() => {
    loadMesocycle();
  }, [session?.user?.id]);

  useEffect(() => {
    const workout = workouts[selectedWorkoutIdx];
    if (workout) {
      loadWorkoutDetail(workout.id, selectedWeek);
    }
  }, [selectedWorkoutIdx, selectedWeek, workouts]);

  const loadMesocycle = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const meso = await fetchActiveMesocycle(session.user.id);
      setMesocycle(meso);
      if (meso) {
        const wList = await fetchWorkouts(meso.id);
        setWorkouts(wList);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutDetail = async (workoutId, weekNumber) => {
    try {
      setLoadingWorkout(true);
      const detail = await fetchWorkoutDetail(workoutId, weekNumber);
      setExercises(detail);
      const inputs = {};
      detail.forEach((ex) => {
        ex.exercise_sets.forEach((set) => {
          inputs[set.id] = {
            weight: set.log?.actual_weight != null ? String(set.log.actual_weight) : '',
            reps: set.log?.actual_reps != null ? String(set.log.actual_reps) : '',
            logId: set.log?.id || null,
            saved: set.log?.actual_weight != null && set.log?.actual_reps != null,
          };
        });
      });
      setLogInputs(inputs);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingWorkout(false);
    }
  };

  const handleSaveSet = async (set) => {
    const input = logInputs[set.id];
    if (!input?.weight && !input?.reps) return;
    try {
      setSavingSetId(set.id);
      const savedLog = await saveSetLog({
        logId: input.logId,
        setId: set.id,
        weekNumber: selectedWeek,
        actualWeight: input.weight,
        actualReps: input.reps,
      });
      setLogInputs((prev) => ({
        ...prev,
        [set.id]: { ...prev[set.id], logId: savedLog.id, saved: true },
      }));
    } catch (error) {
      Alert.alert('Error al guardar', error.message);
    } finally {
      setSavingSetId(null);
    }
  };

  const updateInput = useCallback((setId, field, value) => {
    setLogInputs((prev) => ({
      ...prev,
      [setId]: { ...prev[setId], [field]: value, saved: false },
    }));
  }, []);

  const totalSets = Object.keys(logInputs).length;
  const completedSets = Object.values(logInputs).filter((i) => i.saved).length;
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const strokeOffset = CIRCUMFERENCE - (progressPct / 100) * CIRCUMFERENCE;
  const selectedWorkout = workouts[selectedWorkoutIdx];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando tu entrenamiento...</Text>
      </SafeAreaView>
    );
  }

  if (!mesocycle) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-900 p-6">
        <MaterialIcons name="fitness-center" size={64} color="#cbd5e1" />
        <Text className="text-xl font-bold text-slate-800 dark:text-white mt-4 text-center">
          Sin rutina activa
        </Text>
        <Text className="text-slate-500 text-center mt-2">
          Tu entrenador aún no te ha asignado ninguna rutina.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1 mr-4">
            <Text
              className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              numberOfLines={1}
            >
              {selectedWorkout?.focus || selectedWorkout?.day_name || 'Entrenamiento'}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {mesocycle.name} · Semana {selectedWeek}
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={toggleColorScheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <MaterialIcons
                name={colorScheme === 'dark' ? 'light-mode' : 'dark-mode'}
                size={22}
                color={colorScheme === 'dark' ? '#fbbf24' : '#64748b'}
              />
            </TouchableOpacity>
            {/* Progress ring */}
            <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
              >
                <Circle cx="24" cy="24" r="20" strokeWidth="4" fill="transparent" stroke="#e2e8f0" />
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  strokeWidth="4"
                  fill="transparent"
                  stroke="#007fff"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a' }}>{progressPct}%</Text>
            </View>
          </View>
        </View>

        {/* Week Selector */}
        <View className="flex-row mb-4" style={{ gap: 8 }}>
          {[1, 2, 3, 4].map((week) => (
            <TouchableOpacity
              key={week}
              onPress={() => setSelectedWeek(week)}
              className={`flex-1 items-center py-2 rounded-xl border ${
                selectedWeek === week
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedWeek === week ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Sem {week}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          style={{ height: 60 }}
          contentContainerStyle={{ gap: 8, alignItems: 'center' }}
        >
          {workouts.map((workout, index) => (
            <TouchableOpacity
              key={workout.id}
              onPress={() => setSelectedWorkoutIdx(index)}
              className={`items-center justify-center px-4 rounded-xl h-12 min-w-[80px] ${
                index === selectedWorkoutIdx
                  ? 'bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <Text
                className={`text-[10px] uppercase font-bold ${
                  index === selectedWorkoutIdx ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {workout.day_name || `Día ${index + 1}`}
              </Text>
              <Text
                className={`text-xs font-bold ${
                  index === selectedWorkoutIdx ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                }`}
                numberOfLines={1}
              >
                {workout.focus || '—'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise List */}
        {loadingWorkout ? (
          <ActivityIndicator size="large" color="#007fff" style={{ marginTop: 32 }} />
        ) : exercises.length === 0 ? (
          <View className="items-center justify-center mt-12">
            <MaterialIcons name="fitness-center" size={48} color="#cbd5e1" />
            <Text className="text-slate-500 dark:text-slate-400 mt-3 text-center">
              Sin ejercicios en este día
            </Text>
          </View>
        ) : (
          <View>
            {exercises.map((exercise) => (
              <View
                key={exercise.id}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4"
              >
                {/* Exercise Header */}
                <View className="p-4 border-b border-slate-200 dark:border-slate-700 flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                    <Text className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {exercise.name}
                    </Text>
                    <Text className="text-xs text-blue-500 font-medium mt-0.5">
                      {exercise.exercise_sets.length} series
                      {exercise.exercise_sets[0]?.target_reps
                        ? ` · ${exercise.exercise_sets[0].target_reps} reps`
                        : ''}
                      {exercise.exercise_sets[0]?.target_rir != null
                        ? ` · RIR ${exercise.exercise_sets[0].target_rir}`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      exercise.coach_notes
                        ? Alert.alert('Nota del coach', exercise.coach_notes)
                        : null
                    }
                    disabled={!exercise.coach_notes}
                  >
                    <MaterialIcons
                      name="info"
                      size={20}
                      color={exercise.coach_notes ? '#007fff' : '#94a3b8'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Set Rows */}
                <View className="p-4">
                  <View className="flex-row items-center mb-2">
                    <Text className="w-6 text-[10px] font-bold text-slate-400 text-center">#</Text>
                    <Text className="flex-1 text-[10px] font-bold text-slate-400 text-center ml-2">
                      PESO (kg)
                    </Text>
                    <Text className="flex-1 text-[10px] font-bold text-slate-400 text-center mx-2">
                      REPS
                    </Text>
                    <View style={{ width: 40 }} />
                  </View>

                  {exercise.exercise_sets.map((set, idx) => {
                    const input = logInputs[set.id] || { weight: '', reps: '', saved: false };
                    const isSaving = savingSetId === set.id;
                    const hasInput = input.weight !== '' || input.reps !== '';
                    const isLast = idx === exercise.exercise_sets.length - 1;

                    return (
                      <View
                        key={set.id}
                        className={`flex-row items-center${!isLast ? ' mb-3' : ''}`}
                      >
                        <Text className="w-6 text-xs font-bold text-slate-500 text-center">
                          {set.set_order}
                        </Text>
                        <TextInput
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 ml-2 text-center"
                          placeholder={
                            set.log?.actual_weight != null
                              ? String(set.log.actual_weight)
                              : '—'
                          }
                          placeholderTextColor="#94a3b8"
                          keyboardType="decimal-pad"
                          value={input.weight}
                          onChangeText={(val) => updateInput(set.id, 'weight', val)}
                          style={{ height: 40 }}
                        />
                        <TextInput
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 mx-2 text-center"
                          placeholder={
                            set.log?.actual_reps != null
                              ? String(set.log.actual_reps)
                              : set.target_reps
                              ? `${set.target_reps}`
                              : '—'
                          }
                          placeholderTextColor="#94a3b8"
                          keyboardType="number-pad"
                          value={input.reps}
                          onChangeText={(val) => updateInput(set.id, 'reps', val)}
                          style={{ height: 40 }}
                        />
                        <TouchableOpacity
                          onPress={() => handleSaveSet(set)}
                          disabled={isSaving || !hasInput}
                          style={{ width: 40, height: 40 }}
                          className={`rounded-lg items-center justify-center ${
                            input.saved
                              ? 'bg-emerald-500'
                              : hasInput
                              ? 'bg-blue-600'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {isSaving ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <MaterialIcons
                              name="check"
                              size={16}
                              color={input.saved || hasInput ? 'white' : '#94a3b8'}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Finish Button */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  '¡Sesión completada!',
                  `${completedSets}/${totalSets} series registradas en Semana ${selectedWeek}.`
                )
              }
              className="w-full py-4 bg-blue-600 rounded-xl items-center justify-center mt-2 mb-6"
            >
              <Text className="text-white font-bold text-base">
                Finalizar sesión · {completedSets}/{totalSets}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
