export const selectLeaderboardEntries = (state) => state.leaderboard.entries;
export const selectLeaderboardPagination = (state) => ({
  page: state.leaderboard.page,
  size: state.leaderboard.size,
  totalElements: state.leaderboard.totalElements,
  totalPages: state.leaderboard.totalPages,
  isLast: state.leaderboard.isLast,
});
export const selectCurrentStudentRank = (state) => state.leaderboard.currentStudentRank;
export const selectLeaderboardSort = (state) => state.leaderboard.sort;
export const selectLeaderboardLoading = (state) => state.leaderboard.isLoading;
export const selectLeaderboardError = (state) => state.leaderboard.error;

