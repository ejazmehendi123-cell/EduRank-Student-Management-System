import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentDashboard } from '../screens/student/StudentDashboard';
import { StudentLeaderboardScreen } from '../screens/student/StudentLeaderboardScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';
import { StudentPointsHistoryScreen } from '../screens/student/StudentPointsHistoryScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StudentTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LeaderboardTab') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={StudentDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="LeaderboardTab" component={StudentLeaderboardScreen} options={{ title: 'Leaderboard' }} />
      <Tab.Screen name="ProfileTab" component={StudentProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export const StudentNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentMain" component={StudentTabs} />
      <Stack.Screen name="PointsHistory" component={StudentPointsHistoryScreen} />
    </Stack.Navigator>
  );
};

