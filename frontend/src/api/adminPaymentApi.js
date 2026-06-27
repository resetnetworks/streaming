// src/api/adminPaymentApi.js
import axios from "../utills/axiosInstance";

export const adminPaymentApi = {
  fetchArtistTransactions: async (params = {}) => {
    const res = await axios.get("/admin/dashboard/transactions", { params });
    return res.data.transactions;
  },

  fetchPurchasedSongs: async (artistId) => {
    const res = await axios.get(`/admin/dashboard/purchased-songs/${artistId}`);
    return res.data.songs;
  },

  fetchPurchasedAlbums: async (artistId) => {
    const res = await axios.get(`/admin/dashboard/purchased-albums/${artistId}`);
    return res.data.albums;
  },

  fetchSubscriberCount: async (artistId) => {
    const res = await axios.get(`/admin/dashboard/subscriber-count/${artistId}`);
    return res.data; // Expected: { activeSubscribers, totalRevenue }
  },

  fetchArtistRevenue: async (artistId) => {
    const res = await axios.get(`/admin/dashboard/revenue-summary/${artistId}`);
    return res.data; // Expected: { revenue: { songRevenue, albumRevenue, subscriptionRevenue, totalRevenue } }
  },
};
