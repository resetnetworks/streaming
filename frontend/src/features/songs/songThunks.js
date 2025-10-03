import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utills/axiosInstance.js';

// ✅ INITIAL STATE (moved to Part 1)
export const initialState = {
  songs: [],
  allSongs: [],
  
  // ✅ NEW: All singles state
  allSingles: [],
  
  // ✅ OLD LIKED SONGS STRUCTURE (NO CACHE)
  likedSongs: {
    songs: [],
    total: 0,
    page: 1,
    pages: 1,
  },
  
  // ✅ NEW: Songs matching user genres
  matchingGenreSongs: {
    songs: [],
    matchingGenres: [],
    total: 0,
    page: 1,
    pages: 1,
  },

  // ✅ NEW: Songs by a specific genre (active view)
  genreSongs: {
    genre: null,
    songs: [],
    total: 0,
    page: 1,
    pages: 1,
  },
  
  songsByAlbum: {},
  songsByArtist: {},
  singlesByArtist: {}, // ✅ NEW: Singles by artist
  status: 'idle',
  error: null,
  message: null,
  
  // ✅ Pagination data for regular songs
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // ✅ NEW: Pagination data for singles
  singlesPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // ✅ Cache system properties for paginated songs
  isCached: false,
  lastFetchTime: null,
  cachedPages: [],
  cachedData: {}, // Store data for each page
  
  // ✅ NEW: Cache system properties for singles
  isSinglesCached: false,
  singlesLastFetchTime: null,
  singlesCachedPages: [],
  singlesCachedData: {}, // Store singles data for each page
  
  // ✅ NEW: Cache system properties for matching genre songs
  isMatchingGenreCached: false,
  matchingGenreLastFetchTime: null,
  matchingGenreCachedPages: [],
  matchingGenreCachedData: {}, // Store data for each page
  matchingGenrePagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  // ✅ NEW: per-genre cache (multiple genres independently cached)
  genreCache: {
    lastFetchTime: null,
    cachedPagesByGenre: {},     // { [genreLower]: number[] }
    cachedDataByGenre: {},      // { [genreLower]: { [page]: { songs, pagination } } }
  },
};

// ✅ ALL ASYNC THUNKS

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

// ✅ NEW: Fetch All Singles
export const fetchAllSingles = createAsyncThunk(
  'songs/fetchAllSingles',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/songs/singles?page=${page}&limit=${limit}`);
      return {
        singles: res.data.songs,
        pagination: {
          page,
          limit,
          totalPages: res.data.totalPages || 1,
          total: res.data.total || 0,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Fetching singles failed');
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

// ✅ NEW: Fetch Songs Matching User Genres WITH CACHE
export const fetchSongsMatchingUserGenres = createAsyncThunk(
  'songs/fetchSongsMatchingUserGenres',
  async ({ page = 1, limit = 20 }, thunkAPI) => {
    try {
      const res = await axios.get('/songs/matching-genre', {
        params: { page, limit },
      });      
      return {
        songs: res.data.songs || [],
        matchingGenres: res.data.matchingGenres || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        pages: res.data.pages || 1,
        pagination: {
          page: res.data.page || page,
          limit,
          totalPages: res.data.pages || 1,
          total: res.data.total || 0,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Fetching songs matching user genres failed'
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

// ✅ NEW: Fetch Singles by Artist
export const fetchSinglesSongByArtist = createAsyncThunk(
  'songs/fetchSinglesByArtist',
  async ({ artistId, page = 1, limit = 20 }, thunkAPI) => {
    try {
      const res = await axios.get(`/songs/singles/artist/${artistId}?page=${page}&limit=${limit}`);
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
        err.response?.data?.message || 'Fetching singles by artist failed'
      );
    }
  }
);

// ✅ UPDATED: Fetch Songs By Genre with cache and append support
export const fetchSongsByGenre = createAsyncThunk(
  'songs/fetchSongsByGenre',
  async ({ genre, page = 1, limit = 20, append = false }, thunkAPI) => {
    try {
      const res = await axios.get(`/songs/genre/${encodeURIComponent(genre)}?page=${page}&limit=${limit}`);
      return {
        genre,
        songs: res.data.songs || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        pages: res.data.pages || 1,
        append, // Pass through the append flag
        pagination: {
          page: res.data.page || page,
          limit,
          total: res.data.total || 0,
          totalPages: res.data.pages || 1,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Fetching songs by genre failed'
      );
    }
  }
);
