import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
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
} from '../../features/leaderboard/leaderboardSelectors';

export const TeacherLeaderboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const entries = useAppSelector(selectLeaderboardEntries);
  const pagination = useAppSelector(selectLeaderboardPagination);
  const isLoading = useAppSelector(selectLeaderboardLoading);
  const error = useAppSelector(selectLeaderboardError);

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
        title="Official Leaderboard"
        subtitle="Live competition rankings & direct awards"
        rightAction={<ThemeToggle />}
      />

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
              isTeacher={true}
              onPress={() => navigation.navigate('StudentDetails', { studentId: item.studentId })}
              onAwardPress={() => navigation.navigate('AwardPoints', { student: { id: item.studentId, name: item.name, rollNumber: item.rollNumber, totalPoints: item.totalPoints } })}
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

