import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { formatPoints, formatRank } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const LeaderboardItem = ({
  item,
  isCurrentStudent = false,
  isTeacher = false,
  onAwardPress,
  onPress,
}) => {
  const { theme } = useTheme();

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return theme.gold;
      case 2: return theme.silver;
      case 3: return theme.bronze;
      default: return theme.surface;
    }
  };

  const getRankTextColor = (rank) => {
    if (rank <= 3) return '#FFFFFF';
    return theme.textSecondary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: isCurrentStudent ? (theme.mode === 'dark' ? '#1E3A8A' : '#EFF6FF') : theme.card,
          borderColor: isCurrentStudent ? theme.primary : theme.border,
        },
      ]}
    >
      {/* Rank Indicator */}
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor: getRankBadgeColor(item.rank),
            borderWidth: item.rank > 3 ? 1 : 0,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[typography.label, { color: getRankTextColor(item.rank), fontWeight: '700' }]}>
          {item.rank}
        </Text>
      </View>

      {/* Student Details */}
      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text style={[typography.label, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {isCurrentStudent && (
            <View style={[styles.youBadge, { backgroundColor: theme.primary }]}>
              <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={[typography.caption, { color: theme.textSecondary }]}>
          {item.rollNumber} • {item.department} (Sem {item.semester})
        </Text>
      </View>

      {/* Points & Action */}
      <View style={styles.rightSection}>
        <Text style={[typography.label, { color: theme.primary, fontWeight: '700' }]}>
          {formatPoints(item.totalPoints)}
        </Text>
        {isTeacher && (
          <TouchableOpacity
            onPress={onAwardPress}
            style={[styles.awardIconBtn, { backgroundColor: theme.primaryLight }]}
          >
            <Ionicons name="add" size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  awardIconBtn: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

