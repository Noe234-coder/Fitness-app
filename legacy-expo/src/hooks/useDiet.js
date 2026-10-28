import { supabase } from '../services/supabase';

// ─── Coach: guardar dieta completa (dieta + comidas + opciones + alimentos) ───

const saveDietWithOptions = async ({ athleteId, phase, totals, meals }) => {
  // 1. Crear la dieta
  const { data: dietData, error: dietError } = await supabase
    .from('diets')
    .insert([{
      athlete_id: athleteId,
      phase,
      total_kcal: parseInt(totals.kcal) || 0,
      total_proteins: parseInt(totals.protein) || 0,
      total_carbs: parseInt(totals.carbs) || 0,
      total_fats: parseInt(totals.fats) || 0,
    }])
    .select()
    .single();

  if (dietError) throw dietError;

  // 2. Crear las comidas
  const mealsToInsert = meals.map((meal, idx) => ({
    diet_id: dietData.id,
    meal_order: idx + 1,
    target_kcal: parseInt(meal.target_kcal) || 0,
    target_protein: parseInt(meal.target_protein) || 0,
    target_carbs: parseInt(meal.target_carbs) || 0,
    target_fats: parseInt(meal.target_fats) || 0,
  }));

  const { data: savedMeals, error: mealsError } = await supabase
    .from('meals')
    .insert(mealsToInsert)
    .select();

  if (mealsError) throw mealsError;

  // 3. Crear opciones y alimentos para cada comida
  for (let i = 0; i < meals.length; i++) {
    const mealId = savedMeals[i].id;
    const options = meals[i].options || [];

    for (const option of options) {
      // Solo guardar opciones que tienen al menos 1 alimento con nombre
      const validItems = (option.items || []).filter((item) => item.food_name.trim());
      if (validItems.length === 0) continue;

      const { data: savedOption, error: optError } = await supabase
        .from('meal_options')
        .insert({
          meal_id: mealId,
          option_order: option.option_order,
          label: option.label || `Opción ${option.option_order}`,
        })
        .select()
        .single();

      if (optError) throw optError;

      const itemsToInsert = validItems.map((item, idx) => ({
        meal_option_id: savedOption.id,
        food_name: item.food_name.trim(),
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || 'g',
        item_order: idx + 1,
      }));

      const { error: itemsError } = await supabase
        .from('meal_option_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }
  }

  return dietData;
};

// ─── Athlete: cargar dieta activa con opciones de comida ───

const fetchDietWithOptions = async (athleteId) => {
  // 1. Dieta más reciente
  const { data: diet, error: dietError } = await supabase
    .from('diets')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dietError) throw dietError;
  if (!diet) return { diet: null, meals: [] };

  // 2. Comidas con opciones y alimentos (nested join)
  const { data: mealsData, error: mealsError } = await supabase
    .from('meals')
    .select(`
      id,
      meal_order,
      target_kcal,
      target_protein,
      target_carbs,
      target_fats,
      meal_options (
        id,
        option_order,
        label,
        meal_option_items (
          id,
          food_name,
          quantity,
          unit,
          item_order
        )
      )
    `)
    .eq('diet_id', diet.id)
    .order('meal_order', { ascending: true });

  if (mealsError) throw mealsError;

  // Ordenar opciones e items dentro de cada meal
  const meals = (mealsData || []).map((meal) => ({
    ...meal,
    meal_options: (meal.meal_options || [])
      .sort((a, b) => a.option_order - b.option_order)
      .map((opt) => ({
        ...opt,
        meal_option_items: (opt.meal_option_items || []).sort(
          (a, b) => a.item_order - b.item_order
        ),
      })),
  }));

  return { diet, meals };
};

// ─── Coach: cargar atletas para selector ───

const fetchAthletes = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('role', ['athlete', 'atleta'])
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const useDiet = () => ({
  saveDietWithOptions,
  fetchDietWithOptions,
  fetchAthletes,
});
