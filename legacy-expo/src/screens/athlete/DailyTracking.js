import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useWeeklyForms, weeklyComplianceOptions } from '../../hooks/useWeeklyForms';

export default function DailyTracking() {
  const { session } = useAuthStore();
  const { getCurrentWeekMetadata, fetchActiveDiet, fetchCurrentWeekForm, saveWeeklyForm } = useWeeklyForms();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDiet, setActiveDiet] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);
  const [weekData, setWeekData] = useState(() => getCurrentWeekMetadata());
  const [selectedCompliance, setSelectedCompliance] = useState(100);
  const [hungerScore, setHungerScore] = useState(3);
  const [energyScore, setEnergyScore] = useState(3);
  const [digestionScore, setDigestionScore] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadWeeklyTracking();
  }, [session?.user?.id]);

  const loadWeeklyTracking = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentWeek = getCurrentWeekMetadata();
      setWeekData(currentWeek);

      const [dietData, formData] = await Promise.all([
        fetchActiveDiet(session.user.id),
        fetchCurrentWeekForm(session.user.id, currentWeek.isoYear, currentWeek.isoWeek),
      ]);

      setActiveDiet(dietData);
      setCurrentForm(formData);

      if (formData) {
        setSelectedCompliance(formData.diet_compliance_score || 100);
        setHungerScore(formData.hunger_score || 3);
        setEnergyScore(formData.energy_score || 3);
        setDigestionScore(formData.digestion_score || 3);
        setNotes(formData.notes || '');
      }
    } catch (error) {
      console.error('Error al cargar el check-in semanal:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWeeklyForm = async () => {
    if (!session?.user?.id) {
      Alert.alert('Sesion no valida', 'No hemos podido identificar al atleta.');
      return;
    }

    if (!activeDiet) {
      Alert.alert('Sin dieta activa', 'Necesitas una dieta asignada para enviar el cumplimiento semanal.');
      return;
    }

    try {
      setSaving(true);

      const savedForm = await saveWeeklyForm({
        athleteId: session.user.id,
        dietId: activeDiet.id,
        isoYear: weekData.isoYear,
        isoWeek: weekData.isoWeek,
        weekStartDate: weekData.weekStartDateString,
        dietComplianceScore: selectedCompliance,
        hungerScore,
        energyScore,
        digestionScore,
        notes,
      });

      setCurrentForm(savedForm);
      Alert.alert('Check-in guardado', 'Tu cumplimiento semanal se ha registrado correctamente.');
    } catch (error) {
      console.error('Error al guardar el check-in semanal:', error.message);
      Alert.alert('Error en Supabase', error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderScoreSelector = (label, value, onChange, iconName) => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <MaterialIcons name={iconName} size={18} color="#007fff" />
          <Text className="ml-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</Text>
        </View>
        <Text className="text-primary font-bold text-lg">{value}/5</Text>
      </View>

      <View className="flex-row justify-between gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <TouchableOpacity
            key={score}
            onPress={() => onChange(score)}
            className={`flex-1 py-3 rounded-xl border items-center ${value === score ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
          >
            <Text className={`font-bold ${value === score ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{score}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando tu check-in semanal...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="bg-background-light/80 dark:bg-background-dark/80 px-4 pt-4 pb-4 border-b border-slate-200 dark:border-slate-800 w-full">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Weekly Compliance</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{weekData.label}</Text>
          </View>

          <View className={`px-3 py-1 rounded-full ${currentForm ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            <Text className={`text-xs font-bold uppercase tracking-wider ${currentForm ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentForm ? 'Enviado' : 'Pendiente'}
            </Text>
          </View>
        </View>

        <Text className="text-xs text-slate-500 dark:text-slate-400">
          {activeDiet ? `Plan activo: ${activeDiet.phase}` : 'Todavia no tienes una dieta activa asignada.'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4 w-full" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xs font-bold tracking-wider text-slate-400 uppercase">Resumen semanal</Text>
              <Text className="text-lg font-bold text-slate-900 dark:text-white mt-1">Cumplimiento de la dieta</Text>
            </View>
            <View className="bg-primary/10 px-3 py-2 rounded-2xl">
              <Text className="text-primary font-black text-lg">{selectedCompliance}%</Text>
            </View>
          </View>

          <View className="gap-3">
            {weeklyComplianceOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedCompliance(option.value)}
                className={`p-4 rounded-2xl border ${selectedCompliance === option.value ? 'bg-primary border-primary' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 pr-4">
                    <Text className={`font-black text-base ${selectedCompliance === option.value ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{option.label}</Text>
                    <Text className={`text-sm mt-1 ${selectedCompliance === option.value ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{option.description}</Text>
                  </View>
                  <MaterialIcons name={selectedCompliance === option.value ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={selectedCompliance === option.value ? '#ffffff' : '#94a3b8'} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderScoreSelector('Hambre', hungerScore, setHungerScore, 'restaurant')}
        {renderScoreSelector('Energia', energyScore, setEnergyScore, 'bolt')}
        {renderScoreSelector('Digestion', digestionScore, setDigestionScore, 'favorite-border')}

        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="edit-note" size={20} color="#007fff" />
            <Text className="ml-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Notas de la semana</Text>
          </View>
          <TextInput
            multiline
            numberOfLines={5}
            value={notes}
            onChangeText={setNotes}
            className="w-full bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 text-slate-900 dark:text-slate-100 text-left align-top"
            placeholder="Cuenta si hubo eventos sociales, hambre alta, problemas digestivos o cualquier detalle que le de contexto al coach."
            placeholderTextColor="#94a3b8"
          />
        </View>

        {currentForm?.submitted_at && (
          <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <MaterialIcons name="check-circle" size={18} color="#059669" />
              <Text className="ml-2 text-emerald-700 font-semibold">Ya existe un check-in para esta semana.</Text>
            </View>
            <Text className="text-emerald-700/80 text-sm mt-2">Puedes actualizarlo tantas veces como necesites antes de cerrar la semana.</Text>
          </View>
        )}

        <TouchableOpacity
          disabled={saving || !activeDiet}
          onPress={handleSaveWeeklyForm}
          className={`w-full py-5 rounded-xl shadow-lg flex-row items-center justify-center gap-3 mb-6 ${saving || !activeDiet ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary'}`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <MaterialIcons name="task-alt" size={20} color="white" />
          )}
          <Text className="text-white font-extrabold text-base">
            {saving ? 'GUARDANDO...' : currentForm ? 'ACTUALIZAR CHECK-IN SEMANAL' : 'GUARDAR CHECK-IN SEMANAL'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
