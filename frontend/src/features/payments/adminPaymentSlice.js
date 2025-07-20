// src/features/payments/adminPaymentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance.js";

// ----------------------------
// Async Thunks
// ----------------------------
export const fetchArtistTransactions = createAsyncThunk(
  "artistDashboard/fetchTransactions",
  async (params, thunkAPI) => {
    try {
      const res = await axios.get("/admin/dashboard/transactions", { params });
      return res.data.transactions;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch transactions");
    }
  }
);

export const fetchPurchasedSongs = createAsyncThunk(
  "artistDashboard/fetchPurchasedSongs",
  async (artistId, thunkAPI) => {
    try {
      const res = await axios.get(`/admin/dashboard/purchased-songs/${artistId}`);
      return res.data.songs;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch purchased songs");
    }
  }
);

export const fetchPurchasedAlbums = createAsyncThunk(
  "artistDashboard/fetchPurchasedAlbums",
  async (artistId, thunkAPI) => {
    try {
      const res = await axios.get(`/admin/dashboard/purchased-albums/${artistId}`);
      return res.data.albums;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch purchased albums");
    }
  }
);

export const fetchSubscriberCount = createAsyncThunk(
  "artistDashboard/fetchSubscriberCount",
  async (artistId, thunkAPI) => {
    try {
      const res = await axios.get(`/admin/dashboard/subscriber-count/${artistId}`);
      return res.data;        // { activeSubscribers, totalRevenue }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch subscriber count");
    }
  }
);

export const fetchArtistRevenue = createAsyncThunk(
  "artistDashboard/fetchArtistRevenue",
  async (artistId, thunkAPI) => {
    try {
      const res = await axios.get(`/admin/dashboard/revenue-summary/${artistId}`);
      return res.data;        // { revenue : { songRevenue, albumRevenue, subscriptionRevenue, totalRevenue } }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch revenue summary");
    }
  }
);

// ----------------------------
// Slice
// ----------------------------
const initialState = {
  transactions: [],
  purchasedSongs: [],
  purchasedAlbums: [],
  subscriberCount: 0,
  totalRevenue: 0,
  revenueBreakdown: {
    songRevenue: 0,
    albumRevenue: 0,
    subscriptionRevenue: 0,
    totalRevenue: 0,
  },
  loading: false,
  error: null,
};

const artistDashboardSlice = createSlice({
  name: "artistDashboard",
  initialState,
  reducers: { resetArtistDashboard: () => initialState },
  extraReducers: (builder) =>
    builder
      // Transactions
      .addCase(fetchArtistTransactions.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchArtistTransactions.fulfilled, (s, a) => { s.loading = false; s.transactions = a.payload; })
      .addCase(fetchArtistTransactions.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Purchased Songs
      .addCase(fetchPurchasedSongs.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPurchasedSongs.fulfilled, (s, a) => { s.loading = false; s.purchasedSongs = a.payload; })
      .addCase(fetchPurchasedSongs.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Purchased Albums
      .addCase(fetchPurchasedAlbums.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPurchasedAlbums.fulfilled, (s, a) => { s.loading = false; s.purchasedAlbums = a.payload; })
      .addCase(fetchPurchasedAlbums.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Subscriber Count
      .addCase(fetchSubscriberCount.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSubscriberCount.fulfilled, (s, a) => {
        s.loading = false;
        s.subscriberCount = a.payload.activeSubscribers;
        // DO NOT overwrite totalRevenue here – revenue slice will do it
      })
      .addCase(fetchSubscriberCount.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Revenue Summary
      .addCase(fetchArtistRevenue.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchArtistRevenue.fulfilled, (s, a) => {
        s.loading = false;
        s.revenueBreakdown = a.payload.revenue;
        s.totalRevenue = a.payload.revenue.totalRevenue;
      })
      .addCase(fetchArtistRevenue.rejected, (s, a) => { s.loading = false; s.error = a.payload; }),
});

export const { resetArtistDashboard } = artistDashboardSlice.actions;
export default artistDashboardSlice.reducer;