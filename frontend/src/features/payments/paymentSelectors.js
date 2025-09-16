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
export const selectSubscriptionSuccess = (state) => state.payment?.subscriptionSuccess;

// Stripe selectors
export const selectStripeClientSecret = (state) => state.payment?.clientSecret;
export const selectStripeTransactionId = (state) => state.payment?.transactionId;

// Razorpay selectors
export const selectRazorpayOrder = (state) => state.payment?.razorpayOrder;
export const selectRazorpayOrderId = (state) => state.payment?.razorpayOrderId;
export const selectRazorpaySubscriptionId = (state) => state.payment?.razorpaySubscriptionId;

// PayPal Item Payment selectors
export const selectPaypalOrderId = (state) => state.payment?.paypalOrderId;
export const selectPaypalOrder = (state) => state.payment?.paypalOrder;
export const selectPaypalLinks = (state) => state.payment?.paypalLinks;
export const selectPaypalCaptureResponse = (state) => state.payment?.paypalCaptureResponse;

// 🆕 PayPal Subscription selectors
export const selectPaypalSubscriptionId = (state) => state.payment?.paypalSubscriptionId;
export const selectPaypalSubscription = (state) => state.payment?.paypalSubscription;
export const selectPaypalApproveUrl = (state) => state.payment?.paypalApproveUrl;
export const selectPaypalSubscriptionStatus = (state) => state.payment?.paypalSubscriptionStatus;
export const selectPaypalActivationResponse = (state) => state.payment?.paypalActivationResponse;

// 🆕 PayPal subscription status helpers
export const selectIsPaypalSubscriptionPending = (state) => 
  state.payment?.paypalSubscriptionStatus === 'APPROVAL_PENDING';

export const selectIsPaypalSubscriptionActive = (state) => 
  ['APPROVED', 'ACTIVE'].includes(state.payment?.paypalSubscriptionStatus);

export const selectIsPaypalSubscriptionCancelled = (state) => 
  ['CANCELLED', 'EXPIRED', 'SUSPENDED'].includes(state.payment?.paypalSubscriptionStatus);

// General selectors
export const selectCancelMessage = (state) => state.payment?.cancelMessage;
export const selectCurrentCycle = (state) => state.payment?.currentCycle;
export const selectCurrentCurrency = (state) => state.payment?.currentCurrency;

// 🆕 Combined subscription selectors for UI
export const selectActiveSubscriptionData = (state) => {
  const gateway = state.payment?.gateway;
  
  switch (gateway) {
    case 'stripe':
      return {
        gateway: 'stripe',
        subscriptionId: state.payment?.transactionId,
        clientSecret: state.payment?.clientSecret,
        status: state.payment?.subscriptionSuccess ? 'active' : 'pending',
      };
    
    case 'razorpay':
      return {
        gateway: 'razorpay',
        subscriptionId: state.payment?.razorpaySubscriptionId,
        cycle: state.payment?.currentCycle,
        status: state.payment?.subscriptionSuccess ? 'active' : 'pending',
      };
    
    case 'paypal':
      return {
        gateway: 'paypal',
        subscriptionId: state.payment?.paypalSubscriptionId,
        approveUrl: state.payment?.paypalApproveUrl,
        status: state.payment?.paypalSubscriptionStatus,
        cycle: state.payment?.currentCycle,
        currency: state.payment?.currentCurrency,
        subscription: state.payment?.paypalSubscription,
      };
    
    default:
      return null;
  }
};

// 🆕 Check if any subscription is currently being processed
export const selectIsSubscriptionProcessing = (state) => {
  const loading = state.payment?.loading;
  const gateway = state.payment?.gateway;
  
  if (!loading) return false;
  
  // Check if it's a subscription-related operation
  return ['stripe', 'razorpay', 'paypal'].includes(gateway);
};

// 🆕 Get subscription approval URL for PayPal
export const selectSubscriptionApprovalUrl = (state) => {
  if (state.payment?.gateway === 'paypal') {
    return state.payment?.paypalApproveUrl;
  }
  return null;
};

// 🆕 Check if subscription needs user approval
export const selectNeedsSubscriptionApproval = (state) => {
  const gateway = state.payment?.gateway;
  
  if (gateway === 'paypal') {
    return state.payment?.paypalSubscriptionStatus === 'APPROVAL_PENDING' && 
           state.payment?.paypalApproveUrl;
  }
  
  if (gateway === 'stripe') {
    return state.payment?.clientSecret && !state.payment?.subscriptionSuccess;
  }
  
  return false;
};

// 🆕 Get subscription details for display
export const selectSubscriptionDisplayData = (state) => {
  const gateway = state.payment?.gateway;
  const cycle = state.payment?.currentCycle;
  const currency = state.payment?.currentCurrency || 'USD';
  
  const baseData = {
    gateway,
    cycle,
    currency,
    loading: state.payment?.loading,
    error: state.payment?.error,
  };
  
  switch (gateway) {
    case 'stripe':
      return {
        ...baseData,
        subscriptionId: state.payment?.transactionId,
        status: state.payment?.subscriptionSuccess ? 'active' : 'processing',
        needsConfirmation: !!state.payment?.clientSecret,
      };
    
    case 'razorpay':
      return {
        ...baseData,
        subscriptionId: state.payment?.razorpaySubscriptionId,
        status: state.payment?.subscriptionSuccess ? 'active' : 'pending',
      };
    
    case 'paypal':
      return {
        ...baseData,
        subscriptionId: state.payment?.paypalSubscriptionId,
        status: state.payment?.paypalSubscriptionStatus || 'pending',
        approveUrl: state.payment?.paypalApproveUrl,
        needsApproval: state.payment?.paypalSubscriptionStatus === 'APPROVAL_PENDING',
        subscriptionDetails: state.payment?.paypalSubscription,
      };
    
    default:
      return baseData;
  }
};
