// src/api/albumApi.js
import axios from "../utills/axiosInstance";

// All API calls for albums (pure functions, no state)
export const albumApi = {
  // Get all albums with pagination
  fetchAll: async ({ page = 1, limit = 10, ...filters } = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters }).toString();
    const res = await axios.get(`/albums?${params}`);
    return res.data;
  },

  // Get single album by ID or slug
  fetchById: async (id) => {
    const res = await axios.get(`/albums/${id}`);
    return res.data.album;
  },

  // Get albums by artist with pagination (optimized version)
  fetchByArtist: async ({ artistId, page = 1, limit = 10 }) => {
    const res = await axios.get(
      `/albums/artist/${artistId}?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  // Create new album
 create: async (data) => {
  const res = await axios.post("/albums", data);
  return res.data.album;
},


  // Update album by ID
  update: async ({ albumId, formData }) => {
    const payload = new FormData();
    
    // Text fields
    Object.keys(formData).forEach((key) => {
      if (key !== 'coverImage' && key !== 'songs') {
        const value = formData[key];
        if (Array.isArray(value)) {
          value.forEach((item) => payload.append(key, item));
        } else if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      }
    });

    // Cover image (only if new file provided)
    if (formData.coverImage instanceof File) {
      payload.append('coverImage', formData.coverImage);
    } else if (formData.coverImage === null) {
      payload.append('coverImage', ''); // To remove existing image
    }

    // Songs
    if (Array.isArray(formData.songs)) {
      formData.songs.forEach((songId, index) => {
        payload.append(`songs[${index}]`, songId);
      });
    }

    const res = await axios.put(`/albums/${albumId}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data; // Updated to match controller response
  },

  // Delete album by ID
  delete: async (albumId) => {
    await axios.delete(`/albums/${albumId}`);
    return albumId;
  },
};