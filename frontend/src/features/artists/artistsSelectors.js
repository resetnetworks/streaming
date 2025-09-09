// Selectors
export const selectAllArtists = (state) => state.artists.allArtists;
export const selectFullArtistList = (state) => state.artists.fullArtistList;
export const selectSelectedArtist = (state) => state.artists.selectedArtist;
export const selectArtistLoading = (state) => state.artists.loading;
export const selectArtistError = (state) => state.artists.error;
export const selectArtistPagination = (state) => state.artists.pagination;
export const selectRandomArtist = (state) => state.artists.randomArtist;
export const selectRandomArtistSongs = (state) => state.artists.randomArtistSongs;
export const selectRandomArtistPagination = (state) => state.artists.randomArtistPagination;

// ✅ Cache selectors for paginated artists
export const selectIsCached = (state) => state.artists.isCached;
export const selectLastFetchTime = (state) => state.artists.lastFetchTime;
export const selectCachedPages = (state) => state.artists.cachedPages;
export const selectCachedData = (state) => state.artists.cachedData;

// ✅ Cache selectors for full artist list
export const selectIsFullListCached = (state) => state.artists.isFullListCached;
export const selectFullListLastFetchTime = (state) => state.artists.fullListLastFetchTime;

// ✅ NEW: Subscriber Count Selectors
export const selectSubscriberCounts = (state) => state.artists.subscriberCounts;
export const selectSubscriberCountLoading = (state) => state.artists.subscriberCountLoading;
export const selectSubscriberCountError = (state) => state.artists.subscriberCountError;
export const selectArtistSubscriberCount = (artistId) => (state) => 
  state.artists.subscriberCounts[artistId] || null;

// ✅ Cache utility selectors
export const selectIsPageCached = (page) => (state) => {
  return state.artists.cachedPages.includes(page);
};

export const selectIsCacheValid = (state) => {
  const lastFetch = state.artists.lastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

// ✅ Full list cache validity checker
export const selectIsFullListCacheValid = (state) => {
  const lastFetch = state.artists.fullListLastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

export const selectCachedPageData = (page) => (state) => {
  return state.artists.cachedData[page] || null;
};

// ✅ NEW: Subscriber count cache validity
export const selectIsSubscriberCountValid = (artistId) => (state) => {
  const data = state.artists.subscriberCounts[artistId];
  if (!data || !data.lastUpdated) return false;
  const cacheValidDuration = 2 * 60 * 1000; // 2 minutes for subscriber count
  return Date.now() - data.lastUpdated < cacheValidDuration;
};
