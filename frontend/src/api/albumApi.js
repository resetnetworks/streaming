// src/api/albumApi.js
import axios from "../utills/axiosInstance";

// All API calls for albums (pure functions, no state)
export const albumApi = {
  // Get all albums with pagination
  fetchAll: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/albums?page=${page}&limit=${limit}`);
    return res.data; // Returns { albums: [], pagination: {} }
  },

  // Get single album by ID or slug
  fetchById: async (id) => {
    const res = await axios.get(`/albums/${id}`);
    return res.data.album;
  },

  // Get albums by artist with pagination
  fetchByArtist: async ({ artistId, page = 1, limit = 10 }) => {
    const res = await axios.get(`/albums/artist/${artistId}?page=${page}&limit=${limit}`);
    return {
      albums: res.data.albums,
      pagination: res.data.pagination,
      artistInfo: res.data.artist,
      page,
    };
  },

  // Create new album
  create: async (formData) => {
    const res = await axios.post("/albums", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.album;
  },

  // Update album by ID
  update: async ({ albumId, formData }) => {
    const res = await axios.put(`/albums/${albumId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.album;
  },

  // Delete album by ID
  delete: async (albumId) => {
    await axios.delete(`/albums/${albumId}`);
    return albumId;
  },
};