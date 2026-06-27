import axios from "../utills/axiosInstance";

export const streamApi = {
  fetchSongStreamUrl: async (songId) => {
    const res = await axios.get(`/stream/song/${songId}`);
    return {
      url: res.data.url,
      isPreview: res.data.isPreview,
    };
  },
};
