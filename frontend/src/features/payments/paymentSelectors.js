export const selectPaymentLoading = (state) => state.payment.loading;
export const selectPaymentError = (state) => state.payment.error;
export const selectClientSecret = (state) => state.payment.clientSecret;
export const selectRazorpayOrderId = (state) => state.payment.razorpayOrderId;
export const selectTransactionId = (state) => state.payment.transactionId;
export const selectPaymentGateway = (state) => state.payment.gateway;
