// authPersistConfig.js
import storage from 'redux-persist/lib/storage';

export const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['preferredGenres'], // ✅ only preserve this
};
