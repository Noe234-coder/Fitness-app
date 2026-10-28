import { supabase } from '../services/supabase';

const fetchActiveMesocycle = async (athleteId) => {
  const { data, error } = await supabase
    .from('mesocycles')
    .select('id, name, athlete_id')
    .eq('athlete_id', athleteId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const fetchWorkouts = async (mesocycleId) => {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, day_name, focus, order')
    .eq('mesocycle_id', mesocycleId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchWorkoutDetail = async (workoutId, weekNumber) => {
  const { data, error } = await supabase
    .from('exercises')
    .select(`
      id,
      name,
      order,
      coach_notes,
      exercise_sets (
        id,
        set_order,
        target_reps,
        target_rir,
        workout_logs (
          id,
          week_number,
          actual_weight,
          actual_reps
        )
      )
    `)
    .eq('workout_id', workoutId)
    .order('order', { ascending: true });

  if (error) throw error;

  return (data || []).map((exercise) => ({
    ...exercise,
    exercise_sets: (exercise.exercise_sets || [])
      .sort((a, b) => a.set_order - b.set_order)
      .map((set) => ({
        ...set,
        log: (set.workout_logs || []).find((l) => l.week_number === weekNumber) || null,
      })),
  }));
};

const saveSetLog = async ({ logId, setId, weekNumber, actualWeight, actualReps }) => {
  const weight = actualWeight !== '' && actualWeight != null ? parseFloat(actualWeight) : null;
  const reps = actualReps !== '' && actualReps != null ? parseInt(actualReps, 10) : null;

  if (logId) {
    const { error } = await supabase
      .from('workout_logs')
      .update({ actual_weight: weight, actual_reps: reps })
      .eq('id', logId);

    if (error) throw error;
    return { id: logId, week_number: weekNumber, actual_weight: weight, actual_reps: reps };
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({ set_id: setId, week_number: weekNumber, actual_weight: weight, actual_reps: reps })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const useTraining = () => {
  return { fetchActiveMesocycle, fetchWorkouts, fetchWorkoutDetail, saveSetLog };
};
