import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { StudentCard } from '../../components/StudentCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { PaginationControls } from '../../components/PaginationControls';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllStudents } from '../../features/students/studentThunks';
import {
  selectStudentsList,
  selectStudentsPagination,
  selectStudentLoading,
  selectStudentError,
} from '../../features/students/studentSelectors';
import { Ionicons } from '@expo/vector-icons';

export const StudentManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectStudentsList);
  const pagination = useAppSelector(selectStudentsPagination);
  const isLoading = useAppSelector(selectStudentLoading);
  const error = useAppSelector(selectStudentError);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const loadStudents = async (page = 0) => {
    setCurrentPage(page);
    await dispatch(fetchAllStudents({ page, size: 20 }));
  };

  useEffect(() => {
    loadStudents(0);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents(0);
    setRefreshing(false);
  };

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(query) ||
      s.rollNumber?.toLowerCase().includes(query) ||
      s.department?.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Student Roster"
        subtitle="Manage enrolled students & awards"
        rightAction={<ThemeToggle />}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by name, roll no, or department..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={theme.textMuted} />}
          style={styles.searchInput}
        />
      </View>

      {error && <ErrorMessage message={error} onRetry={() => loadStudents(currentPage)} />}

      {isLoading && !refreshing && students.length === 0 ? (
        <LoadingIndicator message="Loading students list..." fullScreen />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              showAwardButton
              onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
              onAwardPress={() => navigation.navigate('AwardPoints', { student: item })}
            />
          )}
          ListEmptyComponent={
            !isLoading && (
              <EmptyState
                icon="people-outline"
                title="No Students Found"
                description={searchQuery ? 'No matching students found for your search.' : 'No registered students in database.'}
              />
            )
          }
          ListFooterComponent={
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              onPrev={() => loadStudents(pagination.page - 1)}
              onNext={() => loadStudents(pagination.page + 1)}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});

