import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Paid', 'Pending', 'Overdue'];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 z-10 w-full">
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="payments" size={24} color="#007fff" />
          <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Finances</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <MaterialIcons name="search" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Financial Overview Cards */}
        <View className="p-4 flex-row gap-4">
          <View className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Revenue</Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">$14,250</Text>
            <View className="flex-row items-center gap-1 mt-2">
              <MaterialIcons name="trending-up" size={16} color="#10b981" />
              <Text className="text-xs font-semibold text-emerald-500">+12.5%</Text>
            </View>
          </View>
          <View className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending</Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">$2,100</Text>
            <View className="flex-row items-center gap-1 mt-2">
              <MaterialIcons name="schedule" size={16} color="#007fff" />
              <Text className="text-xs font-semibold text-primary">8 Invoices</Text>
            </View>
          </View>
        </View>

        {/* Filters/Tabs */}
        <View className="border-b border-slate-200 dark:border-slate-800 mb-4 px-4 sticky top-0 z-10 bg-background-light dark:bg-background-dark/90 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {tabs.map(tab => (
                <TouchableOpacity 
                  key={tab} 
                  onPress={() => setActiveTab(tab)}
                  className={`px-4 py-3 ${activeTab === tab ? 'border-b-2 border-primary' : ''}`}
                >
                  <Text className={`text-sm ${activeTab === tab ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Athlete Payment List */}
        <View className="p-4 space-y-4">
          
          {/* Payment Card: Paid */}
          <View className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex-col mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEebyrl7GaWNBeO_P1q7QzucqrAbTunrrIy5QDIsDluFUHDBqcFLSBlWQi8ze-kpgZ1twZKD9-eYnXOBNa_bwczSrbaEVP20s9ERL3KdCyk4KASVP__Dlpl9UecAXdJNP6BILIcB5YHyXTgioYb7tM4x27jFsf2PNsn0AGosp_9x6uNk9kLbM7-CukRS7pNBRqKS7Z92TCLbnw5hheWsSmobv9Aqi0fYENQOXNmeKKDYa37tgXZ5_wbWKJkBslVGCg5CPngT47uc4' }} className="w-full h-full" />
                </View>
                <View>
                  <Text className="font-bold text-slate-900 dark:text-white">Marcus Aurelius</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1 mt-0.5">Annual Plan • $1,200.00</Text>
                </View>
              </View>
              <View className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Text className="text-emerald-500 text-[10px] font-bold uppercase">Paid</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Due: <Text className="font-medium text-slate-700 dark:text-slate-200">Dec 01, 2023</Text>
              </Text>
              <TouchableOpacity className="flex-row items-center gap-1">
                <MaterialIcons name="visibility" size={16} color="#007fff" />
                <Text className="text-xs font-bold text-primary">View Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Card: Overdue */}
          <View className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 flex-col mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCALPxs-yY7fXBl5fxUoXWUWWWugEWWP7L_NhI46F44-gHhITRcM-z_sms68BmzvTc7xy7THyRSJ29QC7WUVhe9DzeM5KXMCjSGTPU15knXqJ-HVjbEX1_-zruqPbK8gyk8PldliiLS858L_YQuhRfLeoZP5taCftLpefV5gdY770B6MDqmIoVn4z6eCBHar6XQs5sRBKQNA7r0SiCsaCjkXTwEEBCcj-gSvgtb9-qv98pZLhcBCahxE_D10YO6o4MZd4skl70EqMA' }} className="w-full h-full" />
                </View>
                <View>
                  <Text className="font-bold text-slate-900 dark:text-white">David Goggins</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1 mt-0.5">Monthly Plan • $150.00</Text>
                </View>
              </View>
              <View className="px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Text className="text-amber-500 text-[10px] font-bold uppercase">Overdue</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Due: <Text className="font-medium text-amber-500">Nov 15, 2023</Text>
              </Text>
              <TouchableOpacity className="bg-amber-500 px-4 py-2 rounded-lg flex-row items-center gap-2">
                <MaterialIcons name="notifications" size={16} color="white" />
                <Text className="text-white text-xs font-bold">Send Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Card: Upcoming */}
          <View className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-primary flex-col mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5L2yTwzlqUhLq25VgXkGHfedeEFxoaZwXswo_vDJi3JW0FsbDCej7vWoB1GvVacePwmzlgfhR_DV-SPlF5EEn_QQA_4MLrhLNdItlO_V_kibJokVLHMlniNiT6O9i8cHhLteMHgxZCYeFJkjM4C9bXAAB_Px72FLVf0FGk1Rq8foYKqtECewCEL-CZatB9moktX6t3vctK0KxbeBpJJ8_Ohpr26UavoMs8a4fZmNb49zGPkdOn8UHSDbfnKDQOtqT85-aEugW988' }} className="w-full h-full" />
                </View>
                <View>
                  <Text className="font-bold text-slate-900 dark:text-white">Sarah Chen</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1 mt-0.5">Quarterly Plan • $400.00</Text>
                </View>
              </View>
              <View className="px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
                <Text className="text-primary text-[10px] font-bold uppercase">Upcoming</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Due: <Text className="font-medium text-slate-700 dark:text-slate-200">Dec 12, 2023</Text>
              </Text>
              <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2">
                <MaterialIcons name="check-circle" size={16} color="white" />
                <Text className="text-white text-xs font-bold">Mark as Paid</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Card: Overdue #2 */}
          <View className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 flex-col mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtdLZEzL4JLKmY5KngqJEeoM7tDYEmWr2ksp6wnJFCYi084KdEAT25pXmWXJXzY5QfHIYJdfgEqDLyrO1zcQkTc0CI7D7oDoGx44qFY1E5GYyqxhEMpGbm_JM0mhNMfuCD2eHYTghjm08wmrSAo1jsnZdNlXFY2l1V9ZSsKe4mrRPtPwiqXhkYKPQ9uEAM5vZAXG2EZxfTY85ojuVxwxHIQQzbVyWRU5rc2J7kt2Aqs0JoVZwwx807lf4HntMRnX3HidAA-cJLwSM' }} className="w-full h-full" />
                </View>
                <View>
                  <Text className="font-bold text-slate-900 dark:text-white">James Bond</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1 mt-0.5">Monthly Plan • $150.00</Text>
                </View>
              </View>
              <View className="px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Text className="text-amber-500 text-[10px] font-bold uppercase">Overdue</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Due: <Text className="font-medium text-amber-500">Nov 20, 2023</Text>
              </Text>
              <TouchableOpacity className="bg-amber-500 px-4 py-2 rounded-lg flex-row items-center gap-2">
                <MaterialIcons name="notifications" size={16} color="white" />
                <Text className="text-white text-xs font-bold">Send Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}
