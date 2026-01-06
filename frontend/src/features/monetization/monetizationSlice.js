import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

export const setupMonetization = createAsyncThunk(
  "monetization/setup",
  async ({ subscriptionPrice, cycle }, thunkAPI) => {
    try {
      const res = await axios.post(`/v2/monetize`, {
        subscriptionPrice,
        cycle,
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Monetization failed";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ✅ Monetization setup status check thunk
export const getMyMonetizationSetupStatus = createAsyncThunk(
  "monetization/getMySetupStatus",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/monetize/artists/me/monetization-setup-status`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch monetization setup status"
      );
    }
  }
);

const monetizationSlice = createSlice({
  name: "monetization",
  initialState: {
    setupLoading: false,
    setupError: null,
    setupSuccess: false,
    operationResult: null,
    
    // ✅ Monetization setup status state
    setupStatus: {
      isMonetizationComplete: false,
      reason: null,
      setupAt: null,
      loading: false,
      error: null
    }
  },
  reducers: {
    resetMonetization: (state) => {
      state.setupLoading = false;
      state.setupError = null;
      state.setupSuccess = false;
      state.operationResult = null;
    },
    // ✅ Reset setup status
    resetSetupStatus: (state) => {
      state.setupStatus = {
        isMonetizationComplete: false,
        reason: null,
        setupAt: null,
        loading: false,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(setupMonetization.pending, (state) => {
        state.setupLoading = true;
        state.setupError = null;
        state.setupSuccess = false;
      })
      .addCase(setupMonetization.fulfilled, (state, action) => {
        state.setupLoading = false;
        state.setupSuccess = true;
        state.operationResult = action.payload;
      })
      .addCase(setupMonetization.rejected, (state, action) => {
        state.setupLoading = false;
        state.setupError = action.payload;
        state.setupSuccess = false;
      })
      // ✅ Handle monetization setup status
      .addCase(getMyMonetizationSetupStatus.pending, (state) => {
        state.setupStatus.loading = true;
        state.setupStatus.error = null;
      })
      .addCase(getMyMonetizationSetupStatus.fulfilled, (state, action) => {
        state.setupStatus.loading = false;
        state.setupStatus.isMonetizationComplete = action.payload.isMonetizationComplete;
        state.setupStatus.reason = action.payload.reason;
        state.setupStatus.setupAt = action.payload.setupAt;
      })
      .addCase(getMyMonetizationSetupStatus.rejected, (state, action) => {
        state.setupStatus.loading = false;
        state.setupStatus.error = action.payload;
        state.setupStatus.isMonetizationComplete = false;
        state.setupStatus.reason = "FETCH_ERROR";
      });
  },
});

export const { resetMonetization, resetSetupStatus } = monetizationSlice.actions;
export default monetizationSlice.reducer;