import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { useCoachCompliance } from '../../hooks/useCoachCompliance';


export default function CoachDashboard() {

  const { logout, userProfile } = useAuthStore();
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const navigation = useNavigation();
  const { fetchCoachDashboardData } = useCoachCompliance();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAthletes: 0,
      activeAthletes: 0,
      pendingAthletes: 0,
    },
    athletes: [],
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await fetchCoachDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error al cargar el dashboard del coach:', error.message);
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
      await loadDashboard(false);
    } finally {
      setRefreshing(false);
    }
  };

  const getBadgeClasses = (status) => {
    if (status === 'emerald') {
      return {
        container: 'bg-emerald-500/10',
        text: 'text-emerald-500',
      };
    }

    if (status === 'amber') {
      return {
        container: 'bg-amber-500/10',
        text: 'text-amber-500',
      };
    }

    if (status === 'rose') {
      return {
        container: 'bg-rose-500/10',
        text: 'text-rose-500',
      };
    }

    return {
      container: 'bg-slate-500/10',
      text: 'text-slate-500',
    };
  };

  const renderAvatar = (athlete) => {
    if (athlete.avatarUrl) {
      return <Image source={{ uri: athlete.avatarUrl }} className="w-full h-full" />;
    }

    return (
      <View className="w-full h-full items-center justify-center bg-primary/10">
        <Text className="font-black text-primary text-lg">{athlete.name.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando compliance del equipo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center overflow-hidden border-2 border-primary">
            {userProfile?.avatar_url ? (
              <Image source={{ uri: userProfile.avatar_url }} className="w-full h-full" />
            ) : (
              <Text className="font-black text-primary text-base">
                {(userProfile?.full_name || 'C').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View>
            <Text className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">Coach Dashboard</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Welcome back, {userProfile?.full_name || 'Coach'}</Text>
          </View>
        </View>
        
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity className="p-2 rounded-full text-slate-600 dark:text-slate-300">
            <MaterialIcons name="notifications" size={24} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleColorScheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700"
          >
            <MaterialIcons 
              name={colorScheme === 'dark' ? 'light-mode' : 'dark-mode'} 
              size={24} 
              color={colorScheme === 'dark' ? '#fbbf24' : '#64748b'} 
            />
          </TouchableOpacity>

          {/* BOTÓN DE CERRAR SESIÓN AÑADIDO AQUÍ */}
          <TouchableOpacity 
            onPress={logout}
            className="p-2 rounded-full bg-rose-100 dark:bg-rose-500/20"
          >
            <MaterialIcons name="logout" size={24} color="#f43f5e" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
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
        
        {/* Quick Stats */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 flex-col rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 mr-2">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Athletes</Text>
            <Text className="text-2xl font-bold text-primary">{dashboardData.stats.totalAthletes}</Text>
          </View>
          <View className="flex-1 flex-col rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 mx-1">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Active 30d</Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dashboardData.stats.activeAthletes}</Text>
          </View>
          <View className="flex-1 flex-col rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 ml-2">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Pending Week</Text>
            <Text className="text-2xl font-bold text-amber-500">{dashboardData.stats.pendingAthletes}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-12">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('AssignAthletes')}
              className="flex-row items-center gap-2 px-4 py-2 bg-primary rounded-lg"
            >
              <MaterialIcons name="add-circle" size={20} color="white" />
              <Text className="text-white font-semibold text-sm">New Athlete</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg border border-primary/30">
              <MaterialIcons name="fitness-center" size={20} color="#007fff" />
              <Text className="text-primary font-semibold text-sm">Create Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg border border-primary/30">
              <MaterialIcons name="restaurant" size={20} color="#007fff" />
              <Text className="text-primary font-semibold text-sm">Assign Diet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* My Athletes List */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Athletes</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {dashboardData.athletes.map((athlete) => {
              const badge = getBadgeClasses(athlete.complianceStatus);

              return (
              <TouchableOpacity
                key={athlete.id}
                onPress={() => navigation.navigate('AthleteDetail', { athleteId: athlete.id })}
                className="flex-row items-center gap-4 bg-slate-100 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 mb-3"
              >
                <View className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  {renderAvatar(athlete)}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <Text className="font-bold text-slate-900 dark:text-slate-100" numberOfLines={1}>{athlete.name}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${badge.container}`}>
                      <Text className={`text-xs font-bold ${badge.text}`}>
                        {athlete.compliance} Compliance
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{athlete.lastUpdate}</Text>
                  
                  {/* Progress Indicators */}
                  <View className="flex-row gap-1 mt-2">
                    {athlete.progress.map((p, i) => {
                      let bgClass = "bg-slate-300 dark:bg-slate-700";
                      if (p === 'emerald') bgClass = "bg-emerald-500";
                      else if (p === 'amber') bgClass = "bg-amber-500";
                      else if (p === 'rose') bgClass = "bg-rose-500";
                      
                      return <View key={i} className={`h-1.5 w-6 rounded-full ${bgClass}`} />
                    })}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AthleteDetail', { athleteId: athlete.id })}
                  className="p-2"
                >
                  <MaterialIcons name="edit" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </TouchableOpacity>
            )})}

            {dashboardData.athletes.length === 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AssignAthletes')}
                className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 items-center gap-3"
              >
                <MaterialIcons name="person-add" size={36} color="#007fff" />
                <Text className="text-slate-700 dark:text-slate-200 font-bold text-center text-base">
                  Sin atletas asignados
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                  Toca aquí para asignar atletas a tu cuenta y ver su compliance semanal.
                </Text>
                <View className="bg-primary px-4 py-2 rounded-lg mt-1">
                  <Text className="text-white font-bold text-sm">Asignar atletas</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 right-4 w-14 h-14 bg-primary rounded-full shadow-lg items-center justify-center z-20">
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}