// src/api/songApi.js
import axios from "../utills/axiosInstance";

// All API calls for songs (pure functions, no state)
export const songApi = {
  // Get all songs with pagination
  fetchAll: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/songs?page=${page}&limit=${limit}`);
    return res.data; // Returns { songs: [], pagination: {} }
  },

  // Get single song by ID
  fetchById: async (id) => {
    const res = await axios.get(`/songs/${id}`);
    return res.data.song;
  },

  // Get songs by artist with pagination
  fetchByArtist: async ({ artistId, page = 1, limit = 10 }) => {
    const res = await axios.get(`/songs/artist/${artistId}?page=${page}&limit=${limit}`);
    return {
      songs: res.data.songs || [],
      pagination: res.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1
      },
      artistInfo: res.data.artist || null,
      page,
    };
  },

  // Get songs by album
  fetchByAlbum: async (albumId) => {
    const res = await axios.get(`/songs/album/${albumId}`);
    return res.data.songs || [];
  },

  // Get all singles with pagination
  fetchAllSingles: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/songs/singles?page=${page}&limit=${limit}`);
    return {
      songs: res.data.songs || [],
      pagination: res.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1
      }
    };
  },

  // Get singles by artist
  fetchSinglesByArtist: async ({ artistId, page = 1, limit = 10 }) => {
    const res = await axios.get(`/songs/singles/artist/${artistId}?page=${page}&limit=${limit}`);
    return {
      songs: res.data.songs || [],
      pagination: res.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1
      },
      artistInfo: res.data.artist || null,
      page,
    };
  },

  // Get liked songs
  fetchLikedSongs: async ({ page = 1, limit = 20 } = {}) => {
    const res = await axios.get('/songs/liked', {
      params: { page, limit }
    });
    return {
      songs: res.data.songs || [],
      total: res.data.total || 0,
      page: res.data.page || page,
      pages: res.data.pages || 1
    };
  },

  // Get songs matching user genres
  fetchMatchingGenreSongs: async ({ page = 1, limit = 20 } = {}) => {
    const res = await axios.get('/songs/matching-genre', {
      params: { page, limit }
    });
    return {
      songs: res.data.songs || [],
      matchingGenres: res.data.matchingGenres || [],
      pagination: {
        page: res.data.page || page,
        limit,
        total: res.data.total || 0,
        totalPages: res.data.pages || 1
      }
    };
  },

  // Get songs by genre
  fetchByGenre: async ({ genre, page = 1, limit = 20 } = {}) => {
    const res = await axios.get(`/songs/genre/${encodeURIComponent(genre)}?page=${page}&limit=${limit}`);
    return {
      songs: res.data.songs || [],
      pagination: {
        page: res.data.page || page,
        limit,
        total: res.data.total || 0,
        totalPages: res.data.pages || 1
      },
      genre,
    };
  },

  // Create new song
  create: async (formData) => {
    const res = await axios.post("/songs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.song;
  },

  // Update song by ID
  update: async ({ songId, formData }) => {
    const res = await axios.put(`/songs/${songId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.song;
  },

  // Delete song by ID
  delete: async (songId) => {
    await axios.delete(`/songs/${songId}`);
    return songId;
  },
};