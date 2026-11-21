import { createSlice } from '@reduxjs/toolkit';
import { fetchMyProfile, fetchStudentById, fetchAllStudents } from './studentThunks';

const initialState = {
  currentStudent: null,
  selectedStudent: null,
  studentsList: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  isLoading: false,
  error: null,
};

export const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    clearStudentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Profile
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Student By Id
    builder
      .addCase(fetchStudentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch All Students
    builder
      .addCase(fetchAllStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentsList = action.payload.content || [];
        state.page = action.payload.number || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedStudent, clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;

