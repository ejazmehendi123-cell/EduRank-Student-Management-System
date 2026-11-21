import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser, selectCurrentProfile } from '../../features/auth/authSelectors';
import { fetchMyProfile } from '../../features/students/studentThunks';
import { fetchPointsHistory } from '../../features/points/pointsThunks';
import { formatPoints, formatRank, formatDate } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const StudentDashboard = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const authProfile = useAppSelector(selectCurrentProfile);

  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(authProfile);
  const [recentHistory, setRecentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setError(null);
    try {
      const [profileRes, historyRes] = await Promise.all([
        dispatch(fetchMyProfile()).unwrap(),
        dispatch(fetchPointsHistory(null)).unwrap(),
      ]);
      setProfileData(profileRes);
      setRecentHistory(historyRes.slice(0, 5));
    } catch (err) {
      setError(err || 'Failed to load dashboard data');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadDashboardData().finally(() => setIsLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const student = profileData || authProfile || {};

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Student Portal"
        subtitle={`Welcome, ${user?.name || 'Student'}`}
        rightAction={<ThemeToggle />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      >
        {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

        {isLoading && !refreshing ? (
          <LoadingIndicator message="Loading your dashboard..." />
        ) : (
          <>
            {/* Top Overview Metric Card */}
            <View style={[styles.metricsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>TOTAL POINTS</Text>
                  <Text style={[typography.h1, { color: theme.primary, marginTop: 4 }]}>
                    {formatPoints(student.totalPoints)}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.metricItem}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>LEADERBOARD RANK</Text>
                  <Text style={[typography.h1, { color: theme.gold, marginTop: 4 }]}>
                    {formatRank(student.rank)}
                  </Text>
                </View>
              </View>

              <View style={[styles.profileMeta, { borderTopColor: theme.border }]}>
                <View style={styles.metaCol}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>Roll No</Text>
                  <Text style={[typography.bodyMedium, { color: theme.text, fontWeight: '600' }]}>
                    {student.rollNumber || 'N/A'}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>Department</Text>
                  <Text style={[typography.bodyMedium, { color: theme.text, fontWeight: '600' }]}>
                    {student.department || 'N/A'}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>Semester</Text>
                  <Text style={[typography.bodyMedium, { color: theme.text, fontWeight: '600' }]}>
                    Sem {student.semester || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions Navigation Cards */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LeaderboardTab')}
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="trophy-outline" size={24} color={theme.primary} />
                </View>
                <Text style={[typography.label, { color: theme.text, marginTop: 8 }]}>Leaderboard</Text>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>View Rankings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileTab')}
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons name="person-outline" size={24} color={theme.secondary} />
                </View>
                <Text style={[typography.label, { color: theme.text, marginTop: 8 }]}>My Profile</Text>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>View Info</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions Section */}
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: theme.text }]}>Recent Points History</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PointsHistory')}>
                <Text style={[typography.caption, { color: theme.primary, fontWeight: '700' }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {recentHistory.length === 0 ? (
              <EmptyState
                icon="time-outline"
                title="No Transactions Yet"
                description="Points awarded or adjusted by your teachers will appear here."
              />
            ) : (
              recentHistory.map((item) => (
                <View
                  key={item.id}
                  style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View
                    style={[
                      styles.historyIcon,
                      {
                        backgroundColor: item.points >= 0 ? theme.successLight : theme.dangerLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.points >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={18}
                      color={item.points >= 0 ? theme.success : theme.danger}
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={[typography.label, { color: theme.text }]}>{item.reason}</Text>
                    <Text style={[typography.caption, { color: theme.textSecondary }]}>
                      By {item.teacherName} • {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.label,
                      {
                        color: item.points >= 0 ? theme.success : theme.danger,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {item.points >= 0 ? `+${item.points}` : item.points} pts
                  </Text>
                </View>
              ))
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
  metricsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 48,
  },
  profileMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  metaCol: {
    alignItems: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
});

