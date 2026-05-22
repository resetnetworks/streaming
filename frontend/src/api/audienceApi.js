import axios from "../utills/axiosInstance";

export const audienceApi = {
  fetchAudience: async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    );
    if (!cleanParams.filter) cleanParams.filter = "all_users"; // ✅ safety net
    const res = await axios.get("/audience", { params: cleanParams });
    return res.data;
  },

  exportAudienceCSV: async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    );
    if (!cleanParams.filter) cleanParams.filter = "all_users"; // ✅ safety net
    const res = await axios.get("/audience/export/csv", {
      params: cleanParams,
      responseType: 'blob',
    });
    return res.data;
  },
};