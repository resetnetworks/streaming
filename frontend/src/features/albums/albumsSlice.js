import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunk: Fetch all albums with pagination
export const fetchAllAlbums = createAsyncThunk(
  "albums/fetchAll",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/albums?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch albums"
      );
    }
  }
);

// Thunk: Create new album
export const createAlbum = createAsyncThunk(
  "albums/create",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/albums", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.album;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create album"
      );
    }
  }
);

// Thunk: Update album by ID
export const updateAlbum = createAsyncThunk(
  "albums/update",
  async ({ albumId, formData }, thunkAPI) => {
    try {
      const res = await axios.put(`/albums/${albumId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.album;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update album"
      );
    }
  }
);

// Thunk: Delete album by ID
export const deleteAlbumById = createAsyncThunk(
  "albums/delete",
  async (albumId, thunkAPI) => {
    try {
      await axios.delete(`/albums/${albumId}`);
      return albumId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete album"
      );
    }
  }
);

// Thunk: Fetch albums by artist with pagination
export const getAlbumsByArtist = createAsyncThunk(
  "albums/getByArtist",
  async ({ artistId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(`/albums/artist/${artistId}?page=${page}&limit=${limit}`);
      return {
        albums: res.data.albums,
        pagination: res.data.pagination,
        artistInfo: res.data.artist,
        page,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch albums for artist"
      );
    }
  }
);

// Thunk: Fetch album by ID or slug
export const fetchAlbumById = createAsyncThunk(
  "albums/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`/albums/${id}`);
      return res.data.album;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch album"
      );
    }
  }
);

const initialState = {
  allAlbums: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  artistAlbums: [],
  artistAlbumPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  artistInfo: null,
  albumDetails: null,
  albumForm: {
    title: "",
    description: "",
    artist: "",
    cover: "",
    genre: "",
    songs: [""],
    price: "",
  },
  editingAlbum: null,
  loading: false,
  error: null,
};

const albumsSlice = createSlice({
  name: "albums",
  initialState,
  reducers: {
    setAlbumForm: (state, action) => {
      state.albumForm = action.payload;
    },
    setEditingAlbum: (state, action) => {
      state.editingAlbum = action.payload;
    },
    clearEditingAlbum: (state) => {
      state.editingAlbum = null;
    },
    setAlbums: (state, action) => {
      state.allAlbums = action.payload;
    },
    deleteAlbum: (state, action) => {
      state.allAlbums = state.allAlbums.filter((_, i) => i !== action.payload);
      if (state.editingAlbum === action.payload) state.editingAlbum = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Albums
      .addCase(fetchAllAlbums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAlbums.fulfilled, (state, action) => {
        state.loading = false;
        const page = action.payload.pagination?.page || 1;

        if (page === 1) {
          state.allAlbums = action.payload.albums;
        } else {
          const existingIds = new Set(state.allAlbums.map((a) => a._id));
          const newAlbums = action.payload.albums.filter((a) => !existingIds.has(a._id));
          state.allAlbums = [...state.allAlbums, ...newAlbums];
        }

        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Album
      .addCase(createAlbum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.loading = false;
        state.allAlbums.unshift(action.payload);
        state.albumForm = initialState.albumForm;
        state.editingAlbum = null;
      })
      .addCase(createAlbum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Album
      .addCase(updateAlbum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.allAlbums.findIndex((a) => a._id === updated._id);
        if (index !== -1) {
          state.allAlbums[index] = updated;
        }
        state.editingAlbum = null;
      })
      .addCase(updateAlbum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Albums by Artist
      .addCase(getAlbumsByArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAlbumsByArtist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.artistAlbums = action.payload.albums;
        } else {
          state.artistAlbums = [...state.artistAlbums, ...action.payload.albums];
        }
        state.artistAlbumPagination = action.payload.pagination;
        state.artistInfo = action.payload.artistInfo;
      })
      .addCase(getAlbumsByArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch album by ID
      .addCase(fetchAlbumById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlbumById.fulfilled, (state, action) => {
        state.loading = false;
        state.albumDetails = action.payload;
      })
      .addCase(fetchAlbumById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete album by ID
      .addCase(deleteAlbumById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAlbumById.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.allAlbums = state.allAlbums.filter((a) => a._id !== deletedId);
      })
      .addCase(deleteAlbumById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setAlbumForm,
  setEditingAlbum,
  clearEditingAlbum,
  setAlbums,
  deleteAlbum,
} = albumsSlice.actions;

export default albumsSlice.reducer;
