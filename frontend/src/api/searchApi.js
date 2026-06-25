import axios from "../utills/axiosInstance";

export const searchApi = {
  fetchResults: async (query) => {
    const res = await axios.get("/search", { params: { q: query } });
    return res.data;
  },
};
