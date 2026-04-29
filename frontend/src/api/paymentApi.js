import axios from "../utills/axiosInstance";

export const paymentApi = {
  /**  * 🎵 One-time payment (dynamic gateway). */
  createPayment: async ({
    itemId,
    itemType,
    currency = "USD",
    gateway = "stripe",
    meta = {}, // 🔥 extra future data
  }) => {
    const res = await axios.post(`/v2/payment/${gateway}/checkout`, {
      itemId,
      itemType,
      currency,
      ...meta, // future support (coupon, etc)
    });

    return res.data;
  },

  /**
   * 💳 Subscription payment (dynamic gateway)
   */
  createSubscription: async ({
    artistId,
    cycle,
    currency = "USD",
    gateway = "stripe",
    meta = {},
  }) => {
    const res = await axios.post(`/v2/payment/${gateway}/subscription`, {
      artistId,
      cycle,
      currency,
      ...meta,
    });

    return res.data;
  },
};
