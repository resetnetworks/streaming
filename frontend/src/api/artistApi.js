// src/api/artistApi.js
import axios from "../utills/axiosInstance";

// All API calls for artists (pure functions, no state)
export const artistApi = {
  // Get all artists with pagination - FIXED
  fetchAll: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/artists?page=${page}&limit=${limit}`);
    return res.data; // ✅ Direct response return karein
  },

    fetchDashboardSingles: async ({ page = 1, limit = 10, type = "single" } = {}) => {
  const res = await axios.get(
    `/artist/dashboard/singles?page=${page}&limit=${limit}&type=${type}`
  );

  return {
    songs: res.data.data || [],
    pagination: {
      page: res.data.page || page,
      limit,
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 1,
    },
  };
},

  fetchDashboardAlbums: async ({ page = 1, limit = 10 } = {}) => {
  const res = await axios.get(
    `/artist/dashboard/albums?page=${page}&limit=${limit}`
  );

  return {
    albums: res.data.data || [],
    pagination: {
      page: res.data.page || page,
      limit,
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 1,
    },
  };
},

  // Get all artists without pagination
  fetchAllNoPagination: async () => {
    const res = await axios.get(`/artists/all`);
    return res.data.data || res.data.artists;
  },

  // Get artist by slug or ID
  fetchById: async (id) => {
    const res = await axios.get(`/artists/${id}`);
    return res.data.data || res.data.artist;
  },

  // Get artist's own profile
  fetchProfile: async () => {
    const res = await axios.get("/artists/profile/me");
    return res.data.data;
  },

  // Create new artist
  create: async (formData) => {
    const res = await axios.post("/artists", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data || res.data.artist;
  },

  // Update artist's own profile
  updateProfile: async ({ id, formData }) => {
    const res = await axios.put(`/artists/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data || res.data.artist;
  },

  // Delete artist
  delete: async (id) => {
    await axios.delete(`/artists/${id}`);
    return id;
  },

  // Fetch random artist with songs
  fetchRandomArtistWithSongs: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/discover/random-artist?page=${page}&limit=${limit}`);
    return res.data.data || res.data;
  },

  // Search artists
  search: async ({ query, page = 1, limit = 10 }) => {
    const res = await axios.get(
      `/artists?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return {
      data: res.data.data || res.data.results,
      pagination: res.data.pagination || {
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