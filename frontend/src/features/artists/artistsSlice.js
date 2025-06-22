import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunks
export const fetchAllArtists = createAsyncThunk(
  "artists/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/artists");
      return res.data.artists;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch artists");
    }
  }
);

export const fetchArtistById = createAsyncThunk(
  "artists/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`/artists/${id}`);
      return res.data.artist;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch artist");
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
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create artist");
    }
  }
);

// Slice
const artistSlice = createSlice({
  name: "artists",
  initialState: {
    allArtists: [],
    selectedArtist: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedArtist: (state) => {
      state.selectedArtist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllArtists
      .addCase(fetchAllArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = action.payload;
      })
      .addCase(fetchAllArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchArtistById
      .addCase(fetchArtistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArtist = action.payload;
      })
      .addCase(fetchArtistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createArtist
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
      });
  },
});

export const { clearSelectedArtist } = artistSlice.actions;

export default artistSlice.reducer;
