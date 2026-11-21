import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { formatPoints, formatRank } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const StudentCard = ({
  student,
  onPress,
  onAwardPress,
  showAwardButton = false,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <Text style={[typography.h3, { color: theme.primary }]}>
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={[typography.label, { color: theme.text }]}>{student.name}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {student.rollNumber} • {student.department}
            </Text>
          </View>
        </View>

        <View style={styles.pointsBadge}>
          <Text style={[typography.label, { color: theme.primary }]}>
            {formatPoints(student.totalPoints)}
          </Text>
          {student.rank && (
            <Text style={[typography.caption, { color: theme.textSecondary, textAlign: 'right' }]}>
              {formatRank(student.rank)}
            </Text>
          )}
        </View>
      </View>

      {showAwardButton && (
        <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={onAwardPress}
            style={[styles.awardButton, { backgroundColor: theme.primaryLight }]}
          >
            <Ionicons name="gift-outline" size={16} color={theme.primary} />
            <Text style={[typography.caption, { color: theme.primary, marginLeft: 6, fontWeight: '700' }]}>
              Award / Adjust Points
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  pointsBadge: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  actionRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  awardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});

