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

export const fetchAllSongs = createAsyncThunk('songs/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/songs');
    return res.data.songs;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Fetching songs failed');
  }
});

// Slice
const songSlice = createSlice({
  name: 'songs',
  initialState: {
    songs: [],
    status: 'idle',
    error: null,
    message: null,
  },
  reducers: {
    clearSongMessage: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSong.fulfilled, (state, action) => {
        state.songs.unshift(action.payload);
        state.status = 'succeeded';
        state.message = 'Song created successfully';
      })
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.songs.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.songs[index] = action.payload;
        state.status = 'succeeded';
        state.message = 'Song updated successfully';
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter((s) => s._id !== action.payload);
        state.status = 'succeeded';
        state.message = 'Song deleted successfully';
      })
      .addCase(fetchAllSongs.fulfilled, (state, action) => {
        state.songs = action.payload;
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

export const { clearSongMessage } = songSlice.actions;
export default songSlice.reducer;
