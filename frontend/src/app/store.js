import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import songReducer from '../features/songs/songSlice';
import playerReducer from '../features/playback/playerSlice';
import artistsReducer from "../features/artists/artistsSlice";
import albumsReducer from "../features/albums/albumsSlice";
import searchReducer from "../features/search/searchSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songReducer,
    player: playerReducer,
    artists:artistsReducer,
    albums: albumsReducer,
    search: searchReducer,
  },
});
