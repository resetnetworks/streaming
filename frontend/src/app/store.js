import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

import authReducer from '../features/auth/authSlice';
import songReducer from '../features/songs/songSlice';
import playerReducer from '../features/playback/playerSlice';
import artistsReducer from "../features/artists/artistsSlice";
import albumsReducer from "../features/albums/albumsSlice";
import searchReducer from "../features/search/searchSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  songs: songReducer,
  player: playerReducer,
  artists: artistsReducer,
  albums: albumsReducer,
  search: searchReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['songs', 'player'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }), // ✅ no need to add thunk manually
});

export const persistor = persistStore(store);
