import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSelectors';
import api from '../../services/api';
import { formatPoints, formatRank, formatDate } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const TeacherDashboard = ({ navigation }) => {
  const { theme } = useTheme();
  const user = useAppSelector(selectCurrentUser);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setError(null);
    try {
      const response = await api.get('/teacher/dashboard');
      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teacher dashboard');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Teacher Portal"
        subtitle={`Welcome, ${user?.name || 'Faculty'}`}
        rightAction={<ThemeToggle />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      >
        {error && <ErrorMessage message={error} onRetry={loadData} />}

        {loading && !refreshing ? (
          <LoadingIndicator message="Loading faculty dashboard..." />
        ) : (
          <>
            {/* Quick Stat Cards */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="people-outline" size={24} color={theme.primary} />
                </View>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 8 }]}>
                  ENROLLED STUDENTS
                </Text>
                <Text style={[typography.h2, { color: theme.text, marginTop: 2 }]}>
                  {dashboard?.totalStudents || 0}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="gift-outline" size={24} color={theme.success} />
                </View>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 8 }]}>
                  POINTS DISTRIBUTED
                </Text>
                <Text style={[typography.h2, { color: theme.text, marginTop: 2 }]}>
                  {formatPoints(dashboard?.totalPointsAwarded)}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionRow}>
              <Button
                title="Manage Students"
                variant="primary"
                icon={<Ionicons name="school-outline" size={18} color="#FFFFFF" />}
                onPress={() => navigation.navigate('StudentManagementTab')}
                style={styles.actionBtn}
              />
              <Button
                title="Leaderboard"
                variant="outline"
                icon={<Ionicons name="trophy-outline" size={18} color={theme.primary} />}
                onPress={() => navigation.navigate('TeacherLeaderboardTab')}
                style={styles.actionBtn}
              />
            </View>

            {/* Top Performing Students */}
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: theme.text }]}>Top Performing Students</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TeacherLeaderboardTab')}>
                <Text style={[typography.caption, { color: theme.primary, fontWeight: '700' }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {dashboard?.topPerformers?.length ? (
              dashboard.topPerformers.map((student) => (
                <TouchableOpacity
                  key={student.studentId}
                  onPress={() => navigation.navigate('StudentDetails', { studentId: student.studentId })}
                  style={[styles.performerCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={[styles.rankBadge, { backgroundColor: student.rank === 1 ? theme.gold : theme.surface }]}>
                    <Text style={[typography.label, { color: student.rank === 1 ? '#FFFFFF' : theme.textSecondary, fontWeight: '700' }]}>
                      {student.rank}
                    </Text>
                  </View>
                  <View style={styles.performerInfo}>
                    <Text style={[typography.label, { color: theme.text }]}>{student.name}</Text>
                    <Text style={[typography.caption, { color: theme.textSecondary }]}>
                      {student.rollNumber} • {student.department}
                    </Text>
                  </View>
                  <Text style={[typography.label, { color: theme.primary, fontWeight: '700' }]}>
                    {formatPoints(student.totalPoints)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[typography.bodyMedium, { color: theme.textMuted, fontStyle: 'italic', marginVertical: 10 }]}>
                No student rankings yet.
              </Text>
            )}

            {/* Recent Point Awards */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={[typography.h3, { color: theme.text }]}>Recent Point Activity</Text>
            </View>

            {dashboard?.recentTransactions?.length ? (
              dashboard.recentTransactions.map((tx) => (
                <View
                  key={tx.id}
                  style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={[styles.badge, { backgroundColor: tx.points >= 0 ? theme.successLight : theme.dangerLight }]}>
                    <Ionicons
                      name={tx.points >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={18}
                      color={tx.points >= 0 ? theme.success : theme.danger}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[typography.label, { color: theme.text }]}>
                      {tx.studentName} ({tx.studentRollNumber})
                    </Text>
                    <Text style={[typography.caption, { color: theme.textSecondary }]}>
                      {tx.reason} • {formatDate(tx.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.label,
                      { color: tx.points >= 0 ? theme.success : theme.danger, fontWeight: '700' },
                    ]}
                  >
                    {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[typography.bodyMedium, { color: theme.textMuted, fontStyle: 'italic', marginVertical: 10 }]}>
                No point transactions recorded yet.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  performerInfo: {
    flex: 1,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
});

