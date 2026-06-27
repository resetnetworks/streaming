// src/api/artistApplicationApi.js
import axios from "../utills/axiosInstance";

export const artistApplicationApi = {
  submit: async (applicationData) => {
    const res = await axios.post("/v2/artist/apply", applicationData);
    return res.data.application || res.data;
  },

  fetchMyApplication: async () => {
    const res = await axios.get("/v2/artist/application/me");
    return res.data.application || res.data;
  },

  checkUserRole: async () => {
    const res = await axios.get("/v2/auth/me");
    return res.data.user || res.data;
  },
};
