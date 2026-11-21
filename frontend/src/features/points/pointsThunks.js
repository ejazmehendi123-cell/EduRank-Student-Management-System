import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { fetchLeaderboard } from '../leaderboard/leaderboardThunks';
import { updateProfilePoints } from '../auth/authSlice';
import { fetchStudentById } from '../students/studentThunks';

export const awardPoints = createAsyncThunk(
  'points/awardPoints',
  async ({ studentId, points, reason, idempotencyKey }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/points/award', {
        studentId,
        points,
        reason,
        idempotencyKey,
      });

      // Refetch leaderboard to update ranks globally
      dispatch(fetchLeaderboard({ page: 0 }));
      dispatch(fetchStudentById(studentId));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to award points');
    }
  }
);

export const adjustPoints = createAsyncThunk(
  'points/adjustPoints',
  async ({ studentId, points, reason, idempotencyKey }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/points/adjust', {
        studentId,
        points,
        reason,
        idempotencyKey,
      });

      // Refetch leaderboard to update ranks globally
      dispatch(fetchLeaderboard({ page: 0 }));
      dispatch(fetchStudentById(studentId));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust points');
    }
  }
);

export const fetchPointsHistory = createAsyncThunk(
  'points/fetchHistory',
  async (studentId, { rejectWithValue }) => {
    try {
      const url = studentId ? `/points/history/${studentId}` : '/students/me/points-history';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch points history');
    }
  }
);

