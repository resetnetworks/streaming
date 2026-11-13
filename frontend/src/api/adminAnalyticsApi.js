// src/api/adminAnalyticsApi.js
import axiosInstance from "../utills/axiosInstance";

export const adminAnalyticsApi = {
  /**
   * Fetches platform-wide overview metrics (totals, traffic, user growth, playback, monetization).
   * @param {Object} params
   * @param {string} [params.range="30d"] - "7d" | "30d" | "90d"
   * @param {string} [params.startDate] - YYYY-MM-DD
   * @param {string} [params.endDate] - YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  fetchAdminOverview: async ({ range = "30d", startDate, endDate } = {}) => {
    const params = { range };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await axiosInstance.get("/v1/analytics/admin/overview", { params });
    return res.data?.data || res.data;
  },

  /**
   * Fetches platform-wide continuous day-by-day timeseries for charts.
   * @param {Object} params
   * @param {string} [params.range="30d"] - "7d" | "30d" | "90d"
   * @param {string} [params.startDate] - YYYY-MM-DD
   * @param {string} [params.endDate] - YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  fetchAdminTimeseries: async ({ range = "30d", startDate, endDate } = {}) => {
    const params = { range };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await axiosInstance.get("/v1/analytics/admin/timeseries", { params });
    return res.data?.data || res.data;
  },

  /**
   * Fetches ranked performance breakdown of artists across the platform.
   * @param {Object} params
   * @param {string} [params.range="30d"] - "7d" | "30d" | "90d"
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.sortBy="plays"] - "plays" | "qualifiedPlays" | "revenue" | "followers"
   * @returns {Promise<Object>}
   */
  fetchAdminArtistsSummary: async ({
    range = "30d",
    page = 1,
    limit = 20,
    sortBy = "plays",
  } = {}) => {
    const params = { range, page, limit, sortBy };
    const res = await axiosInstance.get("/v1/analytics/admin/artists-summary", { params });
    return res.data?.data || res.data;
  },
};

export default adminAnalyticsApi;

