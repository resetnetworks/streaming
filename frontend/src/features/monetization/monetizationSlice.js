// ✅ NO CHANGE NEEDED - Your URLs perfect hain
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

export const getMonetizationStatus = createAsyncThunk(
  "monetization/getStatus",
  async ({ operationId, artistId }, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/artist/${artistId}/monetization/status/${operationId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch monetization status"
      );
    }
  }
);

// ✅ Your slice same hai
const monetizationSlice = createSlice({
  name: "monetization",
  initialState: {
    setupLoading: false,
    setupError: null,
    setupSuccess: false,
    operationResult: null,
    currentStatus: null,
  },
  reducers: {
    resetMonetization: (state) => {
      state.setupLoading = false;
      state.setupError = null;
      state.setupSuccess = false;
      state.operationResult = null;
      state.currentStatus = null;
    },
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
      .addCase(getMonetizationStatus.fulfilled, (state, action) => {
        state.currentStatus = action.payload;
      });
  },
});

export const { resetMonetization } = monetizationSlice.actions;
export default monetizationSlice.reducer;
