import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDiet } from '../../hooks/useDiet';

const EMPTY_ITEM = { food_name: '', quantity: '', unit: 'g' };

const makeEmptyOption = (order) => ({
  option_order: order,
  label: `Opción ${order}`,
  items: [{ ...EMPTY_ITEM }],
});

const makeEmptyMeal = () => ({
  target_kcal: '',
  target_protein: '',
  target_carbs: '',
  target_fats: '',
  options: [makeEmptyOption(1)],
});

export default function DietCreator() {
  const { saveDietWithOptions, fetchAthletes } = useDiet();

  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [phase, setPhase] = useState('');
  const [totals, setTotals] = useState({ kcal: '', protein: '', carbs: '', fats: '' });
  const [meals, setMeals] = useState([makeEmptyMeal()]);
  const [saving, setSaving] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(0);

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      const data = await fetchAthletes();
      setAthletes(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const updateTotals = useCallback((field, value) => {
    setTotals((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateMealMacro = useCallback((mealIdx, field, value) => {
    setMeals((prev) => {
      const copy = [...prev];
      copy[mealIdx] = { ...copy[mealIdx], [field]: value };
      return copy;
    });
  }, []);

  const addMeal = useCallback(() => {
    setMeals((prev) => [...prev, makeEmptyMeal()]);
    setExpandedMeal(meals.length);
  }, [meals.length]);

  const removeMeal = useCallback((mealIdx) => {
    setMeals((prev) => prev.filter((_, i) => i !== mealIdx));
    setExpandedMeal((prev) => (prev >= mealIdx ? Math.max(0, prev - 1) : prev));
  }, []);

  const addOption = useCallback((mealIdx) => {
    setMeals((prev) => {
      const copy = [...prev];
      const meal = { ...copy[mealIdx] };
      if (meal.options.length >= 5) {
        Alert.alert('Límite', 'Máximo 5 opciones por comida.');
        return prev;
      }
      meal.options = [...meal.options, makeEmptyOption(meal.options.length + 1)];
      copy[mealIdx] = meal;
      return copy;
    });
  }, []);

  const removeOption = useCallback((mealIdx, optIdx) => {
    setMeals((prev) => {
      const copy = [...prev];
      const meal = { ...copy[mealIdx] };
      meal.options = meal.options
        .filter((_, i) => i !== optIdx)
        .map((opt, i) => ({ ...opt, option_order: i + 1, label: `Opción ${i + 1}` }));
      copy[mealIdx] = meal;
      return copy;
    });
  }, []);

  const addItem = useCallback((mealIdx, optIdx) => {
    setMeals((prev) => {
      const copy = [...prev];
      const meal = { ...copy[mealIdx] };
      const opts = [...meal.options];
      opts[optIdx] = { ...opts[optIdx], items: [...opts[optIdx].items, { ...EMPTY_ITEM }] };
      meal.options = opts;
      copy[mealIdx] = meal;
      return copy;
    });
  }, []);

  const removeItem = useCallback((mealIdx, optIdx, itemIdx) => {
    setMeals((prev) => {
      const copy = [...prev];
      const meal = { ...copy[mealIdx] };
      const opts = [...meal.options];
      opts[optIdx] = {
        ...opts[optIdx],
        items: opts[optIdx].items.filter((_, i) => i !== itemIdx),
      };
      meal.options = opts;
      copy[mealIdx] = meal;
      return copy;
    });
  }, []);

  const updateItem = useCallback((mealIdx, optIdx, itemIdx, field, value) => {
    setMeals((prev) => {
      const copy = [...prev];
      const meal = { ...copy[mealIdx] };
      const opts = [...meal.options];
      const items = [...opts[optIdx].items];
      items[itemIdx] = { ...items[itemIdx], [field]: value };
      opts[optIdx] = { ...opts[optIdx], items };
      meal.options = opts;
      copy[mealIdx] = meal;
      return copy;
    });
  }, []);

  const handleSave = async () => {
    if (!selectedAthlete) {
      Alert.alert('Falta información', 'Selecciona a un atleta.');
      return;
    }
    if (!phase.trim()) {
      Alert.alert('Falta información', 'Indica la fase o nombre de la dieta.');
      return;
    }

    try {
      setSaving(true);
      await saveDietWithOptions({
        athleteId: selectedAthlete.id,
        phase,
        totals,
        meals,
      });
      Alert.alert(
        '¡Dieta asignada!',
        `Plan nutricional guardado para ${selectedAthlete.full_name}.`
      );
      // Reset
      setSelectedAthlete(null);
      setPhase('');
      setTotals({ kcal: '', protein: '', carbs: '', fats: '' });
      setMeals([makeEmptyMeal()]);
      setExpandedMeal(0);
    } catch (error) {
      Alert.alert('Error al guardar', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          Crear Plan Nutricional
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* ── Selector de Atletas ── */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            ¿Para quién es este plan?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    selectedAthlete?.id === athlete.id
                      ? 'bg-primary'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  <Text
                    className={`font-black text-lg ${
                      selectedAthlete?.id === athlete.id
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {athlete.full_name ? athlete.full_name.charAt(0).toUpperCase() : 'A'}
                  </Text>
                </View>
                <View className="pr-2">
                  <Text
                    className={`font-bold text-base ${
                      selectedAthlete?.id === athlete.id
                        ? 'text-primary'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {athlete.full_name || 'Sin Nombre'}
                  </Text>
                  <Text className="text-xs text-slate-500">Atleta</Text>
                </View>
              </TouchableOpacity>
            ))}
            {athletes.length === 0 && (
              <Text className="text-slate-500 italic mt-2">
                No hay atletas registrados.
              </Text>
            )}
          </ScrollView>
        </View>

        {/* ── Objetivos Diarios ── */}
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
                placeholder="3241"
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
                placeholder="158"
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
                placeholder="590"
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
                placeholder="73"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={totals.fats}
                onChangeText={(val) => updateTotals('fats', val)}
              />
            </View>
          </View>
        </View>

        {/* ── Comidas con Opciones ── */}
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Distribución de Comidas
        </Text>

        {meals.map((meal, mealIdx) => {
          const isExpanded = expandedMeal === mealIdx;

          return (
            <View
              key={mealIdx}
              className="bg-white dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Meal Header */}
              <TouchableOpacity
                onPress={() => setExpandedMeal(isExpanded ? -1 : mealIdx)}
                className="flex-row justify-between items-center p-4"
              >
                <View className="flex-row items-center">
                  <View className="bg-primary/10 dark:bg-primary/20 h-8 w-8 rounded-full items-center justify-center mr-3">
                    <Text className="font-black text-primary text-sm">{mealIdx + 1}</Text>
                  </View>
                  <View>
                    <Text className="font-bold text-slate-700 dark:text-slate-200">
                      Comida {mealIdx + 1}
                    </Text>
                    {meal.target_kcal ? (
                      <Text className="text-xs text-slate-400">
                        {meal.target_kcal} kcal · {meal.options.length} opción(es)
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  {meals.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeMeal(mealIdx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#94a3b8"
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="px-4 pb-4">
                  {/* Macro targets */}
                  <View className="flex-row gap-2 mb-2">
                    <View className="flex-1">
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center text-sm"
                        placeholder="Kcal"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={meal.target_kcal}
                        onChangeText={(val) => updateMealMacro(mealIdx, 'target_kcal', val)}
                      />
                    </View>
                    <View className="flex-1">
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center text-sm"
                        placeholder="Prot"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={meal.target_protein}
                        onChangeText={(val) => updateMealMacro(mealIdx, 'target_protein', val)}
                      />
                    </View>
                    <View className="flex-1">
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center text-sm"
                        placeholder="HC"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={meal.target_carbs}
                        onChangeText={(val) => updateMealMacro(mealIdx, 'target_carbs', val)}
                      />
                    </View>
                    <View className="flex-1">
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center text-sm"
                        placeholder="Grasas"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={meal.target_fats}
                        onChangeText={(val) => updateMealMacro(mealIdx, 'target_fats', val)}
                      />
                    </View>
                  </View>

                  {/* Options */}
                  {meal.options.map((option, optIdx) => (
                    <View
                      key={optIdx}
                      className="mt-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-sm text-blue-600 dark:text-blue-400">
                          {option.label}
                        </Text>
                        {meal.options.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeOption(mealIdx, optIdx)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <MaterialIcons name="close" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Food items */}
                      {option.items.map((item, itemIdx) => (
                        <View key={itemIdx} className="flex-row items-center mb-2" style={{ gap: 6 }}>
                          <TextInput
                            className="flex-[3] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                            placeholder="Alimento"
                            placeholderTextColor="#94a3b8"
                            value={item.food_name}
                            onChangeText={(val) =>
                              updateItem(mealIdx, optIdx, itemIdx, 'food_name', val)
                            }
                          />
                          <TextInput
                            className="flex-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center text-sm"
                            placeholder="Cant"
                            placeholderTextColor="#94a3b8"
                            keyboardType="decimal-pad"
                            value={item.quantity}
                            onChangeText={(val) =>
                              updateItem(mealIdx, optIdx, itemIdx, 'quantity', val)
                            }
                          />
                          <TextInput
                            className="w-12 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center text-sm"
                            placeholder="g"
                            placeholderTextColor="#94a3b8"
                            value={item.unit}
                            onChangeText={(val) =>
                              updateItem(mealIdx, optIdx, itemIdx, 'unit', val)
                            }
                          />
                          {option.items.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeItem(mealIdx, optIdx, itemIdx)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <MaterialIcons name="remove-circle-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}

                      <TouchableOpacity
                        onPress={() => addItem(mealIdx, optIdx)}
                        className="flex-row items-center justify-center py-2 mt-1"
                      >
                        <MaterialIcons name="add" size={16} color="#007fff" />
                        <Text className="text-primary text-xs font-bold ml-1">Añadir alimento</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add option button */}
                  {meal.options.length < 5 && (
                    <TouchableOpacity
                      onPress={() => addOption(mealIdx)}
                      className="flex-row items-center justify-center py-3 mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                    >
                      <MaterialIcons name="add-circle-outline" size={18} color="#007fff" />
                      <Text className="text-primary font-bold text-sm ml-2">
                        Añadir opción ({meal.options.length}/5)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          onPress={addMeal}
          className="flex-row items-center justify-center p-3 mb-8 bg-primary/10 rounded-xl border border-primary/20"
        >
          <MaterialIcons name="add" size={20} color="#007fff" />
          <Text className="text-primary font-bold ml-2">Añadir otra comida</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View className="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`p-4 rounded-xl items-center ${saving ? 'bg-slate-400' : 'bg-primary'}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Guardar Dieta</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
