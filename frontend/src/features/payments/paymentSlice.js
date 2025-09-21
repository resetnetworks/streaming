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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🎯 Song/Album Purchase (Razorpay)
export const initiateRazorpayItemPayment = createAsyncThunk(
  'payment/initiateRazorpayItemPayment',
  async ({ itemType, itemId, amount,currency }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/payments/razorpay/create-order`, {
        itemType,
        itemId,
        amount,
        currency,
      });
      return response.data; // { success: true, order }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🆕 Song/Album Purchase (PayPal) - Create Order
export const initiatePaypalItemPayment = createAsyncThunk(
  'payment/initiatePaypalItemPayment',
  async ({ itemType, itemId, amount, currency = 'USD' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/payments/paypal/create-order`, {
        itemType,
        itemId,
        amount,
        currency,
      });
      return response.data; // { success: true, id, links }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🆕 Capture PayPal Order
export const capturePaypalOrder = createAsyncThunk(
  'payment/capturePaypalOrder',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/payments/paypal/capture-order`, {
        orderId,
      });
      return response.data; // { success: true, data }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🎯 Artist Subscription Setup Intent (Stripe)
export const initiateStripeSetupIntent = createAsyncThunk(
  'payment/initiateStripeSetupIntent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/setup-intent`);
      return response.data; // { clientSecret }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🎯 Artist Subscription Payment with Payment Method (Stripe)
export const confirmArtistStripeSubscription = createAsyncThunk(
  'payment/confirmArtistStripeSubscription',
  async ({ artistId, paymentMethodId, address }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/artist/${artistId}`, {
        gateway: 'stripe',
        paymentMethodId,
        ...address, // line1, city, state, postal_code, country
      });
      return response.data; // { clientSecret (optional), subscriptionId | transactionId }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🎯 Artist Subscription (Razorpay) — with cycle
export const initiateRazorpaySubscription = createAsyncThunk(
  'payment/initiateRazorpaySubscription',
  async ({ artistId, cycle }, { rejectWithValue }) => {
    try {
      // Validate cycle on the client for a better UX
      const validCycles = ['1m', '3m', '6m', '12m'];
      if (!validCycles.includes(cycle)) {
        return rejectWithValue({ message: 'Invalid subscription cycle. Use 1m, 3m, 6m, or 12m.' });
      }

      const response = await axiosInstance.post(`/subscriptions/artist/${artistId}`, {
        cycle,
      });
      return response.data; // { success: true, subscriptionId, cycle }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🆕 PayPal Artist Subscription - Create Subscription
export const initiatePaypalSubscription = createAsyncThunk(
  'payment/initiatePaypalSubscription',
  async ({ artistId, cycle, currency = 'USD' }, { rejectWithValue }) => {
    try {
      // Validate cycle on the client for a better UX
      const validCycles = ['1m', '3m', '6m', '12m'];
      if (!validCycles.includes(cycle)) {
        return rejectWithValue({ message: 'Invalid subscription cycle. Use 1m, 3m, 6m, or 12m.' });
      }

      const response = await axiosInstance.post(`/subscriptions/paypal/artist/${artistId}`, {
        cycle,
        currency,
      });
      return response.data; // { success: true, subscriptionId, approveUrl, cycle }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🆕 Activate PayPal Subscription after approval
export const activatePaypalSubscription = createAsyncThunk(
  'payment/activatePaypalSubscription',
  async ({ subscriptionId, artistId, userId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/paypal/activate`, {
        subscriptionId,
        artistId,
        userId,
      });
      return response.data; // { success: true, subscription, message }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🆕 Get PayPal Subscription Details
export const getPaypalSubscriptionDetails = createAsyncThunk(
  'payment/getPaypalSubscriptionDetails',
  async ({ subscriptionId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/subscriptions/paypal/${subscriptionId}`);
      return response.data; // { success: true, subscription }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🆕 Cancel PayPal Subscription
export const cancelPaypalSubscription = createAsyncThunk(
  'payment/cancelPaypalSubscription',
  async ({ subscriptionId, reason = 'User requested cancellation' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/subscriptions/paypal/${subscriptionId}/cancel`, {
        reason,
      });
      return response.data; // { success: true, message }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ❌ Cancel Artist Subscription (DELETE) - Universal
export const cancelArtistSubscription = createAsyncThunk(
  'payment/cancelArtistSubscription',
  async (artistId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/subscriptions/artist/${artistId}`);
      return response.data; // { success: true, message }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  gateway: null, // 'stripe' | 'razorpay' | 'paypal'

  // Stripe specific
  clientSecret: null,
  transactionId: null,

  // Razorpay specific
  razorpayOrderId: null,
  razorpayOrder: null,
  razorpaySubscriptionId: null,

  // PayPal specific
  paypalOrderId: null,
  paypalOrder: null,
  paypalLinks: null,
  paypalCaptureResponse: null,
  
  // 🆕 PayPal Subscription specific
  paypalSubscriptionId: null,
  paypalSubscription: null,
  paypalApproveUrl: null,
  paypalSubscriptionStatus: null, // 'APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'
  paypalActivationResponse: null,

  // General
  cancelMessage: null,
  paymentSuccess: false,
  subscriptionSuccess: false,

  // Subscription UI/selection
  currentCycle: null, // "1m" | "3m" | "6m" | "12m"
  currentCurrency: 'USD', // For PayPal subscriptions
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.clientSecret = null;
      state.gateway = null;
      state.razorpayOrderId = null;
      state.razorpayOrder = null;
      state.razorpaySubscriptionId = null;
      state.transactionId = null;
      state.paypalOrderId = null;
      state.paypalOrder = null;
      state.paypalLinks = null;
      state.paypalCaptureResponse = null;
      state.paypalSubscriptionId = null;
      state.paypalSubscription = null;
      state.paypalApproveUrl = null;
      state.paypalSubscriptionStatus = null;
      state.paypalActivationResponse = null;
      state.cancelMessage = null;
      state.paymentSuccess = false;
      state.subscriptionSuccess = false;
      state.currentCycle = null;
      state.currentCurrency = 'USD';
    },
    setPaymentGateway: (state, action) => {
      state.gateway = action.payload; // 'stripe' | 'razorpay' | 'paypal'
    },
    setPaymentSuccess: (state, action) => {
      state.paymentSuccess = action.payload;
    },
    setSubscriptionSuccess: (state, action) => {
      state.subscriptionSuccess = action.payload;
    },
    setSubscriptionCycle: (state, action) => {
      state.currentCycle = action.payload; // "1m" | "3m" | "6m" | "12m"
    },
    setSubscriptionCurrency: (state, action) => {
      state.currentCurrency = action.payload; // For PayPal subscriptions
    },
    // 🆕 PayPal subscription specific actions
    setPaypalSubscriptionStatus: (state, action) => {
      state.paypalSubscriptionStatus = action.payload;
    },
    clearPaypalSubscriptionData: (state) => {
      state.paypalSubscriptionId = null;
      state.paypalSubscription = null;
      state.paypalApproveUrl = null;
      state.paypalSubscriptionStatus = null;
      state.paypalActivationResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🎵 Stripe Item Payment
      .addCase(initiateStripeItemPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.clientSecret = null;
        state.gateway = 'stripe';
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

      // 🎵 Razorpay Item Payment
      .addCase(initiateRazorpayItemPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.razorpayOrder = null;
        state.gateway = 'razorpay';
      })
      .addCase(initiateRazorpayItemPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload.order;
        state.razorpayOrderId = action.payload.order?.id || null;
        state.gateway = 'razorpay';
      })
      .addCase(initiateRazorpayItemPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.razorpayOrder = null;
      })

      // 🆕 PayPal Item Payment
      .addCase(initiatePaypalItemPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paypalOrder = null;
        state.paypalOrderId = null;
        state.paypalLinks = null;
        state.gateway = 'paypal';
      })
      .addCase(initiatePaypalItemPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paypalOrderId = action.payload.id;
        state.paypalOrder = action.payload;
        state.paypalLinks = action.payload.links;
        state.gateway = 'paypal';
      })
      .addCase(initiatePaypalItemPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paypalOrder = null;
        state.paypalOrderId = null;
        state.paypalLinks = null;
      })

      // 🆕 PayPal Capture Order
      .addCase(capturePaypalOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paypalCaptureResponse = null;
      })
      .addCase(capturePaypalOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.paypalCaptureResponse = action.payload.data;
        state.paymentSuccess = true;
      })
      .addCase(capturePaypalOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paypalCaptureResponse = null;
        state.paymentSuccess = false;
      })

      // 💳 Stripe Setup Intent
      .addCase(initiateStripeSetupIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.clientSecret = null;
      })
      .addCase(initiateStripeSetupIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.gateway = 'stripe';
      })
      .addCase(initiateStripeSetupIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.clientSecret = null;
      })

      // ✅ Confirm Stripe Subscription
      .addCase(confirmArtistStripeSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.transactionId = null;
      })
      .addCase(confirmArtistStripeSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionId = action.payload.transactionId || null;
        state.clientSecret = action.payload.clientSecret || null;
        state.subscriptionSuccess = true;
        state.gateway = 'stripe';
      })
      .addCase(confirmArtistStripeSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.transactionId = null;
        state.subscriptionSuccess = false;
      })

      // ✅ Razorpay Subscription — with cycle
      .addCase(initiateRazorpaySubscription.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.razorpaySubscriptionId = null;
        // If caller passed cycle via meta.arg, reflect it for UI immediately
        const arg = action.meta?.arg;
        if (arg?.cycle) state.currentCycle = arg.cycle;
        state.gateway = 'razorpay';
      })
      .addCase(initiateRazorpaySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpaySubscriptionId = action.payload.subscriptionId;
        state.currentCycle = action.payload.cycle || state.currentCycle;
        state.subscriptionSuccess = true;
        state.gateway = 'razorpay';
      })
      .addCase(initiateRazorpaySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.razorpaySubscriptionId = null;
        state.subscriptionSuccess = false;
      })

      // 🆕 PayPal Subscription Creation
      .addCase(initiatePaypalSubscription.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.paypalSubscriptionId = null;
        state.paypalApproveUrl = null;
        state.paypalSubscriptionStatus = null;
        // Set cycle and currency from the request
        const arg = action.meta?.arg;
        if (arg?.cycle) state.currentCycle = arg.cycle;
        if (arg?.currency) state.currentCurrency = arg.currency;
        state.gateway = 'paypal';
      })
      .addCase(initiatePaypalSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.paypalSubscriptionId = action.payload.subscriptionId;
        state.paypalApproveUrl = action.payload.approveUrl;
        state.paypalSubscriptionStatus = 'APPROVAL_PENDING';
        state.currentCycle = action.payload.cycle || state.currentCycle;
        state.gateway = 'paypal';
      })
      .addCase(initiatePaypalSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paypalSubscriptionId = null;
        state.paypalApproveUrl = null;
        state.paypalSubscriptionStatus = null;
      })

      // 🆕 PayPal Subscription Activation
      .addCase(activatePaypalSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paypalActivationResponse = null;
      })
      .addCase(activatePaypalSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.paypalActivationResponse = action.payload;
        state.paypalSubscription = action.payload.subscription;
        state.paypalSubscriptionStatus = action.payload.subscription?.status || 'ACTIVE';
        state.subscriptionSuccess = true;
      })
      .addCase(activatePaypalSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paypalActivationResponse = null;
        state.subscriptionSuccess = false;
      })

      // 🆕 Get PayPal Subscription Details
      .addCase(getPaypalSubscriptionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaypalSubscriptionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.paypalSubscription = action.payload.subscription;
        state.paypalSubscriptionStatus = action.payload.subscription?.status;
      })
      .addCase(getPaypalSubscriptionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🆕 Cancel PayPal Subscription
      .addCase(cancelPaypalSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancelMessage = null;
      })
      .addCase(cancelPaypalSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelMessage = action.payload.message || 'PayPal subscription cancelled successfully';
        state.paypalSubscriptionStatus = 'CANCELLED';
      })
      .addCase(cancelPaypalSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cancelMessage = null;
      })

      // ❌ Cancel Artist Subscription (Universal)
      .addCase(cancelArtistSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancelMessage = null;
      })
      .addCase(cancelArtistSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelMessage = action.payload.message || 'Subscription cancelled';
        
        // Reset subscription-specific data based on current gateway
        if (state.gateway === 'paypal') {
          state.paypalSubscriptionStatus = 'CANCELLED';
        }
      })
      .addCase(cancelArtistSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cancelMessage = null;
      });
  },
});

export const {
  resetPaymentState,
  setPaymentGateway,
  setPaymentSuccess,
  setSubscriptionSuccess,
  setSubscriptionCycle,
  setSubscriptionCurrency,
  setPaypalSubscriptionStatus,
  clearPaypalSubscriptionData,
} = paymentSlice.actions;

export default paymentSlice.reducer;
