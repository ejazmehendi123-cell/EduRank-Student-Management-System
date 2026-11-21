import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

export const EmptyState = ({
  icon = 'file-tray-outline',
  title = 'No Data Found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name={icon} size={48} color={theme.textMuted} />
      </View>
      <Text style={[typography.h3, styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[typography.bodyMedium, styles.description, { color: theme.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    minWidth: 150,
  },
});

