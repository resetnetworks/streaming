// src/store/slices/adminPayoutsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// ✅ Get Pending Payouts
export const getPendingPayouts = createAsyncThunk(
  "adminPayouts/getPendingPayouts",
  async ({ status = "requested" } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/admin/payouts`, {
        params: { status }
      });
      return res.data; // { success, count, payouts }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch pending payouts";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ✅ Mark Payout as Paid
export const markPayoutAsPaid = createAsyncThunk(
  "adminPayouts/markPayoutAsPaid",
  async (payoutId, thunkAPI) => {
    try {
      const res = await axios.post(`/v2/admin/payouts/${payoutId}/mark-paid`);
      return res.data; // { success, message, payout }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to mark payout as paid";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const adminPayoutsSlice = createSlice({
  name: "adminPayouts",
  initialState: {
    // Pending Payouts
    pendingPayouts: {
      items: [],           // payouts array
      count: 0,
      loading: false,
      error: null,
    },

    // Mark Paid
    markPaid: {
      loading: false,
      success: false,
      error: null,
      data: null,          // { success, message, payout }
    },
  },
  reducers: {
    resetAdminPayoutsState: (state) => {
      state.pendingPayouts = {
        items: [],
        count: 0,
        loading: false,
        error: null,
      };
      state.markPaid = {
        loading: false,
        success: false,
        error: null,
        data: null,
      };
    },
    resetMarkPaid: (state) => {
      state.markPaid = {
        loading: false,
        success: false,
        error: null,
        data: null,
      };
    },
  },
  extraReducers: (builder) => {
    // ✅ Get Pending Payouts
    builder
      .addCase(getPendingPayouts.pending, (state) => {
        state.pendingPayouts.loading = true;
        state.pendingPayouts.error = null;
      })
      .addCase(getPendingPayouts.fulfilled, (state, action) => {
        state.pendingPayouts.loading = false;
        state.pendingPayouts.items = action.payload.payouts || [];
        state.pendingPayouts.count = action.payload.count || 0;
      })
      .addCase(getPendingPayouts.rejected, (state, action) => {
        state.pendingPayouts.loading = false;
        state.pendingPayouts.error = action.payload;
      });

    // ✅ Mark Payout as Paid
    builder
      .addCase(markPayoutAsPaid.pending, (state) => {
        state.markPaid.loading = true;
        state.markPaid.error = null;
        state.markPaid.success = false;
      })
      .addCase(markPayoutAsPaid.fulfilled, (state, action) => {
        state.markPaid.loading = false;
        state.markPaid.success = true;
        state.markPaid.data = action.payload;
        // Update pending payouts list - remove the marked paid payout
        if (action.payload && action.payload.payout) {
          const updatedPayouts = state.pendingPayouts.items.filter(
            payout => payout._id !== action.payload.payout._id
          );
          state.pendingPayouts.items = updatedPayouts;
          state.pendingPayouts.count = updatedPayouts.length;
        }
      })
      .addCase(markPayoutAsPaid.rejected, (state, action) => {
        state.markPaid.loading = false;
        state.markPaid.error = action.payload;
        state.markPaid.success = false;
      });
  },
});

export const { 
  resetAdminPayoutsState, 
  resetMarkPaid 
} = adminPayoutsSlice.actions;
export default adminPayoutsSlice.reducer;