import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeacherDashboard } from '../screens/teacher/TeacherDashboard';
import { StudentManagementScreen } from '../screens/teacher/StudentManagementScreen';
import { TeacherLeaderboardScreen } from '../screens/teacher/TeacherLeaderboardScreen';
import { AwardPointsScreen } from '../screens/teacher/AwardPointsScreen';
import { StudentDetailsScreen } from '../screens/teacher/StudentDetailsScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TeacherTabs = () => {
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
          if (route.name === 'TeacherDashboardTab') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'StudentManagementTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'TeacherLeaderboardTab') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TeacherDashboardTab" component={TeacherDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="StudentManagementTab" component={StudentManagementScreen} options={{ title: 'Students' }} />
      <Tab.Screen name="TeacherLeaderboardTab" component={TeacherLeaderboardScreen} options={{ title: 'Leaderboard' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export const TeacherNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherMain" component={TeacherTabs} />
      <Stack.Screen name="AwardPoints" component={AwardPointsScreen} />
      <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    </Stack.Navigator>
  );
};

