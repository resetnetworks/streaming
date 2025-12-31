// src/store/slices/artistRevenueSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// ✅ Balance
export const getArtistBalance = createAsyncThunk(
  "artistRevenue/getBalance",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/artist/balance`);
      return res.data; // { success, balance }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch artist balance";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ✅ Ledger (paginated)
export const getArtistLedger = createAsyncThunk(
  "artistRevenue/getLedger",
  async ({ page = 1, limit = 20 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/artist/ledger`, {
        params: { page, limit },
      });
      return res.data; // { success, page, limit, ledger }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch artist ledger";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ✅ Payouts
export const getArtistPayouts = createAsyncThunk(
  "artistRevenue/getPayouts",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/artist/payouts`);
      return res.data; // { success, payouts }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch artist payouts";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ✅ Request Payout (NEW)
export const requestPayout = createAsyncThunk(
  "artistRevenue/requestPayout",
  async ({ amount, paypalEmail }, thunkAPI) => {
    try {
      const res = await axios.post(`/v2/artist/payouts/request`, {
        amount,
        paypalEmail,
      });
      return res.data; // { success, message, payout }
    } catch (err) {
      const msg = err.response?.data?.message || "Payout request failed";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const artistRevenueSlice = createSlice({
  name: "artistRevenue",
  initialState: {
    // Balance
    balance: {
      data: null,          // { totalEarned, availableBalance, totalPaidOut, currency }
      loading: false,
      error: null,
    },

    // Ledger
    ledger: {
      items: [],           // ledger array
      page: 1,
      limit: 20,
      loading: false,
      error: null,
    },

    // Payouts
    payouts: {
      items: [],           // payouts array
      loading: false,
      error: null,
    },

    // Payout Request
    payoutRequest: {
      loading: false,
      success: false,
      error: null,
      data: null,          // { success, message, payout }
    },
  },
  reducers: {
    resetArtistRevenueState: (state) => {
      state.balance = {
        data: null,
        loading: false,
        error: null,
      };
      state.ledger = {
        items: [],
        page: 1,
        limit: 20,
        loading: false,
        error: null,
      };
      state.payouts = {
        items: [],
        loading: false,
        error: null,
      };
      state.payoutRequest = {
        loading: false,
        success: false,
        error: null,
        data: null,
      };
    },
    resetPayoutRequest: (state) => {
      state.payoutRequest = {
        loading: false,
        success: false,
        error: null,
        data: null,
      };
    },
  },
  extraReducers: (builder) => {
    // ✅ Balance
    builder
      .addCase(getArtistBalance.pending, (state) => {
        state.balance.loading = true;
        state.balance.error = null;
      })
      .addCase(getArtistBalance.fulfilled, (state, action) => {
        state.balance.loading = false;
        state.balance.data = action.payload.balance;
      })
      .addCase(getArtistBalance.rejected, (state, action) => {
        state.balance.loading = false;
        state.balance.error = action.payload;
      });

    // ✅ Ledger
    builder
      .addCase(getArtistLedger.pending, (state) => {
        state.ledger.loading = true;
        state.ledger.error = null;
      })
      .addCase(getArtistLedger.fulfilled, (state, action) => {
        state.ledger.loading = false;
        state.ledger.items = action.payload.ledger || [];
        state.ledger.page = action.payload.page || 1;
        state.ledger.limit = action.payload.limit || 20;
      })
      .addCase(getArtistLedger.rejected, (state, action) => {
        state.ledger.loading = false;
        state.ledger.error = action.payload;
      });

    // ✅ Payouts
    builder
      .addCase(getArtistPayouts.pending, (state) => {
        state.payouts.loading = true;
        state.payouts.error = null;
      })
      .addCase(getArtistPayouts.fulfilled, (state, action) => {
        state.payouts.loading = false;
        state.payouts.items = action.payload.payouts || [];
      })
      .addCase(getArtistPayouts.rejected, (state, action) => {
        state.payouts.loading = false;
        state.payouts.error = action.payload;
      });

    // ✅ Request Payout (NEW)
    builder
      .addCase(requestPayout.pending, (state) => {
        state.payoutRequest.loading = true;
        state.payoutRequest.error = null;
        state.payoutRequest.success = false;
      })
      .addCase(requestPayout.fulfilled, (state, action) => {
        state.payoutRequest.loading = false;
        state.payoutRequest.success = true;
        state.payoutRequest.data = action.payload;
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.payoutRequest.loading = false;
        state.payoutRequest.error = action.payload;
        state.payoutRequest.success = false;
      });
  },
});

export const { 
  resetArtistRevenueState, 
  resetPayoutRequest 
} = artistRevenueSlice.actions;
export default artistRevenueSlice.reducer;
