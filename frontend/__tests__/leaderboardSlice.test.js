import leaderboardReducer, {
  setLeaderboardSort,
  clearLeaderboardError,
} from '../src/features/leaderboard/leaderboardSlice';
import { fetchLeaderboard } from '../src/features/leaderboard/leaderboardThunks';

describe('Leaderboard Redux Slice', () => {
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

  test('should return initial state', () => {
    expect(leaderboardReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('setLeaderboardSort updates sort state', () => {
    const nextState = leaderboardReducer(initialState, setLeaderboardSort('totalPoints,asc'));
    expect(nextState.sort).toBe('totalPoints,asc');
  });

  test('fetchLeaderboard.fulfilled populates competition ranks and pagination metadata', () => {
    const mockPayload = {
      content: [
        { studentId: 1, name: 'Rahul', totalPoints: 950, rank: 1 },
        { studentId: 2, name: 'Priya', totalPoints: 900, rank: 2 },
        { studentId: 3, name: 'Amit', totalPoints: 900, rank: 2 },
        { studentId: 4, name: 'Sneha', totalPoints: 850, rank: 4 },
      ],
      page: 0,
      size: 10,
      totalElements: 4,
      totalPages: 1,
      last: true,
      currentStudentRank: 1,
      requestedSort: 'totalPoints,desc',
    };

    const nextState = leaderboardReducer(initialState, {
      type: fetchLeaderboard.fulfilled.type,
      payload: mockPayload,
    });

    expect(nextState.entries.length).toBe(4);
    expect(nextState.entries[0].rank).toBe(1);
    expect(nextState.entries[1].rank).toBe(2);
    expect(nextState.entries[2].rank).toBe(2); // Tied
    expect(nextState.entries[3].rank).toBe(4); // Skipped 3
    expect(nextState.currentStudentRank).toBe(1);
    expect(nextState.isLoading).toBe(false);
  });
});

