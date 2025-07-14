// authSelectors.js
import { createSelector } from "@reduxjs/toolkit";

// Basic selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role || null;
export const selectPreferredGenres = (state) =>
  state.auth.user?.preferredGenres || [];

// ❗ Memoized liked song IDs (return same reference unless changed)
export const selectLikedSongIds = createSelector(
  [selectCurrentUser],
  (user) => user?.likedsong || [] // Only returns a new array if user.likedsong actually changed
);

// ✅ Factory selector to check if a song is liked
export const selectIsSongLiked = (songId) =>
  createSelector([selectLikedSongIds], (likedIds) =>
    likedIds.includes(songId)
  );
