import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/students/studentSlice';
import leaderboardReducer from '../features/leaderboard/leaderboardSlice';
import pointsReducer from '../features/points/pointsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    leaderboard: leaderboardReducer,
    points: pointsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

