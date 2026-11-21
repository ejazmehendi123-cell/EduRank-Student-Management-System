import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const SplashScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
        <Ionicons name="school" size={54} color="#FFFFFF" />
      </View>
      <Text style={[typography.h1, { color: theme.text, marginTop: 18 }]}>EduRank</Text>
      <Text style={[typography.bodyMedium, { color: theme.textSecondary, marginTop: 6 }]}>
        Student Management & Leaderboard
      </Text>
      <ActivityIndicator size="large" color={theme.primary} style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  spinner: {
    marginTop: 36,
  },
});

