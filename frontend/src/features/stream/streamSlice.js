// src/features/stream/streamSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance"

export const fetchStreamUrl = createAsyncThunk(
  "stream/fetchStreamUrl",
  async (songId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/stream/song/${songId}`);
      return { songId, url: res.data.url };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch streaming URL");
    }
  }
);

const initialState = {
  urls: {}, // { songId: signedUrl }
  loading: false,
  error: null,
};

const streamSlice = createSlice({
  name: "stream",
  initialState,
  reducers: {
    clearStreamUrls: (state) => {
      state.urls = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreamUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreamUrl.fulfilled, (state, action) => {
        const { songId, url } = action.payload;
        state.urls[songId] = url;
        state.loading = false;
      })
      .addCase(fetchStreamUrl.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { clearStreamUrls } = streamSlice.actions;
export default streamSlice.reducer;
