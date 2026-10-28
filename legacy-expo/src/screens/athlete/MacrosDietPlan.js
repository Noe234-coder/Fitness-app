import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useDiet } from '../../hooks/useDiet';

export default function MacrosDietPlan() {
  const { session } = useAuthStore();
  const { fetchDietWithOptions } = useDiet();

  const [diet, setDiet] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track selected option per meal: { [mealIdx]: optionIdx }
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    loadDiet();
  }, []);

  const loadDiet = async () => {
    try {
      setLoading(true);
      const { diet: d, meals: m } = await fetchDietWithOptions(session?.user?.id);
      setDiet(d);
      setMeals(m);
      // Default to first option for each meal
      const defaults = {};
      m.forEach((_, idx) => { defaults[idx] = 0; });
      setSelectedOptions(defaults);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar tu plan nutricional.');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = useCallback((mealIdx, optIdx) => {
    setSelectedOptions((prev) => ({ ...prev, [mealIdx]: optIdx }));
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando tu plan nutricional...</Text>
      </SafeAreaView>
    );
  }

  if (!diet) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark p-6">
        <MaterialIcons name="restaurant-menu" size={64} color="#cbd5e1" />
        <Text className="text-xl font-bold text-slate-800 dark:text-white mt-4 text-center">
          Sin plan activo
        </Text>
        <Text className="text-slate-500 text-center mt-2">
          Tu entrenador aún no te ha asignado un plan nutricional. ¡Mucha paciencia!
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          Tu Dieta: {diet.phase}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* ── Macro Summary Card ── */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <Text className="text-center text-slate-400 font-bold mb-4 tracking-wider text-xs">
            OBJETIVOS DIARIOS
          </Text>

          <View className="flex-row justify-center items-end mb-6">
            <Text className="text-6xl font-black text-slate-900 dark:text-white">
              {diet.total_kcal}
            </Text>
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

        {/* ── Meals List ── */}
        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 ml-1 tracking-wider">
          DESGLOSE POR COMIDAS
        </Text>

        {meals.map((meal, mealIdx) => {
          const options = meal.meal_options || [];
          const currentOptIdx = selectedOptions[mealIdx] || 0;
          const currentOption = options[currentOptIdx];

          return (
            <View
              key={meal.id}
              className="bg-white dark:bg-slate-800 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              {/* Meal header */}
              <View className="p-4 flex-row items-center">
                <View className="bg-primary/10 dark:bg-primary/20 h-12 w-12 rounded-full items-center justify-center mr-4">
                  <Text className="font-black text-primary text-lg">{meal.meal_order}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-slate-900 dark:text-white text-base">
                      Comida {meal.meal_order}
                    </Text>
                    <Text className="font-black text-slate-700 dark:text-slate-300">
                      {meal.target_kcal} kcal
                    </Text>
                  </View>
                  <View className="flex-row gap-4 mt-1">
                    <Text className="text-xs text-slate-400 font-medium">
                      P:{' '}
                      <Text className="font-bold text-slate-700 dark:text-slate-200">
                        {meal.target_protein}g
                      </Text>
                    </Text>
                    <Text className="text-xs text-slate-400 font-medium">
                      CH:{' '}
                      <Text className="font-bold text-slate-700 dark:text-slate-200">
                        {meal.target_carbs}g
                      </Text>
                    </Text>
                    <Text className="text-xs text-slate-400 font-medium">
                      G:{' '}
                      <Text className="font-bold text-slate-700 dark:text-slate-200">
                        {meal.target_fats}g
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Option tabs (only if there are options) */}
              {options.length > 0 && (
                <>
                  {options.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="border-t border-slate-100 dark:border-slate-700 px-3 pt-3"
                      contentContainerStyle={{ gap: 6 }}
                    >
                      {options.map((opt, optIdx) => (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => selectOption(mealIdx, optIdx)}
                          className={`px-4 py-2 rounded-xl ${
                            optIdx === currentOptIdx
                              ? 'bg-blue-600'
                              : 'bg-slate-100 dark:bg-slate-700'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              optIdx === currentOptIdx
                                ? 'text-white'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  {/* Food items of selected option */}
                  {currentOption && (
                    <View className="px-4 pt-3 pb-4">
                      {(currentOption.meal_option_items || []).map((item, idx) => {
                        const isLast =
                          idx === (currentOption.meal_option_items || []).length - 1;
                        return (
                          <View
                            key={item.id}
                            className={`flex-row items-center justify-between py-3 ${
                              !isLast
                                ? 'border-b border-slate-100 dark:border-slate-700'
                                : ''
                            }`}
                          >
                            <Text className="text-slate-700 dark:text-slate-300 text-sm flex-1">
                              {item.food_name}
                            </Text>
                            <Text className="text-slate-500 font-medium text-sm">
                              {item.quantity}
                              {item.unit}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
