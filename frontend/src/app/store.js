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
import paymentReducer from  "../features/payments/paymentSlice";

// ✅ Persist config for player slice (only persist volume)
const playerPersistConfig = {
  key: 'player',
  storage,
  whitelist: ['volume'],
  stateReconciler: autoMergeLevel2
};

// ✅ Root persist config (persist songs only)
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['songs'], // persist only songs
  blacklist: ['player'], // player is handled separately
};

// ✅ Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  songs: songReducer,
  player: persistReducer(playerPersistConfig, playerReducer),
  artists: artistsReducer,
  albums: albumsReducer,
  search: searchReducer,
  payment: paymentReducer,
});

// ✅ Wrap with persist
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

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

// ✅ Persistor
export const persistor = persistStore(store);

// ✅ Utility to manually clear player cache
export const clearPlayerCache = () => {
  storage.removeItem('persist:player');
};

// ✅ Dev-only helper to purge cache manually from console
if (process.env.NODE_ENV === 'development') {
  window.clearReduxCache = () => {
    persistor.purge().then(() => {
      clearPlayerCache();
      console.log('🔁 Redux cache cleared manually.');
    });
  };
}
