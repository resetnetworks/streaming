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
