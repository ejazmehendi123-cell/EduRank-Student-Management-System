import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser } from '../../features/auth/authThunks';
import { selectAuthLoading, selectAuthError } from '../../features/auth/authSelectors';
import { clearAuthError } from '../../features/auth/authSlice';
import { isValidEmail } from '../../utils/validators';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    dispatch(clearAuthError());
    if (validate()) {
      dispatch(loginUser({ email: email.trim(), password }));
    }
  };

  // Demo credentials quick filler for convenience
  const fillCredentials = (type) => {
    if (type === 'teacher') {
      setEmail('teacher@school.edu');
      setPassword('Password@123');
    } else {
      setEmail('rahul@student.edu');
      setPassword('Password@123');
    }
    setFieldErrors({});
    dispatch(clearAuthError());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="school" size={28} color="#FFFFFF" />
            </View>
            <Text style={[typography.h2, { color: theme.text, marginLeft: 12 }]}>EduRank</Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={[typography.h1, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[typography.bodyMedium, { color: theme.textSecondary, marginTop: 6 }]}>
            Sign in to access your student dashboard & leaderboard
          </Text>
        </View>

        {authError && <ErrorMessage message={authError} />}

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Input
            label="Email Address"
            placeholder="e.g. rahul@student.edu"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
            }}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
            }}
            error={fieldErrors.password}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            size="large"
            style={styles.loginBtn}
          />

          {/* Quick Demo Fill Buttons */}
          <View style={[styles.demoSection, { borderTopColor: theme.border }]}>
            <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: 8 }]}>
              Quick Demo Logins:
            </Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                onPress={() => fillCredentials('teacher')}
                style={[styles.demoBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={[typography.caption, { color: theme.primary, fontWeight: '700' }]}>
                  👨‍🏫 Teacher Demo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => fillCredentials('student')}
                style={[styles.demoBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={[typography.caption, { color: theme.secondary, fontWeight: '700' }]}>
                  🎓 Student Demo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.registerFooter}>
          <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[typography.bodyMedium, { color: theme.primary, fontWeight: '700' }]}>
              Register here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginBtn: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  registerFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});

