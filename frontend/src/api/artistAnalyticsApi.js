// src/api/artistAnalyticsApi.js
import axiosInstance from "../utills/axiosInstance";

export const artistAnalyticsApi = {
  /**
   * Fetches aggregated overview metrics for the artist dashboard.
   * @param {Object} params
   * @param {string} [params.range="30d"] - "7d" | "30d" | "90d"
   * @param {string} [params.artistId] - Optional artistId override (for admin persona)
   * @returns {Promise<Object>}
   */
  fetchArtistOverview: async ({ range = "30d", artistId } = {}) => {
    const params = { range };
    if (artistId) params.artistId = artistId;
    const res = await axiosInstance.get("/v1/analytics/artist/overview", { params });
    return res.data?.data || res.data;
  },

  /**
   * Fetches day-by-day continuous timeseries for artist dashboard charts.
   * @param {Object} params
   * @param {string} [params.range="30d"] - "7d" | "30d" | "90d"
   * @param {string} [params.artistId] - Optional artistId override (for admin persona)
   * @returns {Promise<Object>}
   */
  fetchArtistTimeseries: async ({ range = "30d", artistId } = {}) => {
    const params = { range };
    if (artistId) params.artistId = artistId;
    const res = await axiosInstance.get("/v1/analytics/artist/timeseries", { params });
    return res.data?.data || res.data;
  },

  /**
   * Fetches top performing songs for the artist dashboard table.
   * @param {Object} params
   * @param {string} [params.range="30d"] - "7d" | "30d" | "90d"
   * @param {number} [params.limit=10]
   * @param {string} [params.sortBy="plays"] - "plays" | "qualifiedPlays" | "completions" | "likes"
   * @param {string} [params.artistId] - Optional artistId override (for admin persona)
   * @returns {Promise<Object>}
   */
  fetchArtistTopSongs: async ({ range = "30d", limit = 10, sortBy = "plays", artistId } = {}) => {
    const params = { range, limit, sortBy };
    if (artistId) params.artistId = artistId;
    const res = await axiosInstance.get("/v1/analytics/artist/top-songs", { params });
    return res.data?.data || res.data;
  },

  /**
   * Fetches conversion funnel analytics & drop-off metrics for an artist.
   * @param {Object} params
   * @param {string} [params.artistId] - Optional artistId override
   * @param {string} [params.startDate]
   * @param {string} [params.endDate]
   * @returns {Promise<Object>}
   */
  fetchArtistFunnel: async ({ artistId, startDate, endDate } = {}) => {
    const targetId = artistId || "all";
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await axiosInstance.get(`/v1/analytics/funnel/${targetId}`, { params });
    return res.data?.data || res.data;
  },
};

export default artistAnalyticsApi;
