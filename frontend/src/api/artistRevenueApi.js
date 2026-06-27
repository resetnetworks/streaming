// src/api/artistRevenueApi.js
import axios from "../utills/axiosInstance";

export const artistRevenueApi = {
  fetchBalance: async () => {
    const res = await axios.get("/v2/artist/balance");
    return res.data; // Expected: { success, balance }
  },

  fetchLedger: async ({ page = 1, limit = 20 } = {}) => {
    const res = await axios.get("/v2/artist/ledger", {
      params: { page, limit },
    });
    return res.data; // Expected: { success, page, limit, ledger }
  },

  fetchPayouts: async () => {
    const res = await axios.get("/v2/artist/payouts");
    return res.data; // Expected: { success, payouts }
  },

  requestPayout: async ({ amount, paypalEmail }) => {
    const res = await axios.post("/v2/artist/payouts/request", {
      amount,
      paypalEmail,
    });
    return res.data; // Expected: { success, message, payout }
  },
};
