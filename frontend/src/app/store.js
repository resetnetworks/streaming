// src/store/store.js
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
import payment from "../features/payments/paymentSlice";
import streamReducer from "../features/stream/streamSlice";
import adminPaymentReducer from "../features/payments/adminPaymentSlice";

// ========================
// 🔐 PERSIST CONFIGS
// ========================

// ✅ Player persist config (volume, song state only)
const playerPersistConfig = {
  key: 'player',
  storage,
  whitelist: ['volume', 'selectedSong', 'currentTime', 'isPlaying'],
  stateReconciler: autoMergeLevel2,
};

// ✅ Root persist config (auth + songs only)
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['songs', 'auth'],
  blacklist: ['player'], // player handled separately
  stateReconciler: autoMergeLevel2,
};

// ========================
// 🧩 COMBINE REDUCERS
// ========================
const appReducer = combineReducers({
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

// ========================
// 🧠 ROOT REDUCER RESET LOGIC
// ========================
// This ensures Redux state resets after logout
const rootReducer = (state, action) => {
  // Reset the entire store on logout
  if (action.type === "auth/logout/fulfilled") {
    // Completely reset persisted redux state
    storage.removeItem('persist:root');
    storage.removeItem('persist:player');
    state = undefined;
  }
  return appReducer(state, action);
};

// ========================
// ⚙️ PERSISTED REDUCER WRAPPER
// ========================
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// ========================
// 🏗️ STORE CONFIGURATION
// ========================
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ========================
// 💾 PERSISTOR SETUP
// ========================
export const persistor = persistStore(store);

// Make available globally (important for logout purge)
if (typeof window !== 'undefined') {
  window.__PERSISTOR__ = persistor;
  window.store = store;
}

// ========================
// 🧹 PLAYER CACHE CLEAR UTILITY
// ========================
export const clearPlayerCache = () => {
  storage.removeItem('persist:player');
};

// ========================
// 🚪 COMPLETE LOGOUT HANDLER
// ========================
// Use this for hard logout from anywhere
export const completeLogout = async () => {
  try {
    // Purge all persisted states
    await persistor.purge();
    await persistor.flush();

    // Clear all local/session data
    localStorage.clear();
    sessionStorage.clear();

    // Optional redirect
    window.location.replace('/login');
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.clear();
    window.location.replace('/login');
  }
};

// ========================
// 🧰 DEV HELPER (Manual Purge)
// ========================
if (process.env.NODE_ENV === 'development') {
  window.clearReduxCache = () => {
    persistor.purge().then(() => {
      clearPlayerCache();
      localStorage.clear();
      console.log('✅ Redux cache cleared manually');
    });
  };
}
