import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser, selectCurrentProfile } from '../../features/auth/authSelectors';
import { logoutUser } from '../../features/auth/authThunks';
import { fetchMyProfile } from '../../features/students/studentThunks';
import { formatPoints, formatRank } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const StudentProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const authProfile = useAppSelector(selectCurrentProfile);

  const [profile, setProfile] = useState(authProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await dispatch(fetchMyProfile()).unwrap();
      setProfile(res);
    } catch (e) {
      // fallback to authProfile
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProfile().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const currentProfile = profile || authProfile || {};

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Student Profile"
        subtitle="Your academic credentials"
        rightAction={<ThemeToggle />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      >
        {loading && !refreshing ? (
          <LoadingIndicator message="Loading profile..." />
        ) : (
          <>
            <View style={[styles.profileHeaderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                <Text style={[typography.h1, { color: theme.primary }]}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </Text>
              </View>
              <Text style={[typography.h2, { color: theme.text, marginTop: 12 }]}>{user?.name}</Text>
              <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.primaryLight, marginTop: 8 }]}>
                <Text style={[typography.caption, { color: theme.primary, fontWeight: '700' }]}>
                  STUDENT
                </Text>
              </View>
            </View>

            <View style={[styles.detailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[typography.h3, styles.sectionTitle, { color: theme.text }]}>
                Academic Information
              </Text>

              <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Roll Number</Text>
                <Text style={[typography.label, { color: theme.text }]}>{currentProfile.rollNumber || 'N/A'}</Text>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Department</Text>
                <Text style={[typography.label, { color: theme.text }]}>{currentProfile.department || 'N/A'}</Text>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Current Semester</Text>
                <Text style={[typography.label, { color: theme.text }]}>Semester {currentProfile.semester || 'N/A'}</Text>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Leaderboard Rank</Text>
                <Text style={[typography.label, { color: theme.gold, fontWeight: '700' }]}>
                  {formatRank(currentProfile.rank)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Total Score</Text>
                <Text style={[typography.label, { color: theme.primary, fontWeight: '700' }]}>
                  {formatPoints(currentProfile.totalPoints)}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="View Points History"
                variant="outline"
                icon={<Ionicons name="time-outline" size={18} color={theme.primary} />}
                onPress={() => navigation.navigate('PointsHistory')}
                style={styles.historyBtn}
              />

              <Button
                title="Sign Out"
                variant="danger"
                icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
                onPress={handleLogout}
              />
            </View>
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
  profileHeaderCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actionButtons: {
    gap: 12,
  },
  historyBtn: {
    marginBottom: 4,
  },
});

