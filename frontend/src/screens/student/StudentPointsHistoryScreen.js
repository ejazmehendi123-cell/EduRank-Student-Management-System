import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { useAppDispatch } from '../../app/hooks';
import { fetchPointsHistory } from '../../features/points/pointsThunks';
import { formatDate } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const StudentPointsHistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setError(null);
    try {
      const data = await dispatch(fetchPointsHistory(null)).unwrap();
      setHistory(data);
    } catch (err) {
      setError(err || 'Failed to fetch points history');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadHistory().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Points History"
        subtitle="Complete record of points awarded & adjusted"
        showBack
        onBack={() => navigation.goBack()}
      />

      {error && <ErrorMessage message={error} onRetry={loadHistory} />}

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading transaction history..." fullScreen />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: item.points >= 0 ? theme.successLight : theme.dangerLight },
                ]}
              >
                <Ionicons
                  name={item.points >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={item.points >= 0 ? theme.success : theme.danger}
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <Text style={[typography.label, { color: theme.text, flex: 1 }]}>
                    {item.reason}
                  </Text>
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

                <View style={styles.metaRow}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    Awarded by: {item.teacherName}
                  </Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading && (
              <EmptyState
                icon="receipt-outline"
                title="No History Yet"
                description="You haven't received any point transactions yet."
              />
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});

