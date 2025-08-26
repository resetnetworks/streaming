import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectAllSongs = (state) => state.songs?.allSongs || [];
export const selectFullSongList = (state) => state.songs?.fullSongList || [];
export const selectSongsStatus = (state) => state.songs?.status || 'idle';
export const selectSongsError = (state) => state.songs?.error || null;
export const selectSongsMessage = (state) => state.songs?.message || null;
export const selectSongsPagination = (state) => state.songs?.pagination || { page: 1, totalPages: 1, total: 0 };
export const selectSelectedSong = (state) => state.player?.selectedSong || null;
export const selectSongsState = (state) => state.songs || {};

// ✅ OLD LIKED SONGS SELECTORS (NO CACHE)
export const selectLikedSongs = (state) => state.songs?.likedSongs?.songs || [];
export const selectLikedSongsTotal = (state) => state.songs?.likedSongs?.total || 0;
export const selectLikedSongsPage = (state) => state.songs?.likedSongs?.page || 1;
export const selectLikedSongsPages = (state) => state.songs?.likedSongs?.pages || 1;

// ✅ NEW: Matching genre songs selectors WITH CACHE (FIXED)
export const selectMatchingGenreSongs = (state) => state.songs?.matchingGenreSongs?.songs || [];
export const selectMatchingGenres = (state) => state.songs?.matchingGenreSongs?.matchingGenres || [];
export const selectMatchingGenreSongsTotal = (state) => state.songs?.matchingGenreSongs?.total || 0;
export const selectMatchingGenreSongsPage = (state) => state.songs?.matchingGenreSongs?.page || 1;
export const selectMatchingGenreSongsPages = (state) => state.songs?.matchingGenreSongs?.pages || 1;
export const selectMatchingGenrePagination = (state) => state.songs?.matchingGenrePagination || { page: 1, totalPages: 1, total: 0 };

// Legacy selectors for backward compatibility
export const selectTotalPages = (state) => state.songs?.pagination?.totalPages || 1;
export const selectCurrentPage = (state) => state.songs?.pagination?.page || 1;

// Album and Artist selectors
export const selectSongsByAlbum = (state, albumId) => state.songs?.songsByAlbum?.[albumId] || [];

export const selectSongsByArtist = createSelector(
  [selectSongsState, (_, artistId) => artistId],
  (songs, artistId) => songs?.songsByArtist?.[artistId] || {}
);

// ✅ Cache selectors for paginated songs
export const selectIsCached = (state) => state.songs?.isCached || false;
export const selectLastFetchTime = (state) => state.songs?.lastFetchTime || null;
export const selectCachedPages = (state) => state.songs?.cachedPages || [];
export const selectCachedData = (state) => state.songs?.cachedData || {};

// ✅ Cache selectors for full song list
export const selectIsFullListCached = (state) => state.songs?.isFullListCached || false;
export const selectFullListLastFetchTime = (state) => state.songs?.fullListLastFetchTime || null;

// ✅ NEW: Cache selectors for matching genre songs
export const selectIsMatchingGenreCached = (state) => state.songs?.isMatchingGenreCached || false;
export const selectMatchingGenreLastFetchTime = (state) => state.songs?.matchingGenreLastFetchTime || null;
export const selectMatchingGenreCachedPages = (state) => state.songs?.matchingGenreCachedPages || [];
export const selectMatchingGenreCachedData = (state) => state.songs?.matchingGenreCachedData || {};

// ✅ Cache utility selectors for paginated songs
export const selectIsPageCached = (page) => (state) => {
  const cachedPages = state.songs?.cachedPages || [];
  return cachedPages.includes(page);
};

export const selectIsCacheValid = (state) => {
  const lastFetch = state.songs?.lastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

// ✅ Full list cache validity checker
export const selectIsFullListCacheValid = (state) => {
  const lastFetch = state.songs?.fullListLastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

// ✅ NEW: Matching genre cache utility selectors
export const selectIsMatchingGenrePageCached = (page) => (state) => {
  const cachedPages = state.songs?.matchingGenreCachedPages || [];
  return cachedPages.includes(page);
};

export const selectIsMatchingGenreCacheValid = (state) => {
  const lastFetch = state.songs?.matchingGenreLastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

export const selectCachedPageData = (page) => (state) => {
  const cachedData = state.songs?.cachedData || {};
  return cachedData[page] || null;
};

export const selectMatchingGenreCachedPageData = (page) => (state) => {
  const cachedData = state.songs?.matchingGenreCachedData || {};
  return cachedData[page] || null;
};
