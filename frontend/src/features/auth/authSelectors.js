export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role || null;
export const selectPreferredGenres = (state) =>
  state.auth.user?.preferredGenres || [];

// ✅ NEW: Stable selector for liked song IDs
export const selectLikedSongIds = (state) =>
  state.auth.user?.likedsong || []; // You may rename to 'likedSongs' for clarity
