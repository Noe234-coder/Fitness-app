import { supabase } from '../services/supabase';
import { getCurrentWeekMetadata } from './useWeeklyForms';
import { useAuthStore } from '../store/useAuthStore';

const ONE_DAY_MS = 86400000;

const truncateText = (value, maxLength = 44) => {
  if (!value) {
    return '';
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
};

const getScoreStatus = (score) => {
  if (typeof score !== 'number') {
    return 'slate';
  }

  if (score >= 85) {
    return 'emerald';
  }

  if (score >= 70) {
    return 'amber';
  }

  return 'rose';
};

const getDateRangeConfig = (range) => {
  if (range === 'Last 7 Days') {
    return { days: 7, weekCount: 2 };
  }

  if (range === 'Last Quarter') {
    return { days: 90, weekCount: 8 };
  }

  return { days: 30, weekCount: 4 };
};

const getWeekKey = (isoYear, isoWeek) => `${isoYear}-${isoWeek}`;

const getAuthenticatedCoachId = () => {
  return useAuthStore.getState().session?.user?.id || null;
};

const getRecentWeekBuckets = (count) => {
  const buckets = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - (offset * 7));
    const week = getCurrentWeekMetadata(date);
    buckets.push({
      key: getWeekKey(week.isoYear, week.isoWeek),
      isoYear: week.isoYear,
      isoWeek: week.isoWeek,
      label: `S${week.isoWeek}`,
    });
  }

  return buckets;
};

const normalizeAthlete = (profile, forms, currentWeekKey) => {
  const currentWeekForm = forms.find((form) => getWeekKey(form.iso_year, form.iso_week) === currentWeekKey);
  const latestForm = forms[0] || null;
  const referenceForm = currentWeekForm || latestForm;
  const complianceScore = referenceForm?.diet_compliance_score ?? null;
  const progress = forms.slice(0, 4).map((form) => getScoreStatus(form.diet_compliance_score));

  while (progress.length < 4) {
    progress.push('slate');
  }

  return {
    id: profile.id,
    name: profile.full_name || 'Sin nombre',
    avatarUrl: profile.avatar_url || null,
    compliance: typeof complianceScore === 'number' ? `${complianceScore}%` : 'Pend.',
    complianceValue: complianceScore,
    complianceStatus: currentWeekForm ? getScoreStatus(complianceScore) : 'slate',
    lastUpdate: currentWeekForm
      ? truncateText(currentWeekForm.notes) || `Check-in enviado en semana ${currentWeekForm.iso_week}`
      : latestForm
        ? `Ultimo check-in: semana ${latestForm.iso_week}`
        : 'Sin check-ins todavia',
    progress,
    hasCurrentWeekForm: Boolean(currentWeekForm),
  };
};

const fetchAssignedAthleteIds = async (coachId) => {
  if (!coachId) {
    return [];
  }

  const { data, error } = await supabase
    .from('coach_athlete_assignments')
    .select('athlete_id')
    .eq('coach_id', coachId)
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  return [...new Set((data || []).map((item) => item.athlete_id).filter(Boolean))];
};

