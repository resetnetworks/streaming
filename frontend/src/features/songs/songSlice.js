// songSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utills/axiosInstance.js';

// Thunks
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

export const deleteSong = createAsyncThunk('songs/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`/songs/${id}`);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Delete song failed');
  }
});

export const fetchAllSongs = createAsyncThunk(
  'songs/fetchAll',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/songs?page=${page}&limit=${limit}`);
      console.log("song fetch")
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

export const fetchLikedSongs = createAsyncThunk('songs/fetchLikedSongs', async (likedSongIds, thunkAPI) => {
  try {
    const res = await axios.post('/songs/liked', { ids: likedSongIds });
    return res.data.likedSongs;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Fetching liked songs failed');
  }
});

export const fetchSongsByAlbum = createAsyncThunk(
  'albums/fetchSongsByAlbum',
  async (albumId) => {
    const response = await axios.get(`/songs/album/${albumId}`);
    return { albumId, songs: response.data };
  }
);

// ✅ NEW THUNK: Fetch Songs by Artist
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
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Fetching songs by artist failed');
    }
  }
);

// Initial State
const initialState = {
  songs: [],            // for quick access
  allSongs: [],         // paginated for homepage etc.
  likedSongs: [],
  songsByAlbum: {},
  songsByArtist: {},    // artistId: { songs, page, pages, total, artist }
  status: 'idle',
  error: null,
  message: null,
  totalPages: 1,
  currentPage: 1,
};

const songSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    clearSongMessage: (state) => {
      state.error = null;
      state.message = null;
    },
    clearLikedSongs: (state) => {
      state.likedSongs = [];
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
        state.likedSongs = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchSongsByAlbum.fulfilled, (state, action) => {
        state.songsByAlbum[action.payload.albumId] = action.payload.songs;
        state.status = 'succeeded';
      })
      // ✅ NEW CASE: fetchSongsByArtist
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
      // Generic matchers
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

export const { clearSongMessage, clearLikedSongs } = songSlice.actions;
export default songSlice.reducer;
