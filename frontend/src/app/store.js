import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import authReducer from '../features/auth/authSlice';
import songReducer from '../features/songs/songSlice';
import playerReducer from '../features/playback/playerSlice';
import artistsReducer from "../features/artists/artistsSlice";
import albumsReducer from "../features/albums/albumsSlice";
import searchReducer from "../features/search/searchSlice";
import paymentReducer from "../features/payments/userPaymentSlice";
import payment from "../features/payments/paymentSlice"
import streamReducer from "../features/stream/streamSlice";
import adminPaymentReducer from "../features/payments/adminPaymentSlice"

// ✅ Persist config for player slice
const playerPersistConfig = {
  key: 'player',
  storage,
  whitelist: ['volume', 'selectedSong', 'currentTime', 'isPlaying'],
  stateReconciler: autoMergeLevel2,
};

// ✅ Root persist config
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['songs','auth'],
  blacklist: ['player'],
};

// ✅ Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  songs: songReducer,
  player: persistReducer(playerPersistConfig, playerReducer),
  artists: artistsReducer,
  albums: albumsReducer,
  search: searchReducer,
  userDashboard: paymentReducer,
  stream: streamReducer,
  payment: payment,
  artistDashboard: adminPaymentReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// ✅ NEW: Clear all cache utility
export const clearAllCache = async () => {
  try {
    // Clear all localStorage keys related to redux-persist
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    });
    
    // Also clear any other app-specific cache
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('subscribedArtists');
    
    console.log('🧹 All cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

// ✅ NEW: Conditional cache clearing based on app version or conditions
const APP_VERSION = '2.0.0'; // Update this when you want to force cache clear
const shouldClearCache = () => {
  const lastVersion = localStorage.getItem('app_version');
  const isNewVersion = lastVersion !== APP_VERSION;
  
  // Clear cache if:
  // 1. New app version
  // 2. No version stored (first visit)
  // 3. Development environment (optional)
  return isNewVersion || !lastVersion || process.env.NODE_ENV === 'development';
};

// ✅ NEW: Auto-clear cache on website visit
if (typeof window !== 'undefined') {
  if (shouldClearCache()) {
    clearAllCache().then(() => {
      localStorage.setItem('app_version', APP_VERSION);
      console.log('✅ Cache cleared for new website visit');
    });
  }
}

// ✅ Configure Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// ✅ Utility to manually clear player cache
export const clearPlayerCache = () => {
  storage.removeItem('persist:player');
};

// ✅ Dev-only helper
if (process.env.NODE_ENV === 'development') {
  window.clearReduxCache = () => {
    clearAllCache().then(() => {
      window.location.reload();
    });
  };
}
