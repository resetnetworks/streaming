// src/api/adminPayoutApi.js
import axios from "../utills/axiosInstance";

export const adminPayoutApi = {
  fetchPayouts: async ({ status = "requested" } = {}) => {
    const res = await axios.get("/v2/admin/payouts", {
      params: { status },
    });
    return res.data; // Expected: { success, count, payouts }
  },

  markAsPaid: async (payoutId) => {
    const res = await axios.post(`/v2/admin/payouts/${payoutId}/mark-paid`);
    return res.data; // Expected: { success, message, payout }
  },
};
