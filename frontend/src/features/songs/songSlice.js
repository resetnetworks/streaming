import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utills/axiosInstance.js';

// Create Song
export const createSong = createAsyncThunk('songs/create', async (formData, thunkAPI) => {
  try {
    const res = await axios.post('/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.song;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Create song failed');
  }
});

// Update Song
export const updateSong = createAsyncThunk('songs/update', async ({ id, formData }, thunkAPI) => {
  try {
    const res = await axios.put(`/songs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.song;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Update song failed');
  }
});

// Delete Song
export const deleteSong = createAsyncThunk('songs/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`/songs/${id}`);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Delete song failed');
  }
});

// Fetch All Songs
export const fetchAllSongs = createAsyncThunk(
  'songs/fetchAll',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/songs?page=${page}&limit=${limit}`);
      return {
        songs: res.data.songs,
        pagination: {
          page,
          limit,
          totalPages: res.data.totalPages || 1,
          total: res.data.total || 0,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Fetching songs failed');
    }
  }
);

// Fetch All Songs No Pagination
export const fetchAllSongsNoPagination = createAsyncThunk(
  'songs/fetchAllNoPagination',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/songs/all');
      return res.data.songs;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch all songs'
      );
    }
  }
);

// ✅ Fetch Liked Songs (OLD STRUCTURE - NO CACHE)
export const fetchLikedSongs = createAsyncThunk(
  'songs/fetchLikedSongs',
  async ({ page = 1, limit = 20 }, thunkAPI) => {
    try {
      const res = await axios.get('/songs/liked', {
        params: { page, limit },
      });
      return {
        songs: res.data.songs,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Fetching liked songs failed'
      );
    }
  }
);

// Fetch Songs by Album
export const fetchSongsByAlbum = createAsyncThunk(
  'albums/fetchSongsByAlbum',
  async (albumId) => {
    const response = await axios.get(`/songs/album/${albumId}`);
    return { albumId, songs: response.data };
  }
);

// Fetch Songs by Artist
export const fetchSongsByArtist = createAsyncThunk(
  'songs/fetchSongsByArtist',
  async ({ artistId, page = 1, limit = 20 }, thunkAPI) => {
    try {
      const res = await axios.get(`/songs/artist/${artistId}?page=${page}&limit=${limit}`);
      return {
        artistId,
        songs: res.data.songs,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
        artist: res.data.artist,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Fetching songs by artist failed'
      );
    }
  }
);

// Initial State with Cache System (NO LIKED SONGS CACHE)
const initialState = {
  songs: [],
  allSongs: [],
  fullSongList: [], // For no pagination
  // ✅ OLD LIKED SONGS STRUCTURE (NO CACHE)
  likedSongs: {
    songs: [],
    total: 0,
    page: 1,
    pages: 1,
  },
  songsByAlbum: {},
  songsByArtist: {},
  status: 'idle',
  error: null,
  message: null,
  
  // ✅ Pagination data
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // ✅ Cache system properties for paginated songs (NOT LIKED SONGS)
  isCached: false,
  lastFetchTime: null,
  cachedPages: [],
  cachedData: {}, // Store data for each page
  
  // ✅ Cache system properties for full song list (no pagination)
  isFullListCached: false,
  fullListLastFetchTime: null,
  
  // ✅ REMOVED ALL LIKED SONGS CACHE PROPERTIES
};

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
      state.likedSongs.songs = state.likedSongs.songs.filter((s) => s._id !== songId);
      state.likedSongs.total -= 1;
    },
    
    // ✅ Cache management reducers for paginated songs only
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
    
    // ✅ Clear full list cache
    clearFullListCache: (state) => {
      state.fullSongList = [];
      state.isFullListCached = false;
      state.fullListLastFetchTime = null;
    },
    
    // ✅ Clear all caches (ONLY PAGINATED AND FULL LIST)
    clearAllCaches: (state) => {
      // Clear paginated cache
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
      // Clear full list cache
      state.fullSongList = [];
      state.isFullListCached = false;
      state.fullListLastFetchTime = null;
    },
    
    setCachedData: (state, action) => {
      const { page, songs, pagination } = action.payload;
      state.cachedData[page] = { songs, pagination };
      if (!state.cachedPages.includes(page)) {
        state.cachedPages.push(page);
      }
    },
    
    loadFromCache: (state, action) => {
      const page = action.payload;
      if (state.cachedData[page]) {
        state.allSongs = state.cachedData[page].songs;
        state.pagination = state.cachedData[page].pagination;
      }
    },
    
    // ✅ Load full list from cache
    loadFullListFromCache: (state) => {
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSong.fulfilled, (state, action) => {
        state.songs.unshift(action.payload);
        state.allSongs.unshift(action.payload);
        state.status = 'succeeded';
        state.message = 'Song created successfully';
        
        // ✅ Clear caches when new song is created (NO LIKED SONGS CACHE)
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isFullListCached = false;
        state.fullListLastFetchTime = null;
      })
      
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.songs.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.songs[index] = action.payload;

        const allIndex = state.allSongs.findIndex((s) => s._id === action.payload._id);
        if (allIndex !== -1) state.allSongs[allIndex] = action.payload;
        
        // ✅ Update in full list cache as well
        const fullListIndex = state.fullSongList.findIndex((s) => s._id === action.payload._id);
        if (fullListIndex !== -1) state.fullSongList[fullListIndex] = action.payload;

        state.status = 'succeeded';
        state.message = 'Song updated successfully';
        
        // ✅ Clear caches when song is updated (NO LIKED SONGS CACHE)
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isFullListCached = false;
        state.fullListLastFetchTime = null;
      })
      
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter((s) => s._id !== action.payload);
        state.allSongs = state.allSongs.filter((s) => s._id !== action.payload);
        state.fullSongList = state.fullSongList.filter((s) => s._id !== action.payload);
        state.status = 'succeeded';
        state.message = 'Song deleted successfully';
        
        // ✅ Clear caches when song is deleted (NO LIKED SONGS CACHE)
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isFullListCached = false;
        state.fullListLastFetchTime = null;
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
      
      // ✅ Enhanced fetchAllSongsNoPagination with cache
      .addCase(fetchAllSongsNoPagination.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllSongsNoPagination.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.fullSongList = action.payload;
        
        // ✅ Cache the full song list
        state.isFullListCached = true;
        state.fullListLastFetchTime = Date.now();
      })
      .addCase(fetchAllSongsNoPagination.rejected, (state, action) => {
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
      
      .addCase(fetchSongsByAlbum.fulfilled, (state, action) => {
        state.songsByAlbum[action.payload.albumId] = action.payload.songs;
        state.status = 'succeeded';
      })
      
      .addCase(fetchSongsByArtist.fulfilled, (state, action) => {
        const { artistId, songs, total, page, pages, artist } = action.payload;
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

// ✅ Exports (REMOVED LIKED SONGS CACHE ACTIONS)
export const { 
  clearSongMessage, 
  clearLikedSongs, 
  removeSongFromLiked,
  clearCache,
  clearFullListCache,
  clearAllCaches,
  setCachedData,
  loadFromCache,
  loadFullListFromCache
} = songSlice.actions;

export default songSlice.reducer;
