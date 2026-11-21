import authReducer, { clearAuthError, updateProfilePoints } from '../src/features/auth/authSlice';
import { loginUser, logoutUser, restoreSession } from '../src/features/auth/authThunks';

describe('Auth Redux Slice', () => {
  const initialState = {
    user: null,
    profile: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isRestoringSession: true,
    error: null,
  };

  test('should return initial state on unknown action', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should clear auth errors', () => {
    const stateWithError = { ...initialState, error: 'Invalid credentials' };
    const nextState = authReducer(stateWithError, clearAuthError());
    expect(nextState.error).toBeNull();
  });

  test('should update profile points and rank dynamically', () => {
    const authenticatedState = {
      ...initialState,
      isAuthenticated: true,
      profile: { id: 1, totalPoints: 850, rank: 4 },
    };
    const nextState = authReducer(
      authenticatedState,
      updateProfilePoints({ studentId: 1, newPoints: 925, rank: 2 })
    );
    expect(nextState.profile.totalPoints).toBe(925);
    expect(nextState.profile.rank).toBe(2);
  });

  test('loginUser.fulfilled updates state with authenticated user and token', () => {
    const payload = {
      user: { id: 1, name: 'Prof. Sharma', email: 'teacher@school.edu', role: 'TEACHER' },
      profile: null,
      accessToken: 'sample-jwt-token',
    };
    const nextState = authReducer(initialState, {
      type: loginUser.fulfilled.type,
      payload,
    });
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user.email).toBe('teacher@school.edu');
    expect(nextState.token).toBe('sample-jwt-token');
    expect(nextState.isLoading).toBe(false);
  });

  test('logoutUser.fulfilled cleans up authentication state', () => {
    const loggedInState = {
      ...initialState,
      user: { id: 1, name: 'Prof. Sharma' },
      isAuthenticated: true,
      token: 'sample-token',
    };
    const nextState = authReducer(loggedInState, {
      type: logoutUser.fulfilled.type,
    });
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
  });
});

