import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { LeaderboardItem } from '../../components/LeaderboardItem';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { PaginationControls } from '../../components/PaginationControls';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchLeaderboard } from '../../features/leaderboard/leaderboardThunks';
import {
  selectLeaderboardEntries,
  selectLeaderboardPagination,
  selectLeaderboardLoading,
  selectLeaderboardError,
  selectCurrentStudentRank,
} from '../../features/leaderboard/leaderboardSelectors';
import { selectCurrentProfile } from '../../features/auth/authSelectors';
import { formatRank } from '../../utils/formatters';

export const StudentLeaderboardScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const entries = useAppSelector(selectLeaderboardEntries);
  const pagination = useAppSelector(selectLeaderboardPagination);
  const isLoading = useAppSelector(selectLeaderboardLoading);
  const error = useAppSelector(selectLeaderboardError);
  const currentRank = useAppSelector(selectCurrentStudentRank);
  const authProfile = useAppSelector(selectCurrentProfile);

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const loadData = async (page = 0) => {
    setCurrentPage(page);
    await dispatch(fetchLeaderboard({ page, size: 10, sort: 'totalPoints,desc' }));
  };

  useEffect(() => {
    loadData(0);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(0);
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Leaderboard"
        subtitle="Live academic rankings & competition scores"
        rightAction={<ThemeToggle />}
      />

      {/* Floating Rank Pill for Authenticated Student */}
      {currentRank && (
        <View style={[styles.rankBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>
            Your Current Standing:
          </Text>
          <View style={[styles.rankBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[typography.label, { color: theme.primary, fontWeight: '700' }]}>
              {formatRank(currentRank)}
            </Text>
          </View>
        </View>
      )}

      {error && <ErrorMessage message={error} onRetry={() => loadData(currentPage)} />}

      {isLoading && !refreshing && entries.length === 0 ? (
        <LoadingIndicator message="Fetching leaderboard rankings..." fullScreen />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.studentId.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <LeaderboardItem
              item={item}
              isCurrentStudent={authProfile?.id === item.studentId}
              isTeacher={false}
            />
          )}
          ListEmptyComponent={
            !isLoading && (
              <EmptyState
                icon="trophy-outline"
                title="No Rankings Available"
                description="Leaderboard will populate as students earn performance points."
              />
            )
          }
          ListFooterComponent={
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              onPrev={() => loadData(pagination.page - 1)}
              onNext={() => loadData(pagination.page + 1)}
              isLoading={isLoading}
            />
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
  rankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  rankBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

