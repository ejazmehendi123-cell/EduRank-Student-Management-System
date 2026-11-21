import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const ThemeToggle = ({ showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={20}
        color={isDark ? theme.gold : theme.primary}
      />
      {showLabel && (
        <Text style={[typography.bodyMedium, styles.label, { color: theme.text }]}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    marginLeft: 8,
    fontWeight: '600',
  },
});

