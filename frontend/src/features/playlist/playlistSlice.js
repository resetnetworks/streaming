import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utills/axiosInstance";

// Fetch all playlists
export const fetchAllAdminPlaylists = createAsyncThunk(
  "playlists/fetchAllAdminPlaylists",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/adminPlaylist?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch playlists");
    }
  }
);

// Fetch single playlist
export const fetchAdminPlaylistById = createAsyncThunk(
  "playlists/fetchAdminPlaylistById",
  async (playlistId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/adminPlaylist/${playlistId}`);
      return res.data.playlist;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch playlist");
    }
  }
);

// Create playlist
export const createAdminPlaylist = createAsyncThunk(
  "playlists/createAdminPlaylist",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/adminPlaylist", payload);
      return res.data.playlist;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create playlist");
    }
  }
);

// Update playlist
export const updateAdminPlaylist = createAsyncThunk(
  "playlists/updateAdminPlaylist",
  async ({ playlistId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/adminPlaylist/${playlistId}`, payload);
      return res.data.playlist;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update playlist");
    }
  }
);

// Delete playlist
export const deleteAdminPlaylist = createAsyncThunk(
  "playlists/deleteAdminPlaylist",
  async (playlistId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/adminPlaylist/${playlistId}`);
      return playlistId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete playlist");
    }
  }
);

// Add song
export const addSongToAdminPlaylist = createAsyncThunk(
  "playlists/addSongToAdminPlaylist",
  async ({ playlistId, songId }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/adminPlaylist/${playlistId}/songs`, { songId });
      return res.data.playlist;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to add song");
    }
  }
);

// Remove song
export const removeSongFromAdminPlaylist = createAsyncThunk(
  "playlists/removeSongFromAdminPlaylist",
  async ({ playlistId, songId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/adminPlaylist/${playlistId}/songs/${songId}`);
      return res.data.playlist;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to remove song");
    }
  }
);

// Initial state
const initialState = {
  playlists: [],
  currentPlaylist: null,
  pagination: {},
  status: "idle",     // <- NEW
  error: null,
};

const playlistSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    clearCurrentPlaylist: (state) => {
      state.currentPlaylist = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch all
      .addCase(fetchAllAdminPlaylists.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllAdminPlaylists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlists = action.payload.playlists;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllAdminPlaylists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch one
      .addCase(fetchAdminPlaylistById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminPlaylistById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPlaylist = action.payload;
      })
      .addCase(fetchAdminPlaylistById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create
      .addCase(createAdminPlaylist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createAdminPlaylist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlists.unshift(action.payload);
      })
      .addCase(createAdminPlaylist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateAdminPlaylist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAdminPlaylist.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.playlists.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.playlists[idx] = action.payload;
      })
      .addCase(updateAdminPlaylist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAdminPlaylist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteAdminPlaylist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlists = state.playlists.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteAdminPlaylist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add song
      .addCase(addSongToAdminPlaylist.fulfilled, (state, action) => {
        state.currentPlaylist = action.payload;
      })

      // Remove song
      .addCase(removeSongFromAdminPlaylist.fulfilled, (state, action) => {
        state.currentPlaylist = action.payload;
      });
  },
});

export const { clearCurrentPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
