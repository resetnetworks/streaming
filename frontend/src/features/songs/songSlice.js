import { createSlice } from '@reduxjs/toolkit';
import { 
  initialState,
  createSong,
  updateSong,
  deleteSong,
  fetchAllSongs,
  fetchAllSingles,
  fetchLikedSongs,
  fetchSongsMatchingUserGenres,
  fetchSongsByAlbum,
  fetchSongsByArtist,
  fetchSinglesSongByArtist,
  fetchSongsByGenre
} from './songThunks.js';

// ✅ Helper function to ensure object exists
const ensureMatchingGenreState = (state) => {
  if (!state.matchingGenreSongs) {
    state.matchingGenreSongs = {
      songs: [],
      matchingGenres: [],
      total: 0,
      page: 1,
      pages: 1,
    };
  }
  if (!state.matchingGenrePagination) {
    state.matchingGenrePagination = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
  }
  if (!state.matchingGenreCachedData) {
    state.matchingGenreCachedData = {};
  }
  if (!state.matchingGenreCachedPages) {
    state.matchingGenreCachedPages = [];
  }
};

// ✅ NEW: helpers for the per-genre cache branch
const ensureGenreCacheState = (state) => {
  if (!state.genreSongs) {
    state.genreSongs = { genre: null, songs: [], total: 0, page: 1, pages: 1 };
  }
  if (!state.genreCache) {
    state.genreCache = { lastFetchTime: null, cachedPagesByGenre: {}, cachedDataByGenre: {} };
  }
  if (!state.genreCache.cachedPagesByGenre) state.genreCache.cachedPagesByGenre = {};
  if (!state.genreCache.cachedDataByGenre) state.genreCache.cachedDataByGenre = {};
};

const normalizeGenreKey = (g) => (g || '').toString().trim().toLowerCase();

