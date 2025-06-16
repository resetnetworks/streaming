// features/albums/albumsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunk: Fetch all albums
export const fetchAllAlbums = createAsyncThunk("albums/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/albums");
    return res.data.albums;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch albums"
    );
  }
});

// Thunk: Create new album
export const createAlbum = createAsyncThunk("albums/create", async (formData, thunkAPI) => {
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
});

// ✅ Thunk: Fetch albums by artist
export const getAlbumsByArtist = createAsyncThunk("albums/getByArtist", async (artistId, thunkAPI) => {
  try {
    const res = await axios.get(`/albums/artist/${artistId}`);
    return res.data.albums;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch albums for artist"
    );
  }
});

// ✅ Thunk: Fetch album by ID or slug (and get songs)
export const fetchAlbumById = createAsyncThunk("albums/fetchById", async (id, thunkAPI) => {
  try {
    const res = await axios.get(`/albums/${id}`);
    return res.data.album;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch album"
    );
  }
});

// Initial state
const initialState = {
  allAlbums: [],
  artistAlbums: [],
  albumDetails: null, // ✅ for fetchAlbumById
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
      // fetchAllAlbums
      .addCase(fetchAllAlbums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAlbums.fulfilled, (state, action) => {
        state.loading = false;
        state.allAlbums = action.payload;
      })
      .addCase(fetchAllAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createAlbum
      .addCase(createAlbum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.loading = false;
        state.allAlbums.push(action.payload);
        state.albumForm = initialState.albumForm;
        state.editingAlbum = null;
      })
      .addCase(createAlbum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAlbumsByArtist
      .addCase(getAlbumsByArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAlbumsByArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.artistAlbums = action.payload;
      })
      .addCase(getAlbumsByArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ fetchAlbumById
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


