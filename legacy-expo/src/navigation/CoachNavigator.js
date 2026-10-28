import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

// Screens
import CoachDashboard from '../screens/coach/CoachDashboard';
import RoutineCreator from '../screens/coach/RoutineCreator';
import DietCreator from '../screens/coach/DietCreator';
import PaymentManagement from '../screens/coach/PaymentManagement';

import AthleteDetail from '../screens/coach/AthleteDetail';
import Insights from '../screens/coach/Insights';
import AdminProfile from '../screens/coach/AdminProfile';
import AssignAthletesScreen from '../screens/coach/AssignAthletesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CoachTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarActiveTintColor: '#007fff',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen 
        name="Athletes" 
        component={CoachDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Workouts" 
        component={RoutineCreator} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Diets" 
        component={DietCreator} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentManagement} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="payments" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function CoachNavigator() {
  // The StackNavigator allows pushing detail screens over the tabs
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoachMainTabs" component={CoachTabs} />
      <Stack.Screen name="AthleteDetail" component={AthleteDetail} />
      <Stack.Screen name="Insights" component={Insights} />
      <Stack.Screen name="AdminProfile" component={AdminProfile} />
      <Stack.Screen name="AssignAthletes" component={AssignAthletesScreen} />
    </Stack.Navigator>
  );
}
