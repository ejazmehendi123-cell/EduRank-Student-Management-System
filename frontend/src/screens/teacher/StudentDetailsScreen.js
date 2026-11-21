import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { useAppDispatch } from '../../app/hooks';
import { fetchStudentById } from '../../features/students/studentThunks';
import { fetchPointsHistory } from '../../features/points/pointsThunks';
import { formatPoints, formatRank, formatDate } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const StudentDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const studentId = route.params?.studentId;

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setError(null);
    try {
      const [studentData, historyData] = await Promise.all([
        dispatch(fetchStudentById(studentId)).unwrap(),
        dispatch(fetchPointsHistory(studentId)).unwrap(),
      ]);
      setStudent(studentData);
      setHistory(historyData);
    } catch (err) {
      setError(err || 'Failed to load student details');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [studentId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Student Details"
        subtitle={student?.name || 'Academic Record'}
        showBack
        onBack={() => navigation.goBack()}
      />

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading profile & records..." fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        >
          {/* Student Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.topInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                <Text style={[typography.h1, { color: theme.primary }]}>
                  {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </Text>
              </View>
              <View style={styles.metaInfo}>
                <Text style={[typography.h2, { color: theme.text }]}>{student?.name}</Text>
                <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>{student?.email}</Text>
                <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                  {student?.rollNumber} • {student?.department}
                </Text>
              </View>
            </View>

            <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
              <View style={styles.statCol}>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>TOTAL POINTS</Text>
                <Text style={[typography.h2, { color: theme.primary, marginTop: 2 }]}>
                  {formatPoints(student?.totalPoints)}
                </Text>
              </View>

              <View style={[styles.vertDivider, { backgroundColor: theme.border }]} />

              <View style={styles.statCol}>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>CLASS RANK</Text>
                <Text style={[typography.h2, { color: theme.gold, marginTop: 2 }]}>
                  {formatRank(student?.rank)}
                </Text>
              </View>

              <View style={[styles.vertDivider, { backgroundColor: theme.border }]} />

              <View style={styles.statCol}>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>SEMESTER</Text>
                <Text style={[typography.h2, { color: theme.text, marginTop: 2 }]}>
                  Sem {student?.semester || '-'}
                </Text>
              </View>
            </View>

            {/* Quick Point Action Button */}
            <Button
              title="Award or Adjust Points"
              variant="primary"
              icon={<Ionicons name="gift-outline" size={18} color="#FFFFFF" />}
              onPress={() => navigation.navigate('AwardPoints', { student })}
              style={styles.awardBtn}
            />
          </View>

          {/* Points History Section */}
          <View style={styles.sectionTitleRow}>
            <Text style={[typography.h3, { color: theme.text }]}>Transaction History</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {history.length} transactions
            </Text>
          </View>

          {history.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No Points History"
              description="This student has not received any point transactions yet."
            />
          ) : (
            history.map((tx) => (
              <View
                key={tx.id}
                style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View
                  style={[
                    styles.txBadge,
                    { backgroundColor: tx.points >= 0 ? theme.successLight : theme.dangerLight },
                  ]}
                >
                  <Ionicons
                    name={tx.points >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={18}
                    color={tx.points >= 0 ? theme.success : theme.danger}
                  />
                </View>

                <View style={styles.txInfo}>
                  <Text style={[typography.label, { color: theme.text }]}>{tx.reason}</Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    By {tx.teacherName} • {formatDate(tx.createdAt)}
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
          )}
        </ScrollView>
      )}
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
  profileCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  topInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metaInfo: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  vertDivider: {
    width: 1,
    height: 40,
  },
  awardBtn: {
    marginTop: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  txBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
});

