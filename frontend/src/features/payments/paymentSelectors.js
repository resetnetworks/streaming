// paymentSelectors.js
export const selectUserDashboard = (state) => state.userDashboard;

export const selectPurchaseHistory = (state) =>
  state.userDashboard?.purchases?.history || [];

export const selectPurchasedSongs = (state) =>
  state.userDashboard?.purchases?.songs || [];

export const selectPurchasedAlbums = (state) =>
  state.userDashboard?.purchases?.albums || [];

export const selectDashboardSubscriptions = (state) =>
  state.userDashboard?.subscriptions || [];

export const selectDashboardLoading = (state) =>
  state.userDashboard?.loading;

export const selectDashboardError = (state) =>
  state.userDashboard?.error;

// 🆕 Payment specific selectors
export const selectPaymentLoading = (state) => state.payment?.loading;
export const selectPaymentError = (state) => state.payment?.error;
export const selectPaymentGateway = (state) => state.payment?.gateway;
export const selectPaymentSuccess = (state) => state.payment?.paymentSuccess;

// Stripe selectors
export const selectStripeClientSecret = (state) => state.payment?.clientSecret;
export const selectStripeTransactionId = (state) => state.payment?.transactionId;

// Razorpay selectors
export const selectRazorpayOrder = (state) => state.payment?.razorpayOrder;
export const selectRazorpayOrderId = (state) => state.payment?.razorpayOrderId;
export const selectRazorpaySubscriptionId = (state) => state.payment?.razorpaySubscriptionId;

// General selectors
export const selectCancelMessage = (state) => state.payment?.cancelMessage;
