// src/app/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { toast } from 'sonner';

import authReducer from '../features/auth/authSlice';
import songReducer from '../features/songs/songSlice';
import playerReducer from '../features/playback/playerSlice';
import artistsReducer from '../features/artists/artistsSlice';
import albumsReducer from '../features/albums/albumsSlice';
import searchReducer from '../features/search/searchSlice';
import paymentReducer from '../features/payments/paymentSlice';
import userpaymentReducer from '../features/payments/userPaymentSlice';
import streamReducer from '../features/stream/streamSlice';

import { authPersistConfig } from './authPersistConfig';

// Player persist config
const playerPersistConfig = {
  key: 'player',
  storage,
  whitelist: ['volume'],
  stateReconciler: autoMergeLevel2,
};

// Current version of your store
const CURRENT_STORE_VERSION = 1;

// Root persist config
const rootPersistConfig = {
  key: 'root',
  version: CURRENT_STORE_VERSION,
  storage, // ✅ Using default storage instead of custom logic
  whitelist: [], // No longer persisting songs here
  blacklist: ['player', 'auth', 'songs'], // Explicitly exclude songs
  stateReconciler: autoMergeLevel2,
  migrate: (state) => {
    if (state?._persist?.version !== CURRENT_STORE_VERSION) {
      toast.info('App updated: Cache cleared for better performance', {
        id: 'cache-cleared',
      });
      return Promise.resolve(undefined);
    }
    return Promise.resolve(state);
  },
};

// Separate persist config for songs (persist only needed data)
const songsPersistConfig = {
  key: 'songs',
  storage,
  blacklist: ['purchasedSongs'], // Never persist purchased songs
  stateReconciler: autoMergeLevel2,
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  songs: persistReducer(songsPersistConfig, songReducer),
  player: persistReducer(playerPersistConfig, playerReducer),
  artists: artistsReducer,
  albums: albumsReducer,
  search: searchReducer,
  payment: paymentReducer,
  userDashboard: userpaymentReducer,
  stream: streamReducer,
});

// Final persisted reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Initialize persistor with enhanced error handling
export const persistor = persistStore(store, null, (error) => {
  if (error) {
    toast.error('Failed to restore app state');
    console.error('Persistor error:', error);
  }
});
