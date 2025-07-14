import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

export const fetchStreamUrl = createAsyncThunk(
  "stream/fetchStreamUrl",
  async (songId, { getState, rejectWithValue }) => {
    const { fetchedIds } = getState().stream;

    // Prevent duplicate fetches
    if (fetchedIds.includes(songId)) {
      return rejectWithValue({ songId, message: "Already fetched" });
    }

    try {
      const res = await axios.get(`/stream/song/${songId}`);
      return { songId, url: res.data.url };
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Failed to fetch streaming URL";

      if (status === 403) {
        return rejectWithValue({
          songId,
          message: "You need to purchase this song to play it.",
        });
      }

      return rejectWithValue({ songId, message });
    }
  }
);

const initialState = {
  urls: {},
  fetchedIds: [],
  loading: false,
  error: null,
};

const streamSlice = createSlice({
  name: "stream",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStreamUrls: (state) => {
      state.urls = {};
      state.fetchedIds = [];
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
        state.fetchedIds.push(songId);
        state.loading = false;
      })
      .addCase(fetchStreamUrl.rejected, (state, action) => {
        const { songId, message } = action.payload || {};
        if (message !== "Already fetched") {
          state.error = { songId, message };
        }
        state.loading = false;
      });
  },
});

export const { clearError, clearStreamUrls } = streamSlice.actions;
export default streamSlice.reducer;