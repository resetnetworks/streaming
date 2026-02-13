import axios from "../utills/axiosInstance";

export const songApi = {
  fetchAll: async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/songs?page=${page}&limit=${limit}`);
    return res.data;
  },

  fetchById: async (id) => {
    const res = await axios.get(`/songs/${id}`);
    return res.data.song;
  },

  fetchByArtist: async ({ artistId, page = 1, limit = 10 }) => {
    const res = await axios.get(
      `/songs/artist/${artistId}?page=${page}&limit=${limit}`
    );
    return {
      songs: res.data.songs || [],
      pagination: res.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
      artistInfo: res.data.artist || null,
      page,
    };
  },

  fetchByAlbum: async (albumId) => {
    const res = await axios.get(`/songs/album/${albumId}`);
    return res.data.songs || [];
  },

fetchAllSingles: async ({ page = 1, limit = 10 } = {}) => {
  const res = await axios.get(`/songs/singles?page=${page}&limit=${limit}`);

  return {
    songs: res.data.songs || [],
    pagination: {
      page: res.data.currentPage,
      limit,
      total: res.data.totalSongs,
      totalPages: res.data.totalPages,
    },
  };
},


  fetchSinglesByArtist: async ({ artistId, page = 1, limit = 10 }) => {
    const res = await axios.get(
      `/songs/singles/artist/${artistId}?page=${page}&limit=${limit}`
    );
    return {
      songs: res.data.songs || [],
      pagination: res.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
      artistInfo: res.data.artist || null,
      page,
    };
  },

  fetchLikedSongs: async ({ page = 1, limit = 20 } = {}) => {
    const res = await axios.get("/songs/liked", {
      params: { page, limit },
    });
    return {
      songs: res.data.songs || [],
      total: res.data.total || 0,
      page: res.data.page || page,
      pages: res.data.pages || 1,
    };
  },

  fetchMatchingGenreSongs: async ({ page = 1, limit = 20 } = {}) => {
    const res = await axios.get("/songs/matching-genre", {
      params: { page, limit },
    });
    return {
      songs: res.data.songs || [],
      matchingGenres: res.data.matchingGenres || [],
      pagination: {
        page: res.data.page || page,
        limit,
        total: res.data.total || 0,
        totalPages: res.data.pages || 1,
      },
    };
  },

  fetchByGenre: async ({ genre, page = 1, limit = 20 }) => {
    const res = await axios.get(
      `/songs/genre/${encodeURIComponent(genre)}?page=${page}&limit=${limit}`
    );
    return {
      songs: res.data.songs || [],
      pagination: {
        page: res.data.page || page,
        limit,
        total: res.data.total || 0,
        totalPages: res.data.pages || 1,
      },
      genre,
    };
  },

  /**
   * IMPORTANT:
   * audioKey / coverImageKey yahan pe already generated honge
   * (presigned upload flow ke baad)
   */
  create: async (data) => {
    const res = await axios.post("/songs", data);
    return res.data.song;
  },

  update: async ({ songId, data }) => {
    const res = await axios.put(`/songs/${songId}`, data);
    return res.data.song;
  },

  delete: async (songId) => {
    await axios.delete(`/songs/${songId}`);
    return songId;
  },

  likeSong: async (songId) => {
  const res = await axios.put(`/users/likedsong/${songId}`);
  return { songId, message: res.data.message };
},


  unlikeSong: async (songId) => {
    await axios.delete(`/users/likedsong/${songId}`);
    return songId;
  },
};
