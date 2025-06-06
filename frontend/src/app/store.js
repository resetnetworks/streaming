import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import songReducer from '../features/songs/songSlice';
import playerReducer from '../features/playback/playerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songReducer,
    player: playerReducer,
  },
});
