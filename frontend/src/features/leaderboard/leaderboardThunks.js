import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async ({ page = 0, size = 10, sort = 'totalPoints,desc' } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard', {
        params: { page, size, sort },
      });
      return { ...response.data, requestedSort: sort };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