const fetchAthleteProfiles = async (athleteIds = []) => {
  if (!athleteIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, role')
    .in('id', athleteIds)
    .in('role', ['athlete', 'atleta'])
    .order('full_name', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

const fetchWeeklyForms = async (athleteIds, startDate) => {
  if (!athleteIds.length) {
    return [];
  }

  let query = supabase
    .from('weekly_forms')
    .select('athlete_id, diet_compliance_score, notes, submitted_at, iso_week, iso_year, week_start_date')
    .in('athlete_id', athleteIds)
    .order('week_start_date', { ascending: false })
    .order('submitted_at', { ascending: false });

  if (startDate) {
    query = query.gte('submitted_at', startDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

const fetchAthleteWeeklyForms = async (athleteId, limit = 8) => {
  const { data, error } = await supabase
    .from('weekly_forms')
    .select('athlete_id, diet_compliance_score, notes, submitted_at, iso_week, iso_year, week_start_date, hunger_score, energy_score, digestion_score')
    .eq('athlete_id', athleteId)
    .order('week_start_date', { ascending: false })
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
};

const fetchLatestDiet = async (athleteId) => {
  const { data, error } = await supabase
    .from('diets')
    .select('id, phase, total_kcal, total_proteins, total_carbs, total_fats, created_at')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const ensureAthleteAssignedToCoach = async (coachId, athleteId) => {
  if (!coachId || !athleteId) {
    return false;
  }

  const { data, error } = await supabase
    .from('coach_athlete_assignments')
    .select('id')
    .eq('coach_id', coachId)
    .eq('athlete_id', athleteId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

const fetchAthleteDetailData = async (athleteId) => {
  const coachId = getAuthenticatedCoachId();
  const hasAccess = await ensureAthleteAssignedToCoach(coachId, athleteId);

  if (!hasAccess) {
    throw new Error('No tienes acceso a este atleta o no esta asignado a tu cuenta.');
  }

  const currentWeek = getCurrentWeekMetadata();
  const currentWeekKey = getWeekKey(currentWeek.isoYear, currentWeek.isoWeek);

  const [{ data: profile, error: profileError }, latestDiet, forms] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, avatar_url, role')
      .eq('id', athleteId)
      .maybeSingle(),
    fetchLatestDiet(athleteId),
    fetchAthleteWeeklyForms(athleteId, 8),
  ]);

  if (profileError) {
    throw profileError;
  }

  const currentWeekForm = forms.find((form) => getWeekKey(form.iso_year, form.iso_week) === currentWeekKey) || null;
  const latestForm = forms[0] || null;
  const averageCompliance = forms.length
    ? Math.round(forms.reduce((sum, form) => sum + (form.diet_compliance_score || 0), 0) / forms.length)
    : 0;
  const completionRate = forms.length ? Math.round((forms.filter((form) => typeof form.diet_compliance_score === 'number').length / forms.length) * 100) : 0;
  const trendDelta = forms.length >= 2
    ? (forms[0].diet_compliance_score || 0) - (forms[1].diet_compliance_score || 0)
    : 0;

  const chartData = [...forms]
    .reverse()
    .map((form, index, list) => ({
      label: `S${form.iso_week}`,
      value: form.diet_compliance_score || 0,
      x: list.length === 1 ? 100 : (index / (list.length - 1)) * 100,
      y: 100 - (form.diet_compliance_score || 0),
    }));

  return {
    athlete: {
      id: profile?.id || athleteId,
      name: profile?.full_name || 'Sin nombre',
      avatarUrl: profile?.avatar_url || null,
    },
    latestDiet,
    currentWeekForm,
    latestForm,
    metrics: {
      averageCompliance,
      completionRate,
      trendDelta,
    },
    recentForms: forms,
    chartData,
  };
};

const fetchCoachDashboardData = async () => {
  const coachId = getAuthenticatedCoachId();
  const assignedAthleteIds = await fetchAssignedAthleteIds(coachId);
  const currentWeek = getCurrentWeekMetadata();
  const currentWeekKey = getWeekKey(currentWeek.isoYear, currentWeek.isoWeek);
  const [profiles, forms] = await Promise.all([
    fetchAthleteProfiles(assignedAthleteIds),
    fetchWeeklyForms(assignedAthleteIds),
  ]);

  const formsByAthlete = forms.reduce((accumulator, form) => {
    if (!accumulator[form.athlete_id]) {
      accumulator[form.athlete_id] = [];
    }

    accumulator[form.athlete_id].push(form);
    return accumulator;
  }, {});

  const athletes = profiles
    .map((profile) => normalizeAthlete(profile, formsByAthlete[profile.id] || [], currentWeekKey))
    .sort((left, right) => {
      const leftValue = left.complianceValue ?? -1;
      const rightValue = right.complianceValue ?? -1;
      return rightValue - leftValue;
    });

  const now = Date.now();
  const activeAthletes = athletes.filter((athlete) => {
    const latestForm = (formsByAthlete[athlete.id] || [])[0];
    return latestForm ? now - new Date(latestForm.submitted_at).getTime() <= ONE_DAY_MS * 30 : false;
  }).length;

  const pendingAthletes = athletes.filter((athlete) => !athlete.hasCurrentWeekForm).length;

  return {
    stats: {
      totalAthletes: profiles.length,
      activeAthletes,
      pendingAthletes,
    },
    athletes,
  };
};

const fetchCoachInsightsData = async (range) => {
  const coachId = getAuthenticatedCoachId();
  const assignedAthleteIds = await fetchAssignedAthleteIds(coachId);
  const { days, weekCount } = getDateRangeConfig(range);
  const startDate = new Date(Date.now() - (days * ONE_DAY_MS));
  const currentWeek = getCurrentWeekMetadata();
  const currentWeekKey = getWeekKey(currentWeek.isoYear, currentWeek.isoWeek);

  const [profiles, rangeForms, allForms] = await Promise.all([
    fetchAthleteProfiles(assignedAthleteIds),
    fetchWeeklyForms(assignedAthleteIds, startDate),
    fetchWeeklyForms(assignedAthleteIds),
  ]);

  const currentWeekForms = allForms.filter((form) => getWeekKey(form.iso_year, form.iso_week) === currentWeekKey);
  const uniqueActiveAthletes = new Set(rangeForms.map((form) => form.athlete_id));
  const uniqueCurrentWeekAthletes = new Set(currentWeekForms.map((form) => form.athlete_id));
  const averageCompliance = rangeForms.length
    ? Math.round(rangeForms.reduce((sum, form) => sum + (form.diet_compliance_score || 0), 0) / rangeForms.length)
    : 0;

  const weekBuckets = getRecentWeekBuckets(weekCount);
  const weeklyCompliance = weekBuckets.map((bucket) => {
    const bucketForms = allForms.filter((form) => getWeekKey(form.iso_year, form.iso_week) === bucket.key);
    const value = bucketForms.length
      ? Math.round(bucketForms.reduce((sum, form) => sum + (form.diet_compliance_score || 0), 0) / bucketForms.length)
      : 0;

    return {
      label: bucket.label,
      value,
    };
  });

  const formCompletion = weekBuckets.map((bucket) => {
    const completedAthletes = new Set(
      allForms
        .filter((form) => getWeekKey(form.iso_year, form.iso_week) === bucket.key)
        .map((form) => form.athlete_id)
    );

    return {
      label: bucket.label,
      completion: profiles.length ? Math.round((completedAthletes.size / profiles.length) * 100) : 0,
    };
  });

  const athleteScores = rangeForms.reduce((accumulator, form) => {
    if (!accumulator[form.athlete_id]) {
      accumulator[form.athlete_id] = { total: 0, count: 0 };
    }

    accumulator[form.athlete_id].total += form.diet_compliance_score || 0;
    accumulator[form.athlete_id].count += 1;
    return accumulator;
  }, {});

  const topPerformers = profiles
    .filter((profile) => athleteScores[profile.id])
    .map((profile) => ({
      id: profile.id,
      name: profile.full_name || 'Sin nombre',
      avatarUrl: profile.avatar_url || null,
      averageScore: Math.round(athleteScores[profile.id].total / athleteScores[profile.id].count),
      checkIns: athleteScores[profile.id].count,
    }))
    .sort((left, right) => right.averageScore - left.averageScore)
    .slice(0, 2);

  return {
    kpis: {
      averageCompliance,
      activeAthletes: uniqueActiveAthletes.size,
      pendingThisWeek: Math.max(profiles.length - uniqueCurrentWeekAthletes.size, 0),
    },
    weeklyCompliance,
    formCompletion,
    topPerformers,
  };
};

export const useCoachCompliance = () => {
  return {
    fetchCoachDashboardData,
    fetchCoachInsightsData,
    fetchAthleteDetailData,
  };
};