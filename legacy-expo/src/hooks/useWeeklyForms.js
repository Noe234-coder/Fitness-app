import { supabase } from '../services/supabase';

const COMPLIANCE_OPTIONS = [100, 90, 80, 70];
const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const formatDate = (date) => {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
};

export const getCurrentWeekMetadata = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStartDate = new Date(date);
  weekStartDate.setDate(date.getDate() + diffToMonday);
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const isoReference = new Date(weekStartDate);
  isoReference.setDate(weekStartDate.getDate() + 3);
  const isoYear = isoReference.getFullYear();

  const firstThursday = new Date(isoYear, 0, 4);
  const firstThursdayDay = firstThursday.getDay() || 7;
  firstThursday.setDate(firstThursday.getDate() + (4 - firstThursdayDay));

  const diffMs = isoReference.getTime() - firstThursday.getTime();
  const isoWeek = 1 + Math.floor(diffMs / 604800000);

  return {
    isoYear,
    isoWeek,
    weekStartDate,
    weekEndDate,
    weekStartDateString: weekStartDate.toISOString().split('T')[0],
    label: `Semana ${isoWeek} · ${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`,
  };
};

const fetchActiveDiet = async (athleteId) => {
  const { data, error } = await supabase
    .from('diets')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const fetchCurrentWeekForm = async (athleteId, isoYear, isoWeek) => {
  const { data, error } = await supabase
    .from('weekly_forms')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('iso_year', isoYear)
    .eq('iso_week', isoWeek)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const saveWeeklyForm = async ({
  athleteId,
  dietId,
  isoYear,
  isoWeek,
  weekStartDate,
  dietComplianceScore,
  hungerScore,
  energyScore,
  digestionScore,
  notes,
}) => {
  const normalizedScore = COMPLIANCE_OPTIONS.includes(dietComplianceScore)
    ? dietComplianceScore
    : 70;

  const { data, error } = await supabase
    .from('weekly_forms')
    .upsert([
      {
        athlete_id: athleteId,
        diet_id: dietId,
        iso_year: isoYear,
        iso_week: isoWeek,
        week_start_date: weekStartDate,
        diet_compliance_score: normalizedScore,
        adherence_label: normalizedScore === 70 ? '<80%' : `${normalizedScore}%`,
        hunger_score: hungerScore,
        energy_score: energyScore,
        digestion_score: digestionScore,
        notes: notes?.trim() || null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ], {
      onConflict: 'athlete_id,iso_year,iso_week',
    })
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const weeklyComplianceOptions = [
  {
    value: 100,
    label: '100%',
    description: 'Segui el plan tal cual',
  },
  {
    value: 90,
    label: '90%',
    description: 'Solo hubo una desviacion menor',
  },
  {
    value: 80,
    label: '80%',
    description: 'La semana fue aceptable',
  },
  {
    value: 70,
    label: '<80%',
    description: 'Hubo varias desviaciones',
  },
];

export const useWeeklyForms = () => {
  return {
    getCurrentWeekMetadata,
    fetchActiveDiet,
    fetchCurrentWeekForm,
    saveWeeklyForm,
  };
};