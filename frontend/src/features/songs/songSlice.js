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
        totalPages: res.data.totalPages || 1,
        currentPage: page,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Fetching songs failed');
    }
  }
);

// Fetch Liked Songs
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

// Initial State
const initialState = {
  songs: [],
  allSongs: [],
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
  totalPages: 1,
  currentPage: 1,
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
    clearLikedSongs: (state) => {
      state.likedSongs = initialState.likedSongs;
    },
    removeSongFromLiked: (state, action) => {
      const songId = action.payload;
      state.likedSongs.songs = state.likedSongs.songs.filter((s) => s._id !== songId);
      state.likedSongs.total -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSong.fulfilled, (state, action) => {
        state.songs.unshift(action.payload);
        state.allSongs.unshift(action.payload);
        state.status = 'succeeded';
        state.message = 'Song created successfully';
      })
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.songs.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.songs[index] = action.payload;

        const allIndex = state.allSongs.findIndex((s) => s._id === action.payload._id);
        if (allIndex !== -1) state.allSongs[allIndex] = action.payload;

        state.status = 'succeeded';
        state.message = 'Song updated successfully';
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter((s) => s._id !== action.payload);
        state.allSongs = state.allSongs.filter((s) => s._id !== action.payload);
        state.status = 'succeeded';
        state.message = 'Song deleted successfully';
      })
      .addCase(fetchAllSongs.fulfilled, (state, action) => {
        const { songs, totalPages, currentPage } = action.payload;
        const newUniqueSongs = songs.filter(
          (song) => !state.allSongs.some((existing) => existing._id === song._id)
        );
        state.allSongs = [...state.allSongs, ...newUniqueSongs];
        state.totalPages = totalPages;
        state.currentPage = currentPage;
        state.status = 'succeeded';
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

// Exports
export const { clearSongMessage, clearLikedSongs, removeSongFromLiked } = songSlice.actions;
export default songSlice.reducer;
