import { createSlice } from '@reduxjs/toolkit';
import { fetchLeaderboard } from './leaderboardThunks';

const initialState = {
  entries: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  isLast: false,
  currentStudentRank: null,
  sort: 'totalPoints,desc',
  isLoading: false,
  error: null,
};

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setLeaderboardSort: (state, action) => {
      state.sort = action.payload;
    },
    clearLeaderboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload.content || [];
        state.page = action.payload.page || 0;
        state.size = action.payload.size || 10;
        state.totalElements = action.payload.totalElements || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.isLast = action.payload.last || false;
        state.currentStudentRank = action.payload.currentStudentRank;
        if (action.payload.requestedSort) {
          state.sort = action.payload.requestedSort;
        }
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setLeaderboardSort, clearLeaderboardError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;

