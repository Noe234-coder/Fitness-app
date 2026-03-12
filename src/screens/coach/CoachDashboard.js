import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function CoachDashboard() {

  const {colorScheme, toggleColorScheme} = useColorScheme();

  const athletes = [
    {
      id: 1,
      name: 'Alex Johnson',
      compliance: '95%',
      complianceStatus: 'emerald',
      lastUpdate: 'Completed Push Day',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7REOONT7C3dU6-uf56AgOFfERK5D5Chx6GrZzfbzuvbnqmmkIPRwnsf-F7ZJ0tIyc7XcfX3x9A5_RhQh-hOJBjkwspLC046mQTuA8IHVO9E9sQ4qZ7uCtM68HzEqNEGeqx_OJ689RZ_AnVBP6vX02pwFD6nrE3hOI7HZ_fnib20pJcnMWofbgr3xiWqbbjod7q-wjbdUxD8PIEXT_erOA0MZrdO3jaI6lWSnpuMBb2RxweMjeqojpkKwXg4wK49tYa3zl2svJuDI',
      progress: ['emerald', 'emerald', 'emerald', 'emerald-light']
    },
    {
      id: 2,
      name: 'Marcus Wei',
      compliance: '72%',
      complianceStatus: 'amber',
      lastUpdate: 'Logged Lunch (400kcal)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkX_rR91HK959Kdow4QTreysKbkf862UNonGRuyKH5y2QFuX_t1EfPJPY_n5HPQDhpbiwp5qqM3Ril6yX6wu5v4_LRwQtwXh85A7KYCjPQaKYxiG92GszJ22MAt7lybMdCWS_cysPqdaOZ5P18hyVuBU24K0VW3KDJcCx1QHx8PRexJUD8oC4bdBD03qVoy30s4tyj5PPzl_nboRX7RGsfWhg5nkiNJl1LoTzvzdAT3TeyxucfbgzzDFmuu0YHLQ6T9MLy7Ryntj4',
      progress: ['emerald', 'amber', 'slate', 'slate']
    },
    {
      id: 3,
      name: 'Sarah Connor',
      compliance: '88%',
      complianceStatus: 'emerald',
      lastUpdate: 'Missed morning cardio',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQFEbNY703C8tBKz9_jy_4I-JbMEFaHCoUGvrpyc8xdJN8Otm-JrMQhTL4YolQb3_nXoEn6AuvlDkEAdGsCDbuQ9f9HBekE5k2Zee8ITiKbkYxltJ41BktJ_cc0F0-PjKYfrPYVgi5CIweW_mk5FTEVb7jC7WN_kmaSMYrdanLxAl9tavgnH0_Plmdp2J7Yr3LSmsfK-pLD0xTIzSZWPK8oVHYtJnI4u3KPUCcunZXZ8AO4oy2UeLOapTDs00l0hugue4j4wgYvus',
      progress: ['emerald', 'emerald', 'rose', 'slate']
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center overflow-hidden border-2 border-primary">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWpCeFZnXY8W8SjjEeR4dVD7Jaz-cbdEvd47sFlVZ7zoEWAHPoe_6FZ8Re88mbPJN-5vKRWcUvmQx5Ut9nQMHjsAppkz3pd-8t8lyoFjlO-Uq_fGdHEimgdBqJ6vYdHl0JCMcnmtH6cgllZGLajJrBBw28cLJ-2O_9dJonDs8wiJb1Hd_Bdc6y8qT1eWXWdcb1U2LceGajq2-iEIfpHoMWf7HeYrXluO_iQOAMQS3u1YmzTlz7LWJ9_r2XAiltO4RdEKIqOZGakS4' }}
              className="w-full h-full"
            />
          </View>
          <View>
            <Text className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">Coach Dashboard</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Welcome back, Coach Mike</Text>
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
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Quick Stats */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 flex-col rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 mr-2">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Athletes</Text>
            <Text className="text-2xl font-bold text-primary">124</Text>
          </View>
          <View className="flex-1 flex-col rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 mx-1">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Active</Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">98</Text>
          </View>
          <View className="flex-1 flex-col rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 ml-2">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Pending</Text>
            <Text className="text-2xl font-bold text-amber-500">12</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-12">
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-primary rounded-lg">
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
            {/* AQUÍ ESTABA EL ERROR: Faltaba abrir el .map() */}
            {athletes.map((athlete) => (
              <View key={athlete.id} className="flex-row items-center gap-4 bg-slate-100 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 mb-3">
                <View className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <Image source={{ uri: athlete.image }} className="w-full h-full" />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <Text className="font-bold text-slate-900 dark:text-slate-100" numberOfLines={1}>{athlete.name}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${athlete.complianceStatus === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                      <Text className={`text-xs font-bold ${athlete.complianceStatus === 'emerald' ? 'text-emerald-500' : 'text-amber-500'}`}>
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
                      else if (p === 'emerald-light') bgClass = "bg-emerald-500/30";
                      else if (p === 'amber') bgClass = "bg-amber-500";
                      else if (p === 'rose') bgClass = "bg-rose-500";
                      
                      return <View key={i} className={`h-1.5 w-6 rounded-full ${bgClass}`} />
                    })}
                  </View>
                </View>
                <TouchableOpacity className="p-2">
                  <MaterialIcons name="edit" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
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
