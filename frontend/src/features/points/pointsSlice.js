import { createSlice } from '@reduxjs/toolkit';
import { awardPoints, adjustPoints, fetchPointsHistory } from './pointsThunks';

const initialState = {
  history: [],
  isSubmitting: false,
  isLoadingHistory: false,
  error: null,
  successMessage: null,
};

export const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    clearPointsStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Award Points
    builder
      .addCase(awardPoints.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(awardPoints.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = `Successfully awarded ${action.payload.points} points!`;
        state.history.unshift(action.payload);
      })
      .addCase(awardPoints.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // Adjust Points
    builder
      .addCase(adjustPoints.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(adjustPoints.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = `Successfully adjusted points (${action.payload.points > 0 ? '+' : ''}${action.payload.points})!`;
        state.history.unshift(action.payload);
      })
      .addCase(adjustPoints.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // Fetch History
    builder
      .addCase(fetchPointsHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.error = null;
      })
      .addCase(fetchPointsHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.history = action.payload || [];
      })
      .addCase(fetchPointsHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload;
      });
  },
});

export const { clearPointsStatus } = pointsSlice.actions;
export default pointsSlice.reducer;

