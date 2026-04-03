// src/api/monetizationApi.js
import axios from "../utills/axiosInstance";

export const monetizationApi = {
  setup: async ({ subscriptionPrice, cycle }) => {
    const res = await axios.post("/v2/monetize", {
      subscriptionPrice,
      cycle,
    });
    return res.data;
  },

  getSetupStatus: async () => {
    const res = await axios.get(
      "/v2/monetize/artists/me/monetization-setup-status"
    );
    return res.data;
  },
};