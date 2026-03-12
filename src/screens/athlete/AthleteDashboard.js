import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useColorScheme } from 'nativewind';
  
export default function AthleteDashboard() {

  const {colorScheme, toggleColorScheme} = useColorScheme();

  const days = [
    { day: 'Mon', date: '12', active: false },
    { day: 'Tue', date: '13', active: false },
    { day: 'Wed', date: '14', active: true },
    { day: 'Thu', date: '15', active: false },
    { day: 'Fri', date: '16', active: false },
    { day: 'Sat', date: '17', active: false },
    { day: 'Sun', date: '18', active: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
      {/* Header & Progress */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Today's Session</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">Push Day • Phase 2</Text>
          </View>
          
          {/* Contenedor derecho: Botón modo oscuro + Progreso SVG */}
          <View className="flex-row items-center gap-4">
            
            {/* BOTÓN DE MODO OSCURO */}
            <TouchableOpacity 
              onPress={toggleColorScheme}
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              <MaterialIcons 
                name={colorScheme === 'dark' ? 'light-mode' : 'dark-mode'} 
                size={22} 
                color={colorScheme === 'dark' ? '#fbbf24' : '#64748b'} 
              />
            </TouchableOpacity>

            {/* CÍRCULO DE PROGRESO */}
            <View className="relative items-center justify-center w-12 h-12">
              <Svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                  cx="24" cy="24" r="20"
                  strokeWidth="4" fill="transparent"
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <Circle
                  cx="24" cy="24" r="20"
                  strokeWidth="4" fill="transparent"
                  strokeDasharray="125.6" strokeDashoffset="44"
                  className="stroke-primary"
                />
              </Svg>
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-[10px] font-bold text-slate-900 dark:text-white">65%</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Week Calendar Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-20">
          <View className="flex-row gap-2">
            {days.map((d, index) => (
              <View 
                key={index} 
                className={`items-center justify-center min-w-[50px] p-2 rounded-xl ${d.active ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800/50'}`}
              >
                <Text className={`text-xs uppercase mb-1 ${d.active ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{d.day}</Text>
                <Text className={`text-sm font-bold ${d.active ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{d.date}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Exercises List */}
        <View className="w-full">
          {/* Exercise Card 1 */}
          <View className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden mb-4">
            <View className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex-row justify-between items-start">
              <View>
                <Text className="font-bold text-lg text-slate-900 dark:text-slate-100">Incline Bench Press</Text>
                <Text className="text-xs text-primary font-medium mt-1">4 Sets • 8-10 Reps • RIR 1</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="info" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View className="p-4">
              {/* Set Row 1 */}
              <View className="flex-row items-center mb-3">
                <Text className="w-6 text-xs font-bold text-slate-500 text-center">1</Text>
                <TextInput 
                  className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 h-10 ml-2" 
                  placeholder="kg" placeholderTextColor="#94a3b8" keyboardType="numeric" defaultValue="80" 
                />
                <TextInput 
                  className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 h-10 mx-2" 
                  placeholder="reps" placeholderTextColor="#94a3b8" keyboardType="numeric" defaultValue="10" 
                />
                <TouchableOpacity className="bg-primary w-10 h-10 rounded-lg items-center justify-center">
                  <MaterialIcons name="check" size={16} color="white" />
                </TouchableOpacity>
              </View>
              {/* Set Row 2 */}
              <View className="flex-row items-center">
                <Text className="w-6 text-xs font-bold text-slate-500 text-center">2</Text>
                <TextInput 
                  className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 h-10 ml-2" 
                  placeholder="kg" placeholderTextColor="#94a3b8" keyboardType="numeric" defaultValue="80" 
                />
                <TextInput 
                  className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 h-10 mx-2" 
                  placeholder="reps" placeholderTextColor="#94a3b8" keyboardType="numeric" 
                />
                <TouchableOpacity className="bg-slate-200 dark:bg-slate-700 w-10 h-10 rounded-lg items-center justify-center">
                  <MaterialIcons name="check" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Exercise Card 2 */}
          <View className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden mb-4">
            <View className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex-row justify-between items-start">
              <View>
                <Text className="font-bold text-lg text-slate-900 dark:text-slate-100">Dumbbell Lateral Raise</Text>
                <Text className="text-xs text-primary font-medium mt-1">3 Sets • 12-15 Reps • RPE 9</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="info" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View className="p-4">
              <View className="flex-row items-center">
                <Text className="w-6 text-xs font-bold text-slate-500 text-center">1</Text>
                <TextInput 
                  className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 h-10 ml-2" 
                  placeholder="kg" placeholderTextColor="#94a3b8" keyboardType="numeric" 
                />
                <TextInput 
                  className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white py-2 px-3 h-10 mx-2" 
                  placeholder="reps" placeholderTextColor="#94a3b8" keyboardType="numeric" 
                />
                <TouchableOpacity className="bg-slate-200 dark:bg-slate-700 w-10 h-10 rounded-lg items-center justify-center">
                  <MaterialIcons name="check" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Exercise Card 3 */}
          <View className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden mb-4">
            <View className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex-row justify-between items-start">
              <View>
                <Text className="font-bold text-lg text-slate-900 dark:text-slate-100">Tricep Pushdowns</Text>
                <Text className="text-xs text-primary font-medium mt-1">4 Sets • 10-12 Reps • RIR 0</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="info" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View className="p-4 opacity-60">
              <View className="flex-row items-center py-2">
                <Text className="w-6 text-xs font-bold text-slate-500 text-center">...</Text>
                <Text className="flex-1 text-center text-sm italic text-slate-500 dark:text-slate-400">Complete previous exercises first</Text>
              </View>
            </View>
          </View>

          {/* Finish Workout Button */}
          <TouchableOpacity className="w-full py-4 bg-primary rounded-xl shadow-md items-center justify-center mt-2 mb-6 active:bg-blue-600">
            <Text className="text-white font-bold text-base">Finish Workout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
