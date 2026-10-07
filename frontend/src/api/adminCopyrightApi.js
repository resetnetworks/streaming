import axios from "../utills/axiosInstance";

export const adminCopyrightApi = {
  getUnverifiedSongs: async ({ page = 1, limit = 20, statusFilter = "", search = "" } = {}) => {
    const params = { page, limit };
    if (statusFilter) params.statusFilter = statusFilter;
    if (search) params.search = search;

    const res = await axios.get("/v1/admin/copyright/unverified", { params });
    return res.data;
  },

  scanSong: async (songId) => {
    const res = await axios.post(`/v1/admin/copyright/scan/${songId}`);
    return res.data;
  },

  verifySong: async (songId) => {
    const res = await axios.post(`/v1/admin/copyright/verify/${songId}`);
    return res.data;
  },

  takedownSong: async (songId, reason = "Copyright infringement detected") => {
    const res = await axios.post(`/v1/admin/copyright/takedown/${songId}`, { reason });
    return res.data;
  },
};

export default adminCopyrightApi;
