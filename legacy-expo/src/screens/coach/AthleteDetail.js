import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCoachCompliance } from '../../hooks/useCoachCompliance';

export default function AthleteDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { fetchAthleteDetailData } = useCoachCompliance();
  const athleteId = route.params?.athleteId;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailData, setDetailData] = useState({
    athlete: {
      id: athleteId,
      name: 'Atleta',
      avatarUrl: null,
    },
    latestDiet: null,
    currentWeekForm: null,
    latestForm: null,
    metrics: {
      averageCompliance: 0,
      completionRate: 0,
      trendDelta: 0,
    },
    recentForms: [],
    chartData: [],
  });

  useEffect(() => {
    loadAthleteDetail();
  }, [athleteId]);

  const loadAthleteDetail = async (showLoader = true) => {
    if (!athleteId) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await fetchAthleteDetailData(athleteId);
      setDetailData(data);
    } catch (error) {
      console.error('Error al cargar el detalle del atleta:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAthleteDetail(false);
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendMeta = () => {
    if (detailData.metrics.trendDelta > 0) {
      return {
        icon: 'arrow-upward',
        color: '#10b981',
        text: `+${detailData.metrics.trendDelta}%`,
      };
    }

    if (detailData.metrics.trendDelta < 0) {
      return {
        icon: 'arrow-downward',
        color: '#f43f5e',
        text: `${detailData.metrics.trendDelta}%`,
      };
    }

    return {
      icon: 'remove',
      color: '#64748b',
      text: '0%',
    };
  };

  const avatarInitial = detailData.athlete.name.charAt(0).toUpperCase();
  const latestDiet = detailData.latestDiet;
  const trendMeta = getTrendMeta();
  const chartPath = detailData.chartData.length > 1
    ? detailData.chartData.reduce((accumulator, point, index) => {
        const segment = `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        return `${accumulator} ${segment}`.trim();
      }, '')
    : 'M 0 100 L 100 100';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando detalle del atleta...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Top Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 -ml-1">
          <MaterialIcons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 flex-1 text-center">Athlete Profile</Text>
        <TouchableOpacity className="p-1 -mr-1">
          <MaterialIcons name="more-vert" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007fff"
            colors={["#007fff"]}
          />
        }
      >
        
        {/* Athlete Profile Card */}
        <View className="p-4">
          <View className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <View className="flex-row items-center gap-4">
              <View className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden">
                {detailData.athlete.avatarUrl ? (
                  <Image source={{ uri: detailData.athlete.avatarUrl }} className="w-full h-full" />
                ) : (
                  <View className="w-full h-full bg-primary/10 items-center justify-center">
                    <Text className="text-2xl font-black text-primary">{avatarInitial}</Text>
                  </View>
                )}
              </View>
              <View>
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{detailData.athlete.name}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${detailData.currentWeekForm ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${detailData.currentWeekForm ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {detailData.currentWeekForm ? 'Current Week Sent' : 'Pending Week'}
                    </Text>
                  </View>
                </View>
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Plan actual: {latestDiet?.phase || 'Sin dieta activa'}</Text>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="event" size={14} color="#007fff" />
                  <Text className="text-primary text-xs font-semibold">Ultimo check-in: {detailData.latestForm ? `Semana ${detailData.latestForm.iso_week}` : 'sin registros'}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={loadAthleteDetail} className="flex-row items-center justify-center bg-primary h-10 px-4 rounded-lg mt-2 sm:mt-0">
              <MaterialIcons name="refresh" size={18} color="white" className="mr-2" />
              <Text className="text-white text-sm font-bold ml-2">Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Metrics Grid */}
        <View className="flex-row gap-3 px-4">
          <View className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Compliance Avg</Text>
            <View className="flex-row items-baseline">
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{detailData.metrics.averageCompliance}</Text>
              <Text className="text-sm font-normal text-slate-900 dark:text-slate-100 ml-0.5">%</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name={trendMeta.icon} size={14} color={trendMeta.color} />
              <Text className="text-[11px] font-bold ml-0.5" style={{ color: trendMeta.color }}>{trendMeta.text}</Text>
            </View>
          </View>

          <View className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Diet Target</Text>
            <View className="flex-row items-baseline">
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{latestDiet?.total_kcal || 0}</Text>
              <Text className="text-sm font-normal text-slate-900 dark:text-slate-100 ml-0.5">kcal</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="restaurant" size={14} color="#007fff" />
              <Text className="text-primary text-[11px] font-bold ml-0.5">{latestDiet?.phase || 'Sin plan'}</Text>
            </View>
          </View>

          <View className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Completion</Text>
            <View className="flex-row items-baseline">
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{detailData.metrics.completionRate}</Text>
              <Text className="text-sm font-normal text-slate-900 dark:text-slate-100 ml-0.5">%</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="task-alt" size={14} color="#10b981" />
              <Text className="text-emerald-500 text-[11px] font-bold ml-0.5">{detailData.recentForms.length} semanas</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart Section */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-900 dark:text-slate-100 font-bold">Compliance Trend</Text>
            <Text className="text-xs text-primary font-bold">Ultimas {detailData.chartData.length || 0} semanas</Text>
          </View>
          <View className="w-full h-48 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex-col justify-end relative overflow-hidden">
            <View className="absolute inset-0 items-center justify-center p-4">
              <Svg width="100%" height="80%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <Path d={chartPath} fill="none" stroke="#007fff" strokeWidth="2" />
                {detailData.chartData.map((point) => (
                  <Circle key={point.label} cx={point.x} cy={point.y} r="1.8" fill="#007fff" />
                ))}
              </Svg>
            </View>
            <View className="flex-row justify-between w-full mt-auto">
              {detailData.chartData.length > 0 ? (
                detailData.chartData.map((point) => (
                  <Text key={point.label} className="text-[10px] text-slate-500 font-medium z-10 flex-1 text-center">{point.label}</Text>
                ))
              ) : (
                <Text className="text-[10px] text-slate-500 font-medium z-10">Sin datos historicos</Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 px-4 mt-6">
          <TouchableOpacity className="flex-1 items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <MaterialIcons name="restaurant-menu" size={24} color="#007fff" />
            <Text className="text-[11px] font-bold uppercase tracking-tighter text-slate-900 dark:text-slate-100">Current Week</Text>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">{detailData.currentWeekForm?.diet_compliance_score ?? '--'}%</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <MaterialIcons name="bolt" size={24} color="#007fff" />
            <Text className="text-[11px] font-bold uppercase tracking-tighter text-slate-900 dark:text-slate-100">Energy</Text>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">{detailData.latestForm?.energy_score ?? '--'}/5</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <MaterialIcons name="favorite-border" size={24} color="#007fff" />
            <Text className="text-[11px] font-bold uppercase tracking-tighter text-slate-900 dark:text-slate-100">Digestion</Text>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">{detailData.latestForm?.digestion_score ?? '--'}/5</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Athlete Notes */}
        <View className="px-4 mt-8 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <MaterialIcons name="notes" size={20} color="#007fff" />
            <Text className="text-slate-900 dark:text-slate-100 font-bold">Notas recientes del atleta</Text>
          </View>
          <View className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            {detailData.recentForms.length > 0 ? (
              detailData.recentForms.slice(0, 4).map((form) => (
                <View key={`${form.iso_year}-${form.iso_week}`} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0 border-slate-200 dark:border-slate-800">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">Semana {form.iso_week}</Text>
                    <Text className="text-xs font-semibold text-primary">{form.diet_compliance_score || 0}%</Text>
                  </View>
                  <Text className="text-sm text-slate-600 dark:text-slate-300">{form.notes || 'Sin nota escrita por el atleta en esta semana.'}</Text>
                </View>
              ))
            ) : (
              <Text className="text-sm text-slate-500 dark:text-slate-400">Este atleta todavia no tiene notas ni check-ins guardados.</Text>
            )}
          </View>

          {latestDiet && (
            <View className="mt-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <Text className="text-slate-900 dark:text-slate-100 font-bold mb-3">Macros del plan actual</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase">Proteina</Text>
                  <Text className="text-base font-bold text-primary">{latestDiet.total_proteins}g</Text>
                </View>
                <View>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase">Carbs</Text>
                  <Text className="text-base font-bold text-amber-500">{latestDiet.total_carbs}g</Text>
                </View>
                <View>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase">Grasas</Text>
                  <Text className="text-base font-bold text-rose-500">{latestDiet.total_fats}g</Text>
                </View>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
