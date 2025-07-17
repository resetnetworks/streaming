import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// 🎧 Song Stream Thunk
export const fetchStreamUrl = createAsyncThunk(
  "stream/fetchStreamUrl",
  async (songId, { getState, rejectWithValue }) => {
    const { fetchedIds } = getState().stream;
    const selectedSong = getState().player.selectedSong;

    if (fetchedIds.includes(songId)) {
      return rejectWithValue({ songId, message: "Already fetched" });
    }

    try {
      const res = await axios.get(`/stream/song/${songId}`);
      return { songId, url: res.data.url };
    } catch (err) {
      const status = err.response?.status;
      const defaultMessage = err.response?.data?.message || "Failed to fetch streaming URL";

if (status === 403) {
  const selectedSong = getState().player.selectedSong;

  const artistName = selectedSong?.artist?.name || "this artist";
  const albumTitle = selectedSong?.album?.title || "this album";

  let message = "Access denied. Unlock to continue.";

  if (selectedSong?.accessType === "subscription") {
    message = `Subscribe to ${artistName} to play this song.`;
  } else if (
    selectedSong?.accessType === "purchase-only" &&
    selectedSong?.album?.isPremium
  ) {
    message = `Purchase the album "${albumTitle}" to play this song.`;
  } else {
    message = "You need to purchase this song to play it.";
  }

  return rejectWithValue({
    songId,
    message,
  });
}



      return rejectWithValue({ songId, message: defaultMessage });
    }
  }
);


// 🎧 Album Stream Thunk
export const fetchAlbumStreamUrls = createAsyncThunk(
  "stream/fetchAlbumStreamUrls",
  async (albumId, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`/stream/album/${albumId}`);
      // Response: { urls: [{ songId, url }] }
      const urls = res.data.urls; // assuming server returns an array of song urls in order

      return { albumId, urls };
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Failed to stream album";

      if (status === 403) {
        return rejectWithValue({
          albumId,
          message: "You need to purchase this album to stream it.",
        });
      }

      return rejectWithValue({ albumId, message });
    }
  }
);

// 🔄 Initial State
const initialState = {
  urls: {}, // { songId: signedUrl }
  fetchedIds: [],
  loading: false,
  error: null,
};

// 🧠 Slice
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
      // ▶ Song Streaming
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
      })

      // ▶ Album Streaming
      .addCase(fetchAlbumStreamUrls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlbumStreamUrls.fulfilled, (state, action) => {
        const { urls } = action.payload;

        // Loop and add each songId: url
        urls.forEach((item, index) => {
          const songId = item.songId || index.toString(); // use index as fallback
          state.urls[songId] = item.url;
          if (!state.fetchedIds.includes(songId)) {
            state.fetchedIds.push(songId);
          }
        });

        state.loading = false;
      })
      .addCase(fetchAlbumStreamUrls.rejected, (state, action) => {
        const { message, albumId } = action.payload || {};
        state.error = { albumId, message };
        state.loading = false;
      });
  },
});

// 🧾 Exports
export const { clearError, clearStreamUrls } = streamSlice.actions;
export default streamSlice.reducer;
