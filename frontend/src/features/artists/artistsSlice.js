import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunks
export const fetchAllArtists = createAsyncThunk(
  "artists/fetchAll",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/artists?page=${page}&limit=${limit}`);
      return {
        artists: res.data.artists,
        pagination: res.data.pagination,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch artists"
      );
    }
  }
);

export const fetchAllArtistsNoPagination = createAsyncThunk(
  "artists/fetchAllNoPagination",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`/artists/all`);
      return res.data.artists;
    } catch (err) {
      console.error("Error fetching artists:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch all artists"
      );
    }
  }
);

export const fetchArtistBySlug = createAsyncThunk(
  "artists/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`/artists/${id}`);
      return res.data.artist;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch artist"
      );
    }
  }
);

export const createArtist = createAsyncThunk(
  "artists/create",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/artists", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.artist;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create artist"
      );
    }
  }
);

export const updateArtist = createAsyncThunk(
  "artists/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await axios.put(`/artists/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.artist;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update artist"
      );
    }
  }
);

export const deleteArtist = createAsyncThunk(
  "artists/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/artists/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete artist"
      );
    }
  }
);

export const fetchRandomArtistWithSongs = createAsyncThunk(
  "artists/fetchRandomArtistWithSongs",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(
        `/discover/random-artist?page=${page}&limit=${limit}`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch random artist"
      );
    }
  }
);

export const searchArtists = createAsyncThunk(
  "artists/search",
  async ({ query, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/artists?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      return {
        artists: res.data.results,
        pagination: {
          page: res.data.page,
          limit,
          total: res.data.total,
          totalPages: res.data.pages,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to search artists"
      );
    }
  }
);

// Slice
const artistSlice = createSlice({
  name: "artists",
  initialState: {
    allArtists: [],
    fullArtistList: [],
    selectedArtist: null,
    randomArtist: null,
    randomArtistSongs: [],
    randomArtistPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    clearSelectedArtist: (state) => {
      state.selectedArtist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = action.payload.artists;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAllArtistsNoPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArtistsNoPagination.fulfilled, (state, action) => {
        state.loading = false;
        state.fullArtistList = action.payload;
      })
      .addCase(fetchAllArtistsNoPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchArtistBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArtist = action.payload;
      })
      .addCase(fetchArtistBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists.push(action.payload);
      })
      .addCase(createArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArtist.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allArtists.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.allArtists[index] = action.payload;
      })
      .addCase(updateArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = state.allArtists.filter(artist => artist._id !== action.payload);
        state.fullArtistList = state.fullArtistList.filter(artist => artist._id !== action.payload);
      })
      .addCase(deleteArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchRandomArtistWithSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRandomArtistWithSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.randomArtist = action.payload.artist;
        state.randomArtistSongs = action.payload.songs;
        state.randomArtistPagination = action.payload.pagination;
      })
      .addCase(fetchRandomArtistWithSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(searchArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = action.payload.artists;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedArtist } = artistSlice.actions;
export default artistSlice.reducer;


