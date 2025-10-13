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

// ✅ UPDATED: Default song selectors for player display (from playerSlice)
export const selectDefaultSong = (state) => state.player?.defaultSong || null;
export const selectHasPersistentDefault = (state) => !!state.player?.defaultSong;
export const selectCanPlay = (state) => !!(state.player?.selectedSong || state.player?.defaultSong);
export const selectPlaybackContext = (state) => state.player?.playbackContext || { type: 'all', id: null, songs: [] };
export const selectPlaybackContextType = (state) => state.player?.playbackContext?.type || 'all';
export const selectPlaybackContextSongs = (state) => state.player?.playbackContext?.songs || [];

// ✅ NEW: All Singles selectors (MOVED UP - Define before using)
export const selectAllSingles = (state) => state.songs?.allSingles || [];
export const selectSinglesPagination = (state) => state.songs?.singlesPagination || { page: 1, totalPages: 1, total: 0 };
export const selectSinglesCount = (state) => state.songs?.allSingles?.length || 0;

// ✅ NEW: Matching genre songs selectors (MOVED UP - Define before using)
export const selectMatchingGenreSongs = (state) => state.songs?.matchingGenreSongs?.songs || [];
export const selectMatchingGenres = (state) => state.songs?.matchingGenreSongs?.matchingGenres || [];
export const selectMatchingGenreSongsTotal = (state) => state.songs?.matchingGenreSongs?.total || 0;
export const selectMatchingGenreSongsPage = (state) => state.songs?.matchingGenreSongs?.page || 1;
export const selectMatchingGenreSongsPages = (state) => state.songs?.matchingGenreSongs?.pages || 1;
export const selectMatchingGenrePagination = (state) => state.songs?.matchingGenrePagination || { page: 1, totalPages: 1, total: 0 };

// ✅ NEW: Per-genre live selectors (MOVED UP - Define before using)
export const selectGenreSongsGenre = (state) => state.songs?.genreSongs?.genre || null;
export const selectGenreSongs = (state) => state.songs?.genreSongs?.songs || [];
export const selectGenreSongsTotal = (state) => state.songs?.genreSongs?.total || 0;
export const selectGenreSongsPage = (state) => state.songs?.genreSongs?.page || 1;
export const selectGenreSongsPages = (state) => state.songs?.genreSongs?.pages || 1;

// ✅ UPDATED: Get random song from available songs (only used when no persistent default exists)
export const selectRandomDefaultSong = createSelector(
  [selectAllSongs, selectAllSingles, selectMatchingGenreSongs, selectGenreSongs],
  (allSongs, allSingles, matchingGenreSongs, genreSongs) => {
    // Priority order: allSongs -> allSingles -> matchingGenreSongs -> genreSongs
    let availableSongs = [];
    
    if (allSongs && allSongs.length > 0) {
      availableSongs = allSongs;
    } else if (allSingles && allSingles.length > 0) {
      availableSongs = allSingles;
    } else if (matchingGenreSongs && matchingGenreSongs.length > 0) {
      availableSongs = matchingGenreSongs;
    } else if (genreSongs && genreSongs.length > 0) {
      availableSongs = genreSongs;
    }
    
    if (availableSongs.length === 0) return null;
    
    // Limit to first 20 songs for better performance
    const limitedSongs = availableSongs.slice(0, Math.min(availableSongs.length, 20));
    const randomIndex = Math.floor(Math.random() * limitedSongs.length);
    return limitedSongs[randomIndex];
  }
);

// ✅ UPDATED: Get best song for player display (selected > persistent default > random)
export const selectPlayerDisplaySong = createSelector(
  [selectSelectedSong, selectDefaultSong, selectRandomDefaultSong],
  (selectedSong, defaultSong, randomSong) => {
    // Priority: selected song > persistent default > random fallback
    return selectedSong || defaultSong || randomSong || null;
  }
);

// ✅ UPDATED: Check if player is in display-only mode (showing default song)
export const selectIsPlayerDisplayOnly = createSelector(
  [selectSelectedSong, selectDefaultSong],
  (selectedSong, defaultSong) => {
    return !selectedSong && !!defaultSong;
  }
);

// ✅ NEW: Check if we need to initialize a default song
export const selectShouldInitializeDefault = createSelector(
  [selectDefaultSong, selectAllSongs, selectAllSingles],
  (defaultSong, allSongs, allSingles) => {
    // Return true if no default song exists but we have songs available
    return !defaultSong && (allSongs.length > 0 || allSingles.length > 0);
  }
);

