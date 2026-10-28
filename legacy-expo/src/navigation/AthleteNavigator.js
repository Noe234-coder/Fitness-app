import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

// Screens
import AthleteDashboard from '../screens/athlete/AthleteDashboard';
import MacrosDietPlan from '../screens/athlete/MacrosDietPlan';
import DailyTracking from '../screens/athlete/DailyTracking';
import AthleteProfile from '../screens/athlete/AthleteProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AthleteTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff', // Will adapt for dark mode later
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarActiveTintColor: '#007fff',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen 
        name="Training" 
        component={AthleteDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Diet" 
        component={MacrosDietPlan} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={DailyTracking} 
        options={{
          tabBarLabel: 'Compliance',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="insert-chart" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={AthleteProfile} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function AthleteNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AthleteMainTabs" component={AthleteTabs} />
      {/* We can add sub-screens here if needed for the athlete */}
    </Stack.Navigator>
  );
}
