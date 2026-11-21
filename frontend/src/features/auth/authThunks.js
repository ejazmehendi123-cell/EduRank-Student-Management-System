import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { tokenStorage } from '../../services/tokenStorage';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user, profile } = response.data;
      await tokenStorage.setAccessToken(accessToken);
      if (refreshToken) {
        await tokenStorage.setRefreshToken(refreshToken);
      }
      await tokenStorage.setUserData(user);
      return { user, profile, accessToken };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', formData);
      const { accessToken, refreshToken, user, profile } = response.data;
      await tokenStorage.setAccessToken(accessToken);
      if (refreshToken) {
        await tokenStorage.setRefreshToken(refreshToken);
      }
      await tokenStorage.setUserData(user);
      return { user, profile, accessToken };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.data?.fieldErrors ? Object.values(error.response.data.fieldErrors).join(', ') : null) ||
        error.message ||
        'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        return null;
      }
      const response = await api.get('/auth/me');
      const { user, profile } = response.data;
      await tokenStorage.setUserData(user);
      return { user, profile, accessToken: token };
    } catch (error) {
      await tokenStorage.clearAll();
      return rejectWithValue('Session expired');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // ignore
  } finally {
    await tokenStorage.clearAll();
  }
  return true;
});

