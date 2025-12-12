import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PTTabParamList } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import PTHomeTabScreen from '../screens/tabs/pt/PTHomeTabScreen';
import TeachingScheduleTabScreen from '../screens/tabs/pt/TeachingScheduleTabScreen';
import PTClassesTabScreen from '../screens/tabs/pt/PTClassesTabScreen';
import MembershipTabScreen from '../screens/tabs/shared/MembershipTabScreen';
import ProfileScreen from '../screens/tabs/shared/ProfileScreen';

const Tab = createBottomTabNavigator<PTTabParamList>();

export default function PTBottomTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#16697A',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 56 + insets.bottom,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="PTHomeTab"
        component={PTHomeTabScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TeachingScheduleTab"
        component={TeachingScheduleTabScreen}
        options={{
          tabBarLabel: 'Lịch dạy',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PTClassesTab"
        component={PTClassesTabScreen}
        options={{
          tabBarLabel: 'Lớp học',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MembershipTab"
        component={MembershipTabScreen}
        options={{
          tabBarLabel: 'Gói tập',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