// ✅ NEW: Get available songs for default selection (for initialization)
export const selectAvailableSongsForDefault = createSelector(
  [selectAllSongs, selectAllSingles, selectMatchingGenreSongs, selectGenreSongs],
  (allSongs, allSingles, matchingGenreSongs, genreSongs) => {
    const collections = [
      { name: 'allSongs', songs: allSongs || [] },
      { name: 'allSingles', songs: allSingles || [] },
      { name: 'matchingGenreSongs', songs: matchingGenreSongs || [] },
      { name: 'genreSongs', songs: genreSongs || [] }
    ];
    
    return collections.filter(collection => collection.songs.length > 0);
  }
);

// ✅ UPDATED: Additional selectors for better Player.jsx compatibility
export const selectDisplaySong = selectPlayerDisplaySong;
export const selectIsDisplayOnly = selectIsPlayerDisplayOnly;

// ✅ NEW: Enhanced player state selector
export const selectEnhancedPlayerState = createSelector(
  [selectPlayerDisplaySong, selectIsPlayerDisplayOnly, selectHasPersistentDefault, selectCanPlay, selectPlaybackContext],
  (displaySong, isDisplayOnly, hasPersistentDefault, canPlay, playbackContext) => ({
    displaySong,
    isDisplayOnly,
    hasPersistentDefault,
    canPlay,
    playbackContext,
    // Additional computed properties
    hasContent: !!displaySong,
    canShowPlayer: !!displaySong,
    isContextualPlayback: playbackContext.type !== 'all'
  })
);

// ✅ NEW: Singles cache selectors
export const selectIsSinglesCached = (state) => state.songs?.isSinglesCached || false;
export const selectSinglesLastFetchTime = (state) => state.songs?.singlesLastFetchTime || null;
export const selectSinglesCachedPages = (state) => state.songs?.singlesCachedPages || [];
export const selectSinglesCachedData = (state) => state.songs?.singlesCachedData || {};

export const selectIsSinglesPageCached = (page) => (state) => {
  const cachedPages = state.songs?.singlesCachedPages || [];
  return cachedPages.includes(page);
};

