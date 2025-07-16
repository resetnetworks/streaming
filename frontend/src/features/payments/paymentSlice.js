// features/payments/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utills/axiosInstance';

// 🎯 Song/Album Purchase (Stripe)
export const initiateStripeItemPayment = createAsyncThunk(
  'payment/initiateStripeItemPayment',
  async ({ itemType, itemId, amount }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/payments/stripe/create-payment`, {
        itemType,
        itemId,
        amount,
      });
      return response.data; // { clientSecret }
    } catch (error) {
      console.log(error.response?.data?.message || 'Item payment failed');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// new change

// 🎯 Artist Subscription Setup Intent (Stripe)
export const initiateStripeSetupIntent = createAsyncThunk(
  'payment/initiateStripeSetupIntent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/setup-intent`);
      return response.data; // { clientSecret }
    } catch (error) {
      console.log(error.response?.data?.message || 'Setup intent failed');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🎯 Artist Subscription Payment with Payment Method (Stripe)
export const confirmArtistStripeSubscription = createAsyncThunk(
  'payment/confirmArtistStripeSubscription',
  async ({ artistId, paymentMethodId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/artist/${artistId}`, {
        gateway: 'stripe',
        paymentMethodId,
      });
      return response.data; // { clientSecret (optional), transactionId }
    } catch (error) {
      console.log(error.response?.data?.message || 'Artist subscription failed');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ❌ Cancel Artist Subscription (DELETE)
export const cancelArtistSubscription = createAsyncThunk(
  'payment/cancelArtistSubscription',
  async (artistId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/subscriptions/artist/${artistId}`);
      return response.data; // { success: true, message: "Subscription cancelled." }
    } catch (error) {
      console.log(error.response?.data?.message || 'Cancellation failed');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    loading: false,
    error: null,
    clientSecret: null,
    gateway: null,
    razorpayOrderId: null,
    transactionId: null,
    cancelMessage: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.clientSecret = null;
      state.gateway = null;
      state.razorpayOrderId = null;
      state.transactionId = null;
      state.cancelMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🎵 Item Payment
      .addCase(initiateStripeItemPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.clientSecret = null;
      })
      .addCase(initiateStripeItemPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.gateway = 'stripe';
      })
      .addCase(initiateStripeItemPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.clientSecret = null;
      })

      // 💳 Setup Intent
      .addCase(initiateStripeSetupIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.clientSecret = null;
      })
      .addCase(initiateStripeSetupIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(initiateStripeSetupIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.clientSecret = null;
      })

      // ✅ Confirm Subscription
      .addCase(confirmArtistStripeSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.transactionId = null;
      })
      .addCase(confirmArtistStripeSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionId = action.payload.transactionId || null;
        state.clientSecret = action.payload.clientSecret || null;
      })
      .addCase(confirmArtistStripeSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.transactionId = null;
      })

      // ❌ Cancel Subscription
      .addCase(cancelArtistSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancelMessage = null;
      })
      .addCase(cancelArtistSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelMessage = action.payload.message || 'Subscription cancelled';
      })
      .addCase(cancelArtistSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cancelMessage = null;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
