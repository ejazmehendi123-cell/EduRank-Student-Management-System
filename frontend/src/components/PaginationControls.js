import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalElements,
  onPrev,
  onNext,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity
        onPress={onPrev}
        disabled={!hasPrev || isLoading}
        style={[styles.arrowButton, { opacity: hasPrev && !isLoading ? 1 : 0.3 }]}
      >
        <Ionicons name="chevron-back" size={20} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[typography.label, { color: theme.text }]}>
          Page {currentPage + 1} of {totalPages}
        </Text>
        {totalElements !== undefined && (
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            ({totalElements} total)
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={!hasNext || isLoading}
        style={[styles.arrowButton, { opacity: hasNext && !isLoading ? 1 : 0.3 }]}
      >
        <Ionicons name="chevron-forward" size={20} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
  },
  info: {
    alignItems: 'center',
  },
});

