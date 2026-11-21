import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyProfile = createAsyncThunk(
  'students/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student profile');
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student details');
    }
  }
);

export const fetchAllStudents = createAsyncThunk(
  'students/fetchAllStudents',
  async ({ page = 0, size = 20, sort = 'id,desc' } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/students', {
        params: { page, size, sort },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students list');
    }
  }
);

