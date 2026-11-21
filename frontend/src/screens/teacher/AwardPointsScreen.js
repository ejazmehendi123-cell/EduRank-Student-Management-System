import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useAppDispatch } from '../../app/hooks';
import { awardPoints, adjustPoints } from '../../features/points/pointsThunks';
import { formatPoints } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const AwardPointsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const student = route.params?.student || {};

  const [mode, setMode] = useState('AWARD'); // 'AWARD' | 'ADJUST'
  const [points, setPoints] = useState('50');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const pointsNum = Number(points);
    if (isNaN(pointsNum) || pointsNum === 0) {
      setError('Please enter a valid non-zero points value');
      return;
    }

    if (mode === 'AWARD' && pointsNum <= 0) {
      setError('Award points must be greater than zero');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for this point transaction');
      return;
    }

    // Generate unique idempotency key
    const idempotencyKey = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    setIsSubmitting(true);
    try {
      if (mode === 'AWARD') {
        await dispatch(
          awardPoints({
            studentId: student.id,
            points: pointsNum,
            reason: reason.trim(),
            idempotencyKey,
          })
        ).unwrap();
        setSuccess(`Successfully awarded ${pointsNum} points to ${student.name}!`);
      } else {
        await dispatch(
          adjustPoints({
            studentId: student.id,
            points: pointsNum,
            reason: reason.trim(),
            idempotencyKey,
          })
        ).unwrap();
        setSuccess(`Successfully adjusted ${pointsNum > 0 ? '+' : ''}${pointsNum} points for ${student.name}!`);
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (err) {
      setError(err || 'Failed to submit point transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Point Distribution"
        subtitle={`Student: ${student.name || 'Selected'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Selected Student Banner */}
        <View style={[styles.studentBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <Text style={[typography.h2, { color: theme.primary }]}>
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={[typography.label, { color: theme.text }]}>{student.name}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {student.rollNumber} • {student.department}
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>Current</Text>
            <Text style={[typography.label, { color: theme.primary, fontWeight: '700' }]}>
              {formatPoints(student.totalPoints)}
            </Text>
          </View>
        </View>

        {error && <ErrorMessage message={error} />}

        {success && (
          <View style={[styles.successBanner, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={[typography.bodyMedium, { color: theme.success, marginLeft: 8, fontWeight: '600' }]}>
              {success}
            </Text>
          </View>
        )}

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Mode Selector */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              onPress={() => { setMode('AWARD'); if (Number(points) < 0) setPoints('50'); }}
              style={[
                styles.modeBtn,
                mode === 'AWARD' && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  { color: mode === 'AWARD' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                🎁 Award Points
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode('ADJUST')}
              style={[
                styles.modeBtn,
                mode === 'ADJUST' && { backgroundColor: theme.warning },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  { color: mode === 'ADJUST' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                ⚖️ Adjust / Deduct
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preset Buttons for Quick Award */}
          <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: 8 }]}>
            Quick Presets:
          </Text>
          <View style={styles.presetsRow}>
            {mode === 'AWARD' ? (
              [10, 25, 50, 100].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setPoints(val.toString())}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: points === val.toString() ? theme.primaryLight : theme.surface,
                      borderColor: points === val.toString() ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={[typography.caption, { color: theme.primary, fontWeight: '700' }]}>
                    +{val}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              [-50, -25, -10, 25].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setPoints(val.toString())}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: points === val.toString() ? theme.warningLight : theme.surface,
                      borderColor: points === val.toString() ? theme.warning : theme.border,
                    },
                  ]}
                >
                  <Text style={[typography.caption, { color: val < 0 ? theme.danger : theme.success, fontWeight: '700' }]}>
                    {val > 0 ? `+${val}` : val}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <Input
            label={mode === 'AWARD' ? 'Points to Award' : 'Points to Adjust (Negative to deduct)'}
            placeholder={mode === 'AWARD' ? 'e.g. 50' : 'e.g. -20 or 30'}
            value={points}
            onChangeText={setPoints}
            keyboardType="numbers-and-punctuation"
            leftIcon={<Ionicons name="sparkles-outline" size={20} color={theme.textMuted} />}
          />

          <Input
            label="Reason / Achievement Description"
            placeholder="e.g. Won Hackathon, Exceptional Lab Assignment, Late Submission Penalty..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            leftIcon={<Ionicons name="document-text-outline" size={20} color={theme.textMuted} />}
          />

          <Button
            title={mode === 'AWARD' ? `Award ${points || 0} Points` : `Apply Adjustment (${points || 0})`}
            onPress={handleSubmit}
            loading={isSubmitting}
            size="large"
            variant={mode === 'AWARD' ? 'primary' : 'warning'}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  studentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  pointsBadge: {
    alignItems: 'flex-end',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  submitBtn: {
    marginTop: 8,
  },
});

