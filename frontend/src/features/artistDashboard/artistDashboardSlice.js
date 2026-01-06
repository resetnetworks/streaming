// src/features/artistDashboard/artistDashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

export const fetchArtistDashboardSongs = createAsyncThunk(
  "artistDashboard/fetchSongs",
  async ({ page = 1, limit = 20, type } = {}, thunkAPI) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;

      const res = await axios.get("/artist/dashboard/singles", { params });
      
      const responseData = res.data.data || [];
      const responseMeta = res.data.meta || {};

      return {
        data: Array.isArray(responseData) ? responseData : [],
        meta: {
          total: responseMeta.total || 0,
          page: responseMeta.page || page,
          pages: responseMeta.pages || 1,
          limit: responseMeta.limit || limit
        }
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch songs"
      );
    }
  }
);

export const fetchArtistDashboardAlbums = createAsyncThunk(
  "artistDashboard/fetchAlbums",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const params = { page, limit };
      const res = await axios.get("/artist/dashboard/albums", { params });
            
      const responseData = res.data.data || [];
      const responseMeta = res.data.meta || {};

      return {
        data: Array.isArray(responseData) ? responseData : [],
        meta: {
          total: responseMeta.total || 0,
          page: responseMeta.page || page,
          pages: responseMeta.pages || 1,
          limit: responseMeta.limit || limit
        }
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch albums"
      );
    }
  }
);

const artistDashboardSlice = createSlice({
  name: "artistDashboard",
  initialState: {
    songs: {
      items: [],
      meta: {
        total: 0,
        page: 1,
        pages: 1,
        limit: 20,
      },
      type: "single",
      loading: false,
      error: null,
    },
    albums: {
      items: [],
      meta: {
        total: 0,
        page: 1,
        pages: 1,
        limit: 10,
      },
      loading: false,
      error: null,
    },
  },
  reducers: {
    setSongsPage: (state, action) => {
      state.songs.meta.page = action.payload;
    },
    setSongsLimit: (state, action) => {
      state.songs.meta.limit = action.payload;
    },
    setSongsType: (state, action) => {
      state.songs.type = action.payload;
      state.songs.meta.page = 1;
    },
    resetSongsState: (state) => {
      state.songs.items = [];
      state.songs.meta = { total: 0, page: 1, pages: 1, limit: 20 };
      state.songs.loading = false;
      state.songs.error = null;
      state.songs.type = "single";
    },
    setAlbumsPage: (state, action) => {
      state.albums.meta.page = action.payload;
    },
    setAlbumsLimit: (state, action) => {
      state.albums.meta.limit = action.payload;
    },
    resetAlbumsState: (state) => {
      state.albums.items = [];
      state.albums.meta = { total: 0, page: 1, pages: 1, limit: 10 };
      state.albums.loading = false;
      state.albums.error = null;
    },
    resetArtistDashboardState: (state) => {
      state.songs = {
        items: [],
        meta: { total: 0, page: 1, pages: 1, limit: 20 },
        type: "single",
        loading: false,
        error: null,
      };
      state.albums = {
        items: [],
        meta: { total: 0, page: 1, pages: 1, limit: 10 },
        loading: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Songs
      .addCase(fetchArtistDashboardSongs.pending, (state) => {
        state.songs.loading = true;
        state.songs.error = null;
      })
      .addCase(fetchArtistDashboardSongs.fulfilled, (state, action) => {
        
        state.songs.loading = false;
        state.songs.error = null;
        
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.songs.items = action.payload.data;
          state.songs.meta = { 
            ...state.songs.meta, 
            ...action.payload.meta 
          };
        } else {
          state.songs.items = [];
          state.songs.meta.total = 0;
        }
      })
      .addCase(fetchArtistDashboardSongs.rejected, (state, action) => {
        state.songs.loading = false;
        state.songs.error = action.payload || "Failed to fetch songs";
        state.songs.items = [];
      })
      // Albums
      .addCase(fetchArtistDashboardAlbums.pending, (state) => {
        state.albums.loading = true;
        state.albums.error = null;
      })
      .addCase(fetchArtistDashboardAlbums.fulfilled, (state, action) => {
        
        state.albums.loading = false;
        state.albums.error = null;
        
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.albums.items = action.payload.data;
          state.albums.meta = { 
            ...state.albums.meta, 
            ...action.payload.meta 
          };
        } else {
          state.albums.items = [];
          state.albums.meta.total = 0;
        }
      })
      .addCase(fetchArtistDashboardAlbums.rejected, (state, action) => {
        state.albums.loading = false;
        state.albums.error = action.payload || "Failed to fetch albums";
        state.albums.items = [];
      });
  },
});

export const {
  setSongsPage,
  setSongsLimit,
  setSongsType,
  resetSongsState,
  setAlbumsPage,
  setAlbumsLimit,
  resetAlbumsState,
  resetArtistDashboardState,
} = artistDashboardSlice.actions;

export default artistDashboardSlice.reducer;