export const selectIsSinglesCacheValid = (state) => {
  const lastFetch = state.songs?.singlesLastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

export const selectSinglesCachedPageData = (page) => (state) => {
  const cachedData = state.songs?.singlesCachedData || {};
  return cachedData[page] || null;
};

// ✅ NEW: Memoized selectors for singles
export const selectSinglesWithMetadata = createSelector(
  [selectAllSingles, selectSinglesPagination, selectSongsStatus],
  (singles, pagination, status) => ({
    singles,
    pagination,
    status,
    count: singles.length,
    hasData: singles.length > 0
  })
);

// ✅ NEW: Filter singles by criteria
export const selectFilteredSingles = createSelector(
  [selectAllSingles, (_, filter) => filter],
  (singles, filter) => {
    if (!filter || typeof filter !== 'object') return singles;
    
    return singles.filter(single => {
      if (filter.genre && single.genre && 
          !single.genre.toLowerCase().includes(filter.genre.toLowerCase())) {
        return false;
      }
      
      if (filter.artist && single.artist && single.artist.name &&
          !single.artist.name.toLowerCase().includes(filter.artist.toLowerCase())) {
        return false;
      }
      
      if (filter.title && single.title &&
          !single.title.toLowerCase().includes(filter.title.toLowerCase())) {
        return false;
      }
      
      if (filter.year && single.releaseDate) {
        const releaseYear = new Date(single.releaseDate).getFullYear();
        if (releaseYear !== parseInt(filter.year)) {
          return false;
        }
      }
      
      return true;
    });
  }
);

// ✅ NEW: Get singles by access type
export const selectSinglesByAccessType = createSelector(
  [selectAllSingles, (_, accessType) => accessType],
  (singles, accessType) => {
    if (!accessType) return singles;
    return singles.filter(single => single.accessType === accessType);
  }
);

// ✅ NEW: Get free singles
export const selectFreeSingles = createSelector(
  [selectAllSingles],
  (singles) => singles.filter(single => 
    !single.basePrice || 
    single.basePrice.amount === 0 || 
    single.accessType === 'free'
  )
);

// ✅ NEW: Get premium singles
export const selectPremiumSingles = createSelector(
  [selectAllSingles],
  (singles) => singles.filter(single => 
    single.basePrice && 
    single.basePrice.amount > 0 && 
    single.accessType === 'purchase-only'
  )
);

// ✅ NEW: Get subscription singles
export const selectSubscriptionSingles = createSelector(
  [selectAllSingles],
  (singles) => singles.filter(single => single.accessType === 'subscription')
);

// ✅ NEW: Group singles by genre
export const selectSinglesGroupedByGenre = createSelector(
  [selectAllSingles],
  (singles) => {
    return singles.reduce((groups, single) => {
      const genre = single.genre || 'Unknown';
      if (!groups[genre]) {
        groups[genre] = [];
      }
      groups[genre].push(single);
      return groups;
    }, {});
  }
);

// ✅ NEW: Group singles by artist
export const selectSinglesGroupedByArtist = createSelector(
  [selectAllSingles],
  (singles) => {
    return singles.reduce((groups, single) => {
      const artistName = single.artist?.name || single.singer || 'Unknown';
      if (!groups[artistName]) {
        groups[artistName] = [];
      }
      groups[artistName].push(single);
      return groups;
    }, {});
  }
);

// ✅ NEW: Get singles statistics
export const selectSinglesStatistics = createSelector(
  [selectAllSingles],
  (singles) => {
    const total = singles.length;
    const free = singles.filter(s => !s.basePrice || s.basePrice.amount === 0).length;
    const premium = singles.filter(s => s.basePrice && s.basePrice.amount > 0).length;
    const subscription = singles.filter(s => s.accessType === 'subscription').length;
    
    const genres = [...new Set(singles.map(s => s.genre).filter(Boolean))];
    const artists = [...new Set(singles.map(s => s.artist?.name || s.singer).filter(Boolean))];
    
    return {
      total,
      free,
      premium,
      subscription,
      genreCount: genres.length,
      artistCount: artists.length,
      genres,
      artists: artists.slice(0, 10) // Limit to top 10 for performance
    };
  }
);

// ✅ OLD LIKED SONGS SELECTORS (NO CACHE)
export const selectLikedSongs = (state) => state.songs?.likedSongs?.songs || [];
export const selectLikedSongsTotal = (state) => state.songs?.likedSongs?.total || 0;
export const selectLikedSongsPage = (state) => state.songs?.likedSongs?.page || 1;
export const selectLikedSongsPages = (state) => state.songs?.likedSongs?.pages || 1;

// Legacy selectors for backward compatibility
export const selectTotalPages = (state) => state.songs?.pagination?.totalPages || 1;
export const selectCurrentPage = (state) => state.songs?.pagination?.page || 1;

// Album and Artist selectors
export const selectSongsByAlbum = (state, albumId) => state.songs?.songsByAlbum?.[albumId] || [];
export const selectSongsByArtist = createSelector(
  [state => state.songs, (_, artistId) => artistId],
  (songs, artistId) => songs?.songsByArtist?.[artistId] || {}
);

// ✅ NEW: Singles by Artist selectors
export const selectSinglesByArtist = createSelector(
  [state => state.songs, (_, artistId) => artistId],
  (songs, artistId) => songs?.singlesByArtist?.[artistId] || {}
);

export const selectSinglesByArtistSongs = (state, artistId) => 
  state.songs?.singlesByArtist?.[artistId]?.songs || [];

export const selectSinglesByArtistTotal = (state, artistId) => 
  state.songs?.singlesByArtist?.[artistId]?.total || 0;

export const selectSinglesByArtistPage = (state, artistId) => 
  state.songs?.singlesByArtist?.[artistId]?.page || 1;

export const selectSinglesByArtistPages = (state, artistId) => 
  state.songs?.singlesByArtist?.[artistId]?.pages || 1;

export const selectSinglesByArtistArtist = (state, artistId) => 
  state.songs?.singlesByArtist?.[artistId]?.artist || null;

// ✅ NEW: All singles by artist state
export const selectAllSinglesByArtist = (state) => state.songs?.singlesByArtist || {};

// ✅ NEW: Check if artist has singles loaded
export const selectHasArtistSingles = (state, artistId) => {
  const artistSingles = state.songs?.singlesByArtist?.[artistId];
  return Boolean(artistSingles && artistSingles.songs && artistSingles.songs.length > 0);
};

// ✅ NEW: Memoized selector for singles pagination info
export const selectSinglesByArtistPagination = createSelector(
  [state => state.songs, (_, artistId) => artistId],
  (songs, artistId) => {
    const artistData = songs?.singlesByArtist?.[artistId];
    return {
      page: artistData?.page || 1,
      pages: artistData?.pages || 1,
      total: artistData?.total || 0,
      hasMore: (artistData?.page || 1) < (artistData?.pages || 1)
    };
  }
);

// ✅ Cache selectors for paginated songs
export const selectIsCached = (state) => state.songs?.isCached || false;
export const selectLastFetchTime = (state) => state.songs?.lastFetchTime || null;
export const selectCachedPages = (state) => state.songs?.cachedPages || [];
export const selectCachedData = (state) => state.songs?.cachedData || {};

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
export const selectIsFullListCached = (state) => state.songs?.isFullListCached || false;
export const selectFullListLastFetchTime = (state) => state.songs?.fullListLastFetchTime || null;
export const selectIsFullListCacheValid = (state) => {
  const lastFetch = state.songs?.fullListLastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

// ✅ NEW: Matching genre cache utility selectors (existing)
export const selectIsMatchingGenreCached = (state) => state.songs?.isMatchingGenreCached || false;
export const selectMatchingGenreLastFetchTime = (state) => state.songs?.matchingGenreLastFetchTime || null;
export const selectMatchingGenreCachedPages = (state) => state.songs?.matchingGenreCachedPages || [];
export const selectMatchingGenreCachedData = (state) => state.songs?.matchingGenreCachedData || {};

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

// ✅ NEW: Per-genre cache selectors
export const selectGenreCacheState = (state) => state.songs?.genreCache || { lastFetchTime: null, cachedPagesByGenre: {}, cachedDataByGenre: {} };

export const selectIsGenreCacheValid = (state) => {
  const lastFetch = state.songs?.genreCache?.lastFetchTime;
  if (!lastFetch) return false;
  const cacheValidDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetch < cacheValidDuration;
};

export const selectIsGenrePageCached = (genre, page) => (state) => {
  const g = (genre || '').toString().trim().toLowerCase();
  const pages = state.songs?.genreCache?.cachedPagesByGenre?.[g] || [];
  return pages.includes(page);
};

export const selectGenreCachedPageData = (genre, page) => (state) => {
  const g = (genre || '').toString().trim().toLowerCase();
  const data = state.songs?.genreCache?.cachedDataByGenre?.[g] || {};
  return data[page] || null;
};

// ✅ NEW: Advanced memoized selectors for singles
export const selectFilteredSinglesByArtist = createSelector(
  [selectSinglesByArtistSongs, (_, __, filter) => filter],
  (songs, filter) => {
    if (!filter) return songs;
    return songs.filter(song => 
      song.title?.toLowerCase().includes(filter.toLowerCase()) ||
      song.genre?.toLowerCase().includes(filter.toLowerCase())
    );
  }
);

// ✅ NEW: Get all artists that have singles loaded
export const selectArtistsWithSingles = createSelector(
  [selectAllSinglesByArtist],
  (singlesByArtist) => {
    return Object.keys(singlesByArtist).filter(artistId => 
      singlesByArtist[artistId]?.songs?.length > 0
    );
  }
);

// ✅ NEW: Count total singles across all artists
export const selectTotalSinglesCount = createSelector(
  [selectAllSinglesByArtist],
  (singlesByArtist) => {
    return Object.values(singlesByArtist).reduce((total, artistData) => {
      return total + (artistData?.total || 0);
    }, 0);
  }
);

// ✅ NEW: Combined data selectors
export const selectSongsAndSinglesCount = createSelector(
  [selectAllSongs, selectAllSingles],
  (songs, singles) => ({
    songsCount: songs.length,
    singlesCount: singles.length,
    totalCount: songs.length + singles.length,
    hasSongs: songs.length > 0,
    hasSingles: singles.length > 0,
    hasAnyContent: songs.length > 0 || singles.length > 0
  })
);

// ✅ NEW: Recent singles selector (last 10)
export const selectRecentSingles = createSelector(
  [selectAllSingles],
  (singles) => {
    return [...singles]
      .sort((a, b) => new Date(b.createdAt || b.releaseDate || 0) - new Date(a.createdAt || a.releaseDate || 0))
      .slice(0, 10);
  }
);

// ✅ NEW: Popular singles selector (if you have play count or rating)
export const selectPopularSingles = createSelector(
  [selectAllSingles],
  (singles) => {
    return [...singles]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10);
  }
);

// ✅ NEW: Singles by price range
export const selectSinglesByPriceRange = createSelector(
  [selectAllSingles, (_, minPrice, maxPrice) => ({ minPrice, maxPrice })],
  (singles, { minPrice = 0, maxPrice = Infinity }) => {
    return singles.filter(single => {
      const price = single.basePrice?.amount || 0;
      return price >= minPrice && price <= maxPrice;
    });
  }
);

// ✅ NEW: Check if singles are loaded and cached
export const selectSinglesLoadingState = createSelector(
  [selectAllSingles, selectSongsStatus, selectIsSinglesCached, selectIsSinglesCacheValid],
  (singles, status, isCached, isCacheValid) => ({
    hasData: singles.length > 0,
    isLoading: status === 'loading',
    isError: status === 'failed',
    isCached,
    isCacheValid,
    needsRefresh: !isCached || !isCacheValid,
    isEmpty: singles.length === 0 && status !== 'loading'
  })
);