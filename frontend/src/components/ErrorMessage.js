import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const ErrorMessage = ({ message, onRetry, style }) => {
  const { theme } = useTheme();

  if (!message) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.dangerLight, borderColor: theme.danger }, style]}>
      <Ionicons name="alert-circle" size={22} color={theme.danger} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[typography.bodyMedium, { color: theme.danger }]}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={[typography.label, { color: theme.danger, textDecorationLine: 'underline' }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  retryButton: {
    marginTop: 6,
  },
});

