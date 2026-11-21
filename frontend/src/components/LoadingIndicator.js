import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';

export const LoadingIndicator = ({ message = 'Loading...', fullScreen = false }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: fullScreen ? theme.background : 'transparent' }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      {message && (
        <Text style={[typography.bodyMedium, styles.text, { color: theme.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    marginTop: 12,
  },
});

