import axios from "../utills/axiosInstance";

export const accountSettingsApi = {
  initiateEmailChange: async (data) => {
    const res = await axios.post("/users/change-email", data);
    return res.data;
  },
  verifyEmailChange: async (data) => {
    const res = await axios.post("/users/verify-email-change", data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await axios.post("/users/change-password", data);
    return res.data;
  },
};
