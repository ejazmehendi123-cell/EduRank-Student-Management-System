import { createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, restoreSession, logoutUser } from './authThunks';

const initialState = {
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: true,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    updateProfilePoints: (state, action) => {
      if (state.profile && action.payload.studentId === state.profile.id) {
        state.profile.totalPoints = action.payload.newPoints;
        if (action.payload.rank !== undefined) {
          state.profile.rank = action.payload.rank;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.accessToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Restore Session
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isRestoringSession = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isRestoringSession = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.profile = action.payload.profile;
          state.token = action.payload.accessToken;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
          state.token = null;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isRestoringSession = false;
        state.isAuthenticated = false;
        state.user = null;
        state.profile = null;
        state.token = null;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearAuthError, updateProfilePoints } = authSlice.actions;
export default authSlice.reducer;

