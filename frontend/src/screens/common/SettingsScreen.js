import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSelectors';
import { logoutUser } from '../../features/auth/authThunks';
import { API_BASE_URL } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Settings" subtitle="Preferences & App Information" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appearance Section */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[typography.label, { color: theme.textSecondary, marginBottom: 12 }]}>
            APPEARANCE
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={22}
                color={isDark ? theme.gold : theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[typography.bodyLarge, { color: theme.text }]}>Dark Theme</Text>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  {isDark ? 'Dark background with high contrast' : 'Light background'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Account Info */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[typography.label, { color: theme.textSecondary, marginBottom: 12 }]}>
            LOGGED IN USER
          </Text>

          <View style={styles.infoRow}>
            <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Name</Text>
            <Text style={[typography.label, { color: theme.text }]}>{user?.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Email</Text>
            <Text style={[typography.label, { color: theme.text }]}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Role</Text>
            <Text style={[typography.label, { color: theme.primary }]}>{user?.role || '-'}</Text>
          </View>
        </View>

        {/* Server & Connectivity */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[typography.label, { color: theme.textSecondary, marginBottom: 12 }]}>
            BACKEND CONNECTIVITY
          </Text>

          <View style={styles.infoRow}>
            <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Server URL</Text>
            <Text style={[typography.caption, { color: theme.primary, fontWeight: '600' }]}>
              {API_BASE_URL}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>Status</Text>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <Text style={[typography.caption, { color: theme.success, fontWeight: '700' }]}>
                CONNECTED
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="Sign Out"
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
          onPress={() => dispatch(logoutUser())}
          style={styles.logoutBtn}
        />
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
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  logoutBtn: {
    marginTop: 8,
  },
});

