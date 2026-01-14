// src/api/artistApi.js
import axios from "../utills/axiosInstance";

// All API calls for artists (pure functions, no state)
export const artistApi = {
  // Get all artists with pagination
  fetchAll: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/artists?page=${page}&limit=${limit}`);
    return {
      artists: res.data.artists,
      pagination: res.data.pagination,
    };
  },

  // Get all artists without pagination
  fetchAllNoPagination: async () => {
    const res = await axios.get(`/artists/all`);
    return res.data.artists;
  },

  // Get artist by slug or ID
  fetchById: async (id) => {
    const res = await axios.get(`/artists/${id}`);
    return res.data.artist;
  },

  // Get artist's own profile
  fetchProfile: async () => {
    const res = await axios.get("/artists/profile/me");
    return res.data.data; // Return the data object from response
  },

  // Create new artist
  create: async (formData) => {
    const res = await axios.post("/artists", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.artist;
  },

  // Update artist's own profile
  updateProfile: async ({ id, formData }) => {
    const res = await axios.put(`/artists/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.artist || res.data.data; // Return updated artist data
  },

  // Delete artist
  delete: async (id) => {
    await axios.delete(`/artists/${id}`);
    return id;
  },

  // Fetch random artist with songs
  fetchRandomArtistWithSongs: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/discover/random-artist?page=${page}&limit=${limit}`);
    return res.data;
  },

  // Search artists
  search: async ({ query, page = 1, limit = 10 }) => {
    const res = await axios.get(
      `/artists?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return {
      artists: res.data.results,
      pagination: {
        page: res.data.page,
        limit,
        total: res.data.total,
        totalPages: res.data.pages,
      },
    };
  },

  // Fetch subscriber count for artist
  fetchSubscriberCount: async (artistId) => {
    const res = await axios.get(`/admin/dashboard/subscriber-count/${artistId}`);
    return {
      artistId,
      ...res.data,
    };
  },
};