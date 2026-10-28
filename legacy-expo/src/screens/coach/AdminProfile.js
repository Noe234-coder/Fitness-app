import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminProfile() {
  const { logout, userProfile, session } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const email = session?.user?.email || '';

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 z-10 w-full">
        <TouchableOpacity className="w-12 h-12 items-center justify-center">
          <MaterialIcons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 flex-1 text-center">Admin Profile</Text>
        <TouchableOpacity className="w-12 h-12 items-center justify-center bg-transparent rounded-lg">
          <MaterialIcons name="notifications" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Info */}
        <View className="p-6 items-center">
          <View className="flex-col items-center gap-4">
            <View className="w-32 h-32 rounded-full border-4 border-primary/20 shadow-xl overflow-hidden bg-primary/10 items-center justify-center mb-2">
              {userProfile?.avatar_url ? (
                <Image
                  source={{ uri: userProfile.avatar_url }}
                  className="w-full h-full"
                />
              ) : (
                <Text className="font-black text-primary text-5xl">
                  {(userProfile?.full_name || 'C').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="items-center justify-center">
              <Text className="text-[24px] font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 text-center">{userProfile?.full_name || 'Coach'}</Text>
              <Text className="text-primary text-base font-semibold leading-normal text-center mt-1">Head Coach</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center mt-1">{email}</Text>
            </View>
          </View>
        </View>

        {/* Business Settings */}
        <View className="mb-4 mt-2">
          <Text className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 px-6 pb-2 pt-4 opacity-70">Business Settings</Text>
          
          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="workspace-premium" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Subscription Plan</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-normal mt-0.5">Active until Dec 2024</Text>
            </View>
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">PRO</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="group" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">My Athletes</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-normal mt-0.5">98 Active Trainees</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="payments" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Payment Methods</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-normal mt-0.5">Manage billing and payouts</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

        </View>

        {/* App Preferences */}
        <View className="mb-4 mt-2">
          <Text className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 px-6 pb-2 pt-4 opacity-70">App Preferences</Text>
          
          <View className="flex-row items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="dark-mode" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Dark Theme</Text>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              trackColor={{ false: "#cbd5e1", true: "#007fff" }}
              thumbColor={"#ffffff"}
            />
          </View>

          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="language" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Language</Text>
            </View>
            <Text className="text-slate-500 text-sm font-medium">English (US)</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="notifications-active" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Notifications</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

        </View>

        {/* Support */}
        <View className="mb-4 mt-2">
          <Text className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 px-6 pb-2 pt-4 opacity-70">Support</Text>
          
          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="help-center" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Help Center</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="description" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Terms of Service</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 px-6 py-4">
            <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="privacy-tip" size={24} color="#007fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Privacy Policy</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Account Actions */}
        <View className="px-6 py-8 flex-col gap-4">
          <TouchableOpacity className="w-full flex-row items-center justify-center gap-2 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent">
            <MaterialIcons name="lock-reset" size={20} color="#334155" />
            <Text className="text-slate-900 dark:text-slate-100 font-semibold">Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full flex-row items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20"
            onPress={logout}
          >
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold">Logout</Text>
          </TouchableOpacity>

          <Text className="text-center text-slate-500 text-xs mt-4">Version 2.4.0 (Build 892)</Text>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}
