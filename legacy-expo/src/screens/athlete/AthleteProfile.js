import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../../store/useAuthStore';

export default function AthleteProfile() {
  const { logout, userProfile, session } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const email = session?.user?.email || '';

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 border-b border-slate-200 dark:border-slate-800 z-10 w-full">
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800">
          <MaterialIcons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Profile</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800">
          <MaterialIcons name="settings" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Section */}
        <View className="flex-col items-center p-6 gap-4">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-primary p-1 overflow-hidden bg-primary/10 items-center justify-center">
              {userProfile?.avatar_url ? (
                <Image
                  source={{ uri: userProfile.avatar_url }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="font-black text-primary text-5xl">
                  {(userProfile?.full_name || 'A').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="absolute bottom-1 right-1 bg-primary w-8 h-8 flex items-center justify-center rounded-full border-2 border-background-light dark:border-background-dark">
              <MaterialIcons name="verified" size={16} color="white" />
            </View>
          </View>
          
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{userProfile?.full_name || 'Atleta'}</Text>
            <View className="mt-1 flex-row items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
              <MaterialIcons name="star" size={12} color="#007fff" />
              <Text className="text-primary text-xs font-bold uppercase tracking-wider">Athlete Pro</Text>
            </View>
          </View>

          <TouchableOpacity className="w-full max-w-xs py-2.5 px-6 rounded-lg bg-slate-200 dark:bg-slate-800">
            <Text className="text-center font-semibold text-sm text-slate-900 dark:text-slate-100">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Alert Banner */}
        <View className="px-4 mb-6">
          <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex-row items-start gap-4">
            <View className="p-2 bg-amber-500/20 rounded-lg">
              <MaterialIcons name="warning" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-amber-500">Subscription expires soon</Text>
              <Text className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 mb-3">Your plan expires in 3 days. Renew now to avoid losing your Pro status and tracking data.</Text>
              <TouchableOpacity className="self-start px-4 py-1.5 bg-amber-500 rounded-lg">
                <Text className="text-slate-900 text-sm font-bold">Renew Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings List */}
        <View className="px-4 space-y-6 flex-col gap-6">
          
          {/* Account Settings */}
          <View>
            <Text className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-widest px-2 mb-3">Account Settings</Text>
            <View className="bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-col">
              
              <TouchableOpacity className="flex-row items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
                <MaterialIcons name="person" size={24} color="#007fff" />
                <View className="flex-1">
                  <Text className="font-medium text-slate-900 dark:text-slate-100">Personal Data</Text>
                  <Text className="text-xs text-slate-500">Height, weight, age, and goals</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-4 p-4">
                <MaterialIcons name="credit-card" size={24} color="#007fff" />
                <View className="flex-1">
                  <Text className="font-medium text-slate-900 dark:text-slate-100">Subscription Plan</Text>
                  <Text className="text-xs text-slate-500">Manage your Pro monthly plan</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
              </TouchableOpacity>

            </View>
          </View>

          {/* Preferences */}
          <View>
            <Text className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-widest px-2 mb-3">Preferences</Text>
            <View className="bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-col">
              
              <TouchableOpacity className="flex-row items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
                <MaterialIcons name="notifications" size={24} color="#007fff" />
                <View className="flex-1">
                  <Text className="font-medium text-slate-900 dark:text-slate-100">Notifications</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
              </TouchableOpacity>

              <View className="flex-row items-center gap-4 p-4">
                <MaterialIcons name="dark-mode" size={24} color="#007fff" />
                <View className="flex-1">
                  <Text className="font-medium text-slate-900 dark:text-slate-100">Dark Mode</Text>
                </View>
                <Switch
                  value={colorScheme === 'dark'}
                  onValueChange={toggleColorScheme}
                  trackColor={{ false: "#cbd5e1", true: "#007fff" }}
                  thumbColor={"#ffffff"}
                />
              </View>

            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            className="w-full flex-row items-center justify-center gap-2 p-4 rounded-xl"
            onPress={logout}
          >
            <MaterialIcons name="logout" size={24} color="#ef4444" />
            <Text className="text-red-500 font-bold">Logout</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}
