import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// ✅ Thunks
export const fetchUserPurchases = createAsyncThunk(
  "userDashboard/fetchUserPurchases",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/user/dashboard/purchases");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch purchases");
    }
  }
);

export const fetchUserSubscriptions = createAsyncThunk(
  "userDashboard/fetchUserSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/user/dashboard/subscriptions");
      return res.data.subscriptions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch subscriptions");
    }
  }
);

export const cancelUserSubscription = createAsyncThunk(
  "userDashboard/cancelUserSubscription",
  async (artistId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/user/dashboard/subscriptions/${artistId}`);
      return { artistId, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to cancel subscription");
    }
  }
);

// ✅ Slice
const userDashboardSlice = createSlice({
  name: "userDashboard",
  initialState: {
    purchases: {
      songs: [],
      albums: [],
      history: [],
    },
    subscriptions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Purchases
      .addCase(fetchUserPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = {
          songs: action.payload.songs,
          albums: action.payload.albums,
          history: action.payload.history,
        };
      })
      .addCase(fetchUserPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Subscriptions
      .addCase(fetchUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Subscription
      .addCase(cancelUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelUserSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(
          (sub) => sub.artist._id !== action.payload.artistId
        );
      })
      .addCase(cancelUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userDashboardSlice.reducer;
