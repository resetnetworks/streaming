// features/payments/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utills/axiosInstance';

// 🎯 1. Artist Subscription Payment (Stripe only)
export const initiateArtistPayment = createAsyncThunk(
  'payment/initiateArtistPayment',
  async ({ artistId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/artist/${artistId}`, {
        gateway: 'stripe',
      });
      return response.data;
    } catch (error) {
      console.log(error.response?.data?.message || 'Artist subscription failed');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🎯 2. Song/Album Purchase (Stripe)
export const initiateStripeItemPayment = createAsyncThunk(
  'payment/initiateStripeItemPayment',
  async ({ itemType, itemId, amount }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/payments/stripe/create-payment`, {
        itemType,
        itemId,
        amount,
      });
      return response.data;
    } catch (error) {
      console.log(error.response?.data?.message || 'Item payment failed');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    loading: false,
    error: null,
    transactionId: null,
    gateway: null,
    clientSecret: null,
    razorpayOrderId: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.transactionId = null;
      state.gateway = null;
      state.clientSecret = null;
      state.razorpayOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔁 Artist
      .addCase(initiateArtistPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateArtistPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionId = action.payload.transactionId;
        state.gateway = action.payload.gateway;
        state.clientSecret = action.payload.clientSecret || null;
        state.razorpayOrderId = action.payload.razorpayOrderId || null;
      })
      .addCase(initiateArtistPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔁 Song/Album
      .addCase(initiateStripeItemPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateStripeItemPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.gateway = 'stripe';
      })
      .addCase(initiateStripeItemPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
