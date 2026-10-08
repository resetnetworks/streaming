// src/api/referralApi.js
import axios from "../utills/axiosInstance";

export const referralApi = {
  /*
   * Get or generate the logged-in artist's unique referral code & share link
   */
  getMyReferralCode: async () => {
    const res = await axios.get("/v2/referrals/my-code");
    return res.data.data;
  },

  /*
   * Get dashboard statistics and list of referred applicants with their 3-stage progress
   */
  getMyReferrals: async () => {
    const res = await axios.get("/v2/referrals/my-referrals");
    return res.data.data;
  },
};

export default referralApi;