// Slice
const songSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    clearSongMessage: (state) => {
      state.error = null;
      state.message = null;
    },
    
    // ✅ OLD CLEAR LIKED SONGS (NO CACHE)
    clearLikedSongs: (state) => {
      state.likedSongs = {
        songs: [],
        total: 0,
        page: 1,
        pages: 1,
      };
    },
    
    // ✅ OLD REMOVE SONG FROM LIKED (NO CACHE)
    removeSongFromLiked: (state, action) => {
      const songId = action.payload;
      if (state.likedSongs?.songs) {
        state.likedSongs.songs = state.likedSongs.songs.filter((s) => s._id !== songId);
        state.likedSongs.total = Math.max(0, state.likedSongs.total - 1);
      }
    },
    
    // ✅ NEW: Clear current genre songs (for genre page)
    clearGenreSongs: (state) => {
      ensureGenreCacheState(state);
      state.genreSongs = {
        genre: null,
        songs: [],
        total: 0,
        page: 1,
        pages: 1,
      };
    },
    
    // ✅ NEW: Clear singles by artist
    clearSinglesByArtist: (state) => {
      state.singlesByArtist = {};
    },
    
    // ✅ NEW: Clear all singles
    clearAllSingles: (state) => {
      state.allSingles = [];
      state.isSinglesCached = false;
      state.singlesLastFetchTime = null;
      state.singlesCachedPages = [];
      state.singlesCachedData = {};
      state.singlesPagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    
    // ✅ NEW: Clear matching genre songs cache
    clearMatchingGenreSongs: (state) => {
      ensureMatchingGenreState(state);
      state.matchingGenreSongs = {
        songs: [],
        matchingGenres: [],
        total: 0,
        page: 1,
        pages: 1,
      };
      state.isMatchingGenreCached = false;
      state.matchingGenreLastFetchTime = null;
      state.matchingGenreCachedPages = [];
      state.matchingGenreCachedData = {};
      state.matchingGenrePagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
    
    // ✅ Cache management reducers for regular paginated songs
    clearCache: (state) => {
      state.allSongs = [];
      state.isCached = false;
      state.lastFetchTime = null;
      state.cachedPages = [];
      state.cachedData = {};
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    
    // ✅ NEW: Clear singles cache
    clearSinglesCache: (state) => {
      state.allSingles = [];
      state.isSinglesCached = false;
      state.singlesLastFetchTime = null;
      state.singlesCachedPages = [];
      state.singlesCachedData = {};
      state.singlesPagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    
    // ✅ NEW: Clear matching genre cache
    clearMatchingGenreCache: (state) => {
      ensureMatchingGenreState(state);
      state.matchingGenreSongs.songs = [];
      state.isMatchingGenreCached = false;
      state.matchingGenreLastFetchTime = null;
      state.matchingGenreCachedPages = [];
      state.matchingGenreCachedData = {};
      state.matchingGenrePagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
    
    // ✅ Clear all caches (INCLUDING MATCHING GENRE + PER-GENRE CACHE + SINGLES)
    clearAllCaches: (state) => {
      // Clear regular paginated cache
      state.allSongs = [];
      state.isCached = false;
      state.lastFetchTime = null;
      state.cachedPages = [];
      state.cachedData = {};
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      
      // Clear singles cache
      state.allSingles = [];
      state.isSinglesCached = false;
      state.singlesLastFetchTime = null;
      state.singlesCachedPages = [];
      state.singlesCachedData = {};
      state.singlesPagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      
      // Clear matching genre cache
      ensureMatchingGenreState(state);
      state.matchingGenreSongs.songs = [];
      state.isMatchingGenreCached = false;
      state.matchingGenreLastFetchTime = null;
      state.matchingGenreCachedPages = [];
      state.matchingGenreCachedData = {};
      state.matchingGenrePagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      
      // Clear per-genre cache
      ensureGenreCacheState(state);
      state.genreSongs = { genre: null, songs: [], total: 0, page: 1, pages: 1 };
      state.genreCache = { lastFetchTime: null, cachedPagesByGenre: {}, cachedDataByGenre: {} };
      
      // Clear singles by artist
      state.singlesByArtist = {};
    },
    
    setCachedData: (state, action) => {
      const { page, songs, pagination } = action.payload;
      if (!state.cachedData) state.cachedData = {};
      if (!state.cachedPages) state.cachedPages = [];
      
      state.cachedData[page] = { songs, pagination };
      if (!state.cachedPages.includes(page)) {
        state.cachedPages.push(page);
      }
    },
    
    // ✅ NEW: Singles cache management
    setSinglesCachedData: (state, action) => {
      const { page, singles, pagination } = action.payload;
      if (!state.singlesCachedData) state.singlesCachedData = {};
      if (!state.singlesCachedPages) state.singlesCachedPages = [];
      
      state.singlesCachedData[page] = { singles, pagination };
      if (!state.singlesCachedPages.includes(page)) {
        state.singlesCachedPages.push(page);
      }
    },
    
    loadFromCache: (state, action) => {
      const page = action.payload;
      if (state.cachedData && state.cachedData[page]) {
        state.allSongs = state.cachedData[page].songs;
        state.pagination = state.cachedData[page].pagination;
      }
    },
    
    // ✅ NEW: Load singles from cache
    loadSinglesFromCache: (state, action) => {
      const page = action.payload;
      if (state.singlesCachedData && state.singlesCachedData[page]) {
        state.allSingles = state.singlesCachedData[page].singles;
        state.singlesPagination = state.singlesCachedData[page].pagination;
      }
    },
    
    // ✅ Matching genre cache management
    setMatchingGenreCachedData: (state, action) => {
      const { page, songs, pagination, matchingGenres } = action.payload;
      ensureMatchingGenreState(state);
      
      state.matchingGenreCachedData[page] = { 
        songs: songs || [], 
        pagination: pagination || {}, 
        matchingGenres: matchingGenres || [] 
      };
      
      if (!state.matchingGenreCachedPages.includes(page)) {
        state.matchingGenreCachedPages.push(page);
      }
    },
    
    loadMatchingGenreFromCache: (state, action) => {
      const page = action.payload;
      ensureMatchingGenreState(state);
      
      if (state.matchingGenreCachedData[page]) {
        const cachedData = state.matchingGenreCachedData[page];
        state.matchingGenreSongs.songs = cachedData.songs || [];
        state.matchingGenreSongs.matchingGenres = cachedData.matchingGenres || [];
        state.matchingGenrePagination = cachedData.pagination || state.matchingGenrePagination;
        state.status = 'succeeded';
      }
    },

    // ✅ NEW: per-genre cache management
    setGenreCachedData: (state, action) => {
      ensureGenreCacheState(state);
      const { genre, page, songs, pagination } = action.payload;
      const key = normalizeGenreKey(genre);

      if (!state.genreCache.cachedDataByGenre[key]) state.genreCache.cachedDataByGenre[key] = {};
      state.genreCache.cachedDataByGenre[key][page] = { songs: songs || [], pagination: pagination || {} };

      if (!state.genreCache.cachedPagesByGenre[key]) state.genreCache.cachedPagesByGenre[key] = [];
      if (!state.genreCache.cachedPagesByGenre[key].includes(page)) {
        state.genreCache.cachedPagesByGenre[key].push(page);
      }

      state.genreCache.lastFetchTime = Date.now();
    },

    loadGenreFromCache: (state, action) => {
      ensureGenreCacheState(state);
      const { genre, page } = action.payload;
      const key = normalizeGenreKey(genre);
      const cached = state.genreCache.cachedDataByGenre[key]?.[page];
      if (cached) {
        state.genreSongs.genre = genre;
        state.genreSongs.songs = cached.songs || [];
        state.genreSongs.page = page;
        state.genreSongs.pages = cached.pagination?.totalPages || 1;
        state.genreSongs.total = cached.pagination?.total || 0;
        state.status = 'succeeded';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSong.fulfilled, (state, action) => {
        state.songs.unshift(action.payload);
        state.allSongs.unshift(action.payload);
        state.status = 'succeeded';
        state.message = 'Song created successfully';
        
        // ✅ Clear all caches when new song is created
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isSinglesCached = false;
        state.singlesCachedPages = [];
        state.singlesCachedData = {};
        state.singlesLastFetchTime = null;
        state.isMatchingGenreCached = false;
        state.matchingGenreCachedPages = [];
        state.matchingGenreCachedData = {};
        state.matchingGenreLastFetchTime = null;

        // also clear per-genre cache and singles
        state.genreSongs = { genre: null, songs: [], total: 0, page: 1, pages: 1 };
        state.genreCache = { lastFetchTime: null, cachedPagesByGenre: {}, cachedDataByGenre: {} };
        state.singlesByArtist = {};
      })
      
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.songs.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.songs[index] = action.payload;

        const allIndex = state.allSongs.findIndex((s) => s._id === action.payload._id);
        if (allIndex !== -1) state.allSongs[allIndex] = action.payload;

        // ✅ Update in all singles
        const singlesIndex = state.allSingles.findIndex((s) => s._id === action.payload._id);
        if (singlesIndex !== -1) state.allSingles[singlesIndex] = action.payload;

        // ✅ Update in matching genre cache as well with safety check
        ensureMatchingGenreState(state);
        const matchingIndex = state.matchingGenreSongs.songs.findIndex((s) => s._id === action.payload._id);
        if (matchingIndex !== -1) state.matchingGenreSongs.songs[matchingIndex] = action.payload;

        // ✅ Update in current genre songs
        ensureGenreCacheState(state);
        const genreIndex = state.genreSongs.songs.findIndex((s) => s._id === action.payload._id);
        if (genreIndex !== -1) state.genreSongs.songs[genreIndex] = action.payload;

        // ✅ Update in singles by artist
        Object.keys(state.singlesByArtist).forEach(artistId => {
          const singlesIndex = state.singlesByArtist[artistId]?.songs?.findIndex((s) => s._id === action.payload._id);
          if (singlesIndex !== -1) {
            state.singlesByArtist[artistId].songs[singlesIndex] = action.payload;
          }
        });

        state.status = 'succeeded';
        state.message = 'Song updated successfully';
        
        // ✅ Clear caches
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isSinglesCached = false;
        state.singlesCachedPages = [];
        state.singlesCachedData = {};
        state.singlesLastFetchTime = null;
        state.isMatchingGenreCached = false;
        state.matchingGenreCachedPages = [];
        state.matchingGenreCachedData = {};
        state.matchingGenreLastFetchTime = null;

        // per-genre and singles
        state.genreSongs = { genre: null, songs: [], total: 0, page: 1, pages: 1 };
        state.genreCache = { lastFetchTime: null, cachedPagesByGenre: {}, cachedDataByGenre: {} };
        state.singlesByArtist = {};
      })
      
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter((s) => s._id !== action.payload);
        state.allSongs = state.allSongs.filter((s) => s._id !== action.payload);
        state.allSingles = state.allSingles.filter((s) => s._id !== action.payload);
        
        // ✅ Filter with safety check
        ensureMatchingGenreState(state);
        state.matchingGenreSongs.songs = state.matchingGenreSongs.songs.filter((s) => s._id !== action.payload);
        
        // ✅ Filter from current genre songs
        ensureGenreCacheState(state);
        state.genreSongs.songs = state.genreSongs.songs.filter((s) => s._id !== action.payload);
        
        // ✅ Filter from singles by artist
        Object.keys(state.singlesByArtist).forEach(artistId => {
          if (state.singlesByArtist[artistId]?.songs) {
            state.singlesByArtist[artistId].songs = state.singlesByArtist[artistId].songs.filter((s) => s._id !== action.payload);
          }
        });
        
        state.status = 'succeeded';
        state.message = 'Song deleted successfully';
        
        // ✅ Clear caches
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isSinglesCached = false;
        state.singlesCachedPages = [];
        state.singlesCachedData = {};
        state.singlesLastFetchTime = null;
        state.isMatchingGenreCached = false;
        state.matchingGenreCachedPages = [];
        state.matchingGenreCachedData = {};
        state.matchingGenreLastFetchTime = null;

        // per-genre and singles
        state.genreSongs = { genre: null, songs: [], total: 0, page: 1, pages: 1 };
        state.genreCache = { lastFetchTime: null, cachedPagesByGenre: {}, cachedDataByGenre: {} };
        state.singlesByArtist = {};
      })
      
      .addCase(fetchAllSongs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllSongs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allSongs = action.payload.songs;
        state.pagination = action.payload.pagination;
        
        // ✅ Cache the data
        state.isCached = true;
        state.lastFetchTime = Date.now();
        const page = action.payload.pagination.page;
        
        if (!state.cachedData) state.cachedData = {};
        if (!state.cachedPages) state.cachedPages = [];
        
        state.cachedData[page] = {
          songs: action.payload.songs,
          pagination: action.payload.pagination,
        };
        if (!state.cachedPages.includes(page)) {
          state.cachedPages.push(page);
        }
      })
      .addCase(fetchAllSongs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // ✅ NEW: Fetch All Singles cases
      .addCase(fetchAllSingles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllSingles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allSingles = action.payload.singles;
        state.singlesPagination = action.payload.pagination;
        
        // ✅ Cache the singles data
        state.isSinglesCached = true;
        state.singlesLastFetchTime = Date.now();
        const page = action.payload.pagination.page;
        
        if (!state.singlesCachedData) state.singlesCachedData = {};
        if (!state.singlesCachedPages) state.singlesCachedPages = [];
        
        state.singlesCachedData[page] = {
          singles: action.payload.singles,
          pagination: action.payload.pagination,
        };
        if (!state.singlesCachedPages.includes(page)) {
          state.singlesCachedPages.push(page);
        }
      })
      .addCase(fetchAllSingles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // ✅ OLD LIKED SONGS IMPLEMENTATION (NO CACHE)
      .addCase(fetchLikedSongs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLikedSongs.fulfilled, (state, action) => {
        const { songs, total, page, pages } = action.payload;
        if (!state.likedSongs) {
          state.likedSongs = { songs: [], total: 0, page: 1, pages: 1 };
        }
        
        const existing = state.likedSongs.songs;
        const unique = songs.filter((s) => !existing.some((e) => e._id === s._id));
        state.likedSongs = {
          songs: [...existing, ...unique],
          total,
          page,
          pages,
        };
        state.status = 'succeeded';
      })
      .addCase(fetchLikedSongs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // ✅ FIXED: Songs matching user genres implementation WITH CACHE
      .addCase(fetchSongsMatchingUserGenres.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSongsMatchingUserGenres.fulfilled, (state, action) => {
        const { songs, matchingGenres, total, page, pages, pagination } = action.payload;
        ensureMatchingGenreState(state);
        
        state.matchingGenreSongs.songs = songs || [];
        state.matchingGenreSongs.matchingGenres = matchingGenres || [];
        state.matchingGenreSongs.total = total || 0;
        state.matchingGenreSongs.page = page || 1;
        state.matchingGenreSongs.pages = pages || 1;
        state.matchingGenrePagination = pagination || {
          page: page || 1,
          limit: 20,
          total: total || 0,
          totalPages: pages || 1,
        };
        
        state.isMatchingGenreCached = true;
        state.matchingGenreLastFetchTime = Date.now();
        
        state.matchingGenreCachedData[page || 1] = {
          songs: songs || [],
          matchingGenres: matchingGenres || [],
          pagination: pagination || state.matchingGenrePagination,
        };
        
        if (!state.matchingGenreCachedPages.includes(page || 1)) {
          state.matchingGenreCachedPages.push(page || 1);
        }
        
        state.status = 'succeeded';
      })
      .addCase(fetchSongsMatchingUserGenres.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(fetchSongsByAlbum.fulfilled, (state, action) => {
        if (!state.songsByAlbum) state.songsByAlbum = {};
        state.songsByAlbum[action.payload.albumId] = action.payload.songs;
        state.status = 'succeeded';
      })
      
      .addCase(fetchSongsByArtist.fulfilled, (state, action) => {
        const { artistId, songs, total, page, pages, artist } = action.payload;
        if (!state.songsByArtist) state.songsByArtist = {};
        
        const existing = state.songsByArtist[artistId]?.songs || [];
        const uniqueSongs = songs.filter(
          (song) => !existing.some((existingSong) => existingSong._id === song._id)
        );
        state.songsByArtist[artistId] = {
          songs: [...existing, ...uniqueSongs],
          total,
          page,
          pages,
          artist,
        };
        state.status = 'succeeded';
      })

      // ✅ NEW: Fetch Singles by Artist cases
      .addCase(fetchSinglesSongByArtist.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSinglesSongByArtist.fulfilled, (state, action) => {
        const { artistId, songs, total, page, pages, artist } = action.payload;
        if (!state.singlesByArtist) state.singlesByArtist = {};
        
        const existing = state.singlesByArtist[artistId]?.songs || [];
        const uniqueSongs = songs.filter(
          (song) => !existing.some((existingSong) => existingSong._id === song._id)
        );
        state.singlesByArtist[artistId] = {
          songs: [...existing, ...uniqueSongs],
          total,
          page,
          pages,
          artist,
        };
        state.status = 'succeeded';
      })
      .addCase(fetchSinglesSongByArtist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ✅ UPDATED: per-genre fulfilled with append support
      .addCase(fetchSongsByGenre.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSongsByGenre.fulfilled, (state, action) => {
        ensureGenreCacheState(state);
        const { genre, songs, total, page, pages, pagination, append } = action.payload;

        state.genreSongs.genre = genre || null;
        state.genreSongs.total = total || 0;
        state.genreSongs.page = page || 1;
        state.genreSongs.pages = pages || 1;

        // ✅ Handle append logic for infinite scroll
        if (append && state.genreSongs.songs.length > 0) {
          // Filter out duplicates and append new songs
          const existingSongIds = new Set(state.genreSongs.songs.map(s => s._id));
          const newSongs = (songs || []).filter(song => !existingSongIds.has(song._id));
          state.genreSongs.songs = [...state.genreSongs.songs, ...newSongs];
        } else {
          // Replace songs (first load or refresh)
          state.genreSongs.songs = songs || [];
        }

        // Update cache
        const key = normalizeGenreKey(genre);
        if (!state.genreCache.cachedDataByGenre[key]) state.genreCache.cachedDataByGenre[key] = {};
        state.genreCache.cachedDataByGenre[key][page || 1] = {
          songs: songs || [],
          pagination: pagination || { page: page || 1, limit: 20, total: total || 0, totalPages: pages || 1 },
        };
        if (!state.genreCache.cachedPagesByGenre[key]) state.genreCache.cachedPagesByGenre[key] = [];
        if (!state.genreCache.cachedPagesByGenre[key].includes(page || 1)) {
          state.genreCache.cachedPagesByGenre[key].push(page || 1);
        }
        state.genreCache.lastFetchTime = Date.now();

        state.status = 'succeeded';
      })
      .addCase(fetchSongsByGenre.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addMatcher(
        (action) => action.type.startsWith('songs/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('songs/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Something went wrong';
        }
      );
  },
});

export const { 
  clearSongMessage, 
  clearLikedSongs, 
  removeSongFromLiked,
  clearGenreSongs,
  clearSinglesByArtist,
  clearAllSingles, // ✅ NEW: Export singles clear action
  clearMatchingGenreSongs,
  clearCache,
  clearSinglesCache, // ✅ NEW: Export singles cache clear action
  clearMatchingGenreCache,
  clearAllCaches,
  setCachedData,
  setSinglesCachedData, // ✅ NEW: Export singles cache setter
  loadFromCache,
  loadSinglesFromCache, // ✅ NEW: Export singles cache loader
  setMatchingGenreCachedData,
  loadMatchingGenreFromCache,
  setGenreCachedData,
  loadGenreFromCache,
} = songSlice.actions;

export default songSlice.reducer;

// ✅ EXPORT ASYNC THUNKS for external use
export {
  createSong,
  updateSong,
  deleteSong,
  fetchAllSongs,
  fetchAllSingles,
  fetchLikedSongs,
  fetchSongsMatchingUserGenres,
  fetchSongsByAlbum,
  fetchSongsByArtist,
  fetchSinglesSongByArtist,
  fetchSongsByGenre
};
