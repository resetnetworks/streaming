import axios from "../utills/axiosInstance";

// All API calls for user dashboard (pure functions, no state)
export const userDashboardApi = {
  // Get user purchases (songs, albums, history)
  fetchPurchases: async () => {
    const res = await axios.get("/user/dashboard/purchases");
    return res.data;
  },

  // Get user subscriptions
  fetchSubscriptions: async () => {
    const res = await axios.get("/user/dashboard/subscriptions");
    return res.data;
  },
};