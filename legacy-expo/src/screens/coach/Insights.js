import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useCoachCompliance } from '../../hooks/useCoachCompliance';

export default function Insights() {
  const [activeDateRange, setActiveDateRange] = useState('Last 30 Days');
  const dateRanges = ['Last 30 Days', 'Last 7 Days', 'Last Quarter'];
  const { fetchCoachInsightsData } = useCoachCompliance();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insightsData, setInsightsData] = useState({
    kpis: {
      averageCompliance: 0,
      activeAthletes: 0,
      pendingThisWeek: 0,
    },
    weeklyCompliance: [],
    formCompletion: [],
    topPerformers: [],
  });

  useEffect(() => {
    loadInsights(activeDateRange);
  }, [activeDateRange]);

  const loadInsights = async (range, showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await fetchCoachInsightsData(range);
      setInsightsData(data);
    } catch (error) {
      console.error('Error al cargar insights:', error.message);
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
      await loadInsights(activeDateRange, false);
    } finally {
      setRefreshing(false);
    }
  };

  const progressRing = Math.min(Math.max(insightsData.kpis.averageCompliance, 0), 100);

  const renderAvatar = (performer) => {
    if (performer.avatarUrl) {
      return <Image source={{ uri: performer.avatarUrl }} className="w-full h-full" />;
    }

    return (
      <View className="w-full h-full bg-primary/10 items-center justify-center">
        <Text className="font-black text-primary">{performer.name.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando insights de compliance...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 border-b border-slate-200 dark:border-slate-800 z-10 w-full">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
            <MaterialIcons name="analytics" size={24} color="#007fff" />
          </View>
          <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Insights</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="w-10 h-10 rounded-lg items-center justify-center flex-row hover:bg-slate-100 dark:hover:bg-slate-800">
            <MaterialIcons name="search" size={24} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-lg items-center justify-center flex-row hover:bg-slate-100 dark:hover:bg-slate-800">
            <MaterialIcons name="notifications" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Range Selector */}
      <View className="border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark py-3 px-4 z-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {dateRanges.map(range => (
              <TouchableOpacity 
                key={range}
                onPress={() => setActiveDateRange(range)}
                className={`flex-row items-center justify-center h-9 px-4 rounded-lg ${activeDateRange === range ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                <Text className={`text-sm font-medium ${activeDateRange === range ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {range}
                </Text>
                {activeDateRange === range && (
                  <MaterialIcons name="calendar-today" size={16} color="white" className="ml-2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 w-full"
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
        <View className="p-4 space-y-6">

          {/* Business KPIs Row */}
          <View className="flex-col md:flex-row gap-4 mb-6">
            <View className="flex-1 bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex-col gap-2 mb-4 md:mb-0">
              <View className="flex-row justify-between items-start">
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Average Compliance</Text>
                <View className="bg-emerald-500/10 px-2 py-1 rounded-full">
                  <Text className="text-emerald-500 text-xs font-bold">Real Data</Text>
                </View>
              </View>
              <Text className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{insightsData.kpis.averageCompliance}%</Text>
              <Text className="text-slate-400 text-xs">Media de formularios enviados</Text>
            </View>

            <View className="flex-1 bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex-col gap-2 mb-4 md:mb-0">
              <View className="flex-row justify-between items-start">
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Athletes</Text>
                <View className="bg-emerald-500/10 px-2 py-1 rounded-full">
                  <Text className="text-emerald-500 text-xs font-bold">Range</Text>
                </View>
              </View>
              <Text className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{insightsData.kpis.activeAthletes}</Text>
              <Text className="text-slate-400 text-xs">Atletas con check-in en el rango</Text>
            </View>

            <View className="flex-1 bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex-col gap-2">
              <View className="flex-row justify-between items-start">
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending This Week</Text>
                <View className="bg-rose-500/10 px-2 py-1 rounded-full">
                  <Text className="text-rose-500 text-xs font-bold">Current Week</Text>
                </View>
              </View>
              <Text className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{insightsData.kpis.pendingThisWeek}</Text>
              <Text className="text-slate-400 text-xs">Atletas aun sin enviar el formulario</Text>
            </View>
          </View>

          {/* Performance Charts Section */}
          <View className="flex-col gap-6 mb-6">
            
            {/* Pseudo-Bar Chart: Weekly Compliance */}
            <View className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">Weekly Compliance Trend</Text>
                <TouchableOpacity>
                  <MaterialIcons name="more-vert" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <View className="h-48 flex-row items-end gap-2 pr-2">
                {insightsData.weeklyCompliance.length > 0 ? (
                  insightsData.weeklyCompliance.map((item, index) => (
                    <View
                      key={item.label}
                      className={`flex-1 rounded-t-sm relative items-center justify-start ${index === insightsData.weeklyCompliance.length - 1 ? 'bg-primary' : 'bg-primary/40'}`}
                      style={{ height: `${Math.max(item.value, 8)}%` }}
                    >
                      {index === insightsData.weeklyCompliance.length - 1 && (
                        <View className="absolute -top-7 bg-slate-800 px-2 py-0.5 rounded">
                          <Text className="text-white text-[10px]">{item.value}%</Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">Sin datos suficientes en este rango</Text>
                  </View>
                )}
              </View>
              <View className="flex-row justify-between mt-4">
                {insightsData.weeklyCompliance.map((item) => (
                  <Text key={item.label} className="text-[10px] text-slate-500 font-medium flex-1 text-center">{item.label}</Text>
                ))}
              </View>
            </View>

            {/* Donut Chart & Engagement */}
            <View className="flex-col sm:flex-row gap-6">
              
              {/* Circular: Plan Compliance */}
              <View className="flex-1 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 items-center justify-center flex-col sm:mb-0 mb-6">
                <Text className="text-sm font-bold w-full text-left text-slate-900 dark:text-slate-100 mb-4">Plan Compliance</Text>
                <View className="relative w-32 h-32 items-center justify-center">
                  <Svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx="18" cy="18" r="16" strokeWidth="3" fill="none" className="stroke-slate-100 dark:stroke-slate-800" />
                    <Circle cx="18" cy="18" r="16" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${progressRing}, 100`} className="stroke-primary" />
                    <Circle cx="18" cy="18" r="16" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${100 - progressRing}, 100`} strokeDashoffset={`-${progressRing}`} className="stroke-primary/30" />
                  </Svg>
                  <View className="absolute inset-0 flex-col items-center justify-center">
                    <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{insightsData.kpis.averageCompliance}%</Text>
                    <Text className="text-[10px] text-slate-500 uppercase">Avg</Text>
                  </View>
                </View>
                <View className="mt-4 flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-primary" />
                    <Text className="text-[11px] text-slate-900 dark:text-slate-100">Compliance</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-primary/30" />
                    <Text className="text-[11px] text-slate-900 dark:text-slate-100">Gap</Text>
                  </View>
                </View>
              </View>

              {/* Bar Chart: Form Completion */}
              <View className="flex-1 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex-col">
                <Text className="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Form Completion</Text>
                <View className="flex-col gap-3">
                  {insightsData.formCompletion.length > 0 ? (
                    insightsData.formCompletion.map((data) => (
                      <View key={data.label} className="flex-col gap-1">
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-medium text-slate-900 dark:text-slate-100">{data.label}</Text>
                          <Text className="text-[10px] font-medium text-slate-900 dark:text-slate-100">{data.completion}%</Text>
                        </View>
                        <View className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex-row">
                          <View className="bg-primary h-full" style={{ width: `${data.completion}%` }} />
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">Aun no hay formularios para calcular completitud.</Text>
                  )}
                </View>
              </View>

            </View>
          </View>

          {/* Top Performers List */}
          <View className="mb-6 flex-col gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">Top Performers</Text>
              <TouchableOpacity>
                <Text className="text-primary text-sm font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-col md:flex-row gap-4">
              {insightsData.topPerformers.map((performer) => (
                <View key={performer.id} className="flex-1 flex-row items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 mb-4 md:mb-0">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
                      {renderAvatar(performer)}
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{performer.name}</Text>
                      <Text className="text-xs text-slate-500">{performer.checkIns} check-ins en el rango</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-emerald-500">{performer.averageScore}%</Text>
                    <Text className="text-[10px] text-slate-500">Compliance</Text>
                  </View>
                </View>
              ))}

              {insightsData.topPerformers.length === 0 && (
                <View className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <Text className="text-slate-500 dark:text-slate-400 text-center">No hay suficientes check-ins para calcular top performers.</Text>
                </View>
              )}

            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
