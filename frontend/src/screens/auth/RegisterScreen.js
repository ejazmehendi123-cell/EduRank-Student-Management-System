import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../theme/typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerUser } from '../../features/auth/authThunks';
import { selectAuthLoading, selectAuthError } from '../../features/auth/authSelectors';
import { clearAuthError } from '../../features/auth/authSlice';
import { isValidEmail } from '../../utils/validators';
import { ROLES } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);

  // Student details
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('6');

  // Teacher invite code (required if role is TEACHER)
  const [teacherInviteCode, setTeacherInviteCode] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Full name is required';
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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (role === ROLES.STUDENT) {
      if (!rollNumber.trim()) errors.rollNumber = 'Roll number is required';
      if (!department.trim()) errors.department = 'Department is required';
      const semNum = Number(semester);
      if (!semNum || semNum < 1 || semNum > 8) {
        errors.semester = 'Semester must be between 1 and 8';
      }
    } else if (role === ROLES.TEACHER) {
      if (!teacherInviteCode.trim()) {
        errors.teacherInviteCode = 'Authorized teacher invite code is required';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = () => {
    dispatch(clearAuthError());
    if (validate()) {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        ...(role === ROLES.STUDENT
          ? {
              rollNumber: rollNumber.trim().toUpperCase(),
              department: department.trim(),
              semester: Number(semester),
            }
          : {
              teacherInviteCode: teacherInviteCode.trim(),
            }),
      };
      dispatch(registerUser(payload));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemeToggle />
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={[typography.h1, { color: theme.text }]}>Create Account</Text>
          <Text style={[typography.bodyMedium, { color: theme.textSecondary, marginTop: 4 }]}>
            Join the Student Management System
          </Text>
        </View>

        {authError && <ErrorMessage message={authError} />}

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Role Selection Toggle */}
          <View style={styles.roleContainer}>
            <Text style={[typography.label, { color: theme.textSecondary, marginBottom: 8 }]}>
              Account Role
            </Text>
            <View style={[styles.roleToggle, { backgroundColor: theme.surface }]}>
              <TouchableOpacity
                onPress={() => setRole(ROLES.STUDENT)}
                style={[
                  styles.roleOption,
                  role === ROLES.STUDENT && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    typography.label,
                    { color: role === ROLES.STUDENT ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  🎓 Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole(ROLES.TEACHER)}
                style={[
                  styles.roleOption,
                  role === ROLES.TEACHER && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    typography.label,
                    { color: role === ROLES.TEACHER ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  👨‍🏫 Teacher
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={(t) => { setName(t); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null }); }}
            error={fieldErrors.name}
            autoCapitalize="words"
            leftIcon={<Ionicons name="person-outline" size={20} color={theme.textMuted} />}
          />

          <Input
            label="Email Address"
            placeholder="e.g. john@student.edu"
            value={email}
            onChangeText={(t) => { setEmail(t); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null }); }}
            error={fieldErrors.email}
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(t) => { setPassword(t); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null }); }}
            error={fieldErrors.password}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null }); }}
            error={fieldErrors.confirmPassword}
            secureTextEntry
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.textMuted} />}
          />

          {/* Student Specific Fields */}
          {role === ROLES.STUDENT ? (
            <>
              <Input
                label="Roll Number"
                placeholder="e.g. CS2026-099"
                value={rollNumber}
                onChangeText={(t) => { setRollNumber(t); if (fieldErrors.rollNumber) setFieldErrors({ ...fieldErrors, rollNumber: null }); }}
                error={fieldErrors.rollNumber}
                autoCapitalize="characters"
                leftIcon={<Ionicons name="card-outline" size={20} color={theme.textMuted} />}
              />

              <Input
                label="Department"
                placeholder="e.g. Computer Science"
                value={department}
                onChangeText={(t) => { setDepartment(t); if (fieldErrors.department) setFieldErrors({ ...fieldErrors, department: null }); }}
                error={fieldErrors.department}
                leftIcon={<Ionicons name="business-outline" size={20} color={theme.textMuted} />}
              />

              <Input
                label="Current Semester (1-8)"
                placeholder="e.g. 6"
                value={semester}
                onChangeText={(t) => { setSemester(t); if (fieldErrors.semester) setFieldErrors({ ...fieldErrors, semester: null }); }}
                error={fieldErrors.semester}
                keyboardType="numeric"
                leftIcon={<Ionicons name="calendar-outline" size={20} color={theme.textMuted} />}
              />
            </>
          ) : (
            <Input
              label="Teacher Invite Code (Authorized key)"
              placeholder="Enter secure key (TEACHER_SECURE_KEY_2026)"
              value={teacherInviteCode}
              onChangeText={(t) => { setTeacherInviteCode(t); if (fieldErrors.teacherInviteCode) setFieldErrors({ ...fieldErrors, teacherInviteCode: null }); }}
              error={fieldErrors.teacherInviteCode}
              leftIcon={<Ionicons name="key-outline" size={20} color={theme.textMuted} />}
            />
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            size="large"
            style={styles.registerBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[typography.bodyMedium, { color: theme.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[typography.bodyMedium, { color: theme.primary, fontWeight: '700' }]}>
              Sign In
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
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  welcomeContainer: {
    marginBottom: 20,
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
  roleContainer: {
    marginBottom: 16,
  },
  roleToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  registerBtn: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
});

