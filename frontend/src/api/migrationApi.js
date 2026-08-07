// src/api/migrationApi.js
import axiosInstance from "../utills/axiosInstance";

export const migrationApi = {
  createMigration: async (url, workspaceId) => {
    const response = await axiosInstance.post("/migration/bandcamp", { url, workspaceId });
    return response.data;
  },

  getMigrationStatus: async (jobId) => {
    const response = await axiosInstance.get(`/migration/${jobId}`);
    return response.data;
  },

  getMigrationAlbums: async (jobId) => {
    const response = await axiosInstance.get(`/migration/${jobId}/albums`);
    return response.data;
  },

  getMigrationTracks: async (jobId) => {
    const response = await axiosInstance.get(`/migration/${jobId}/tracks`);
    return response.data;
  },

  getDraftAlbums: async () => {
    const response = await axiosInstance.get("/migration/drafts/albums");
    return response.data;
  },

  getDraftAlbumDetails: async (albumId) => {
    const response = await axiosInstance.get(`/migration/drafts/albums/${albumId}`);
    return response.data;
  },

  updateDraftAlbum: async (albumId, data) => {
    const response = await axiosInstance.patch(`/migration/drafts/albums/${albumId}`, data);
    return response.data;
  },

  updateDraftTrack: async (trackId, data) => {
    const response = await axiosInstance.patch(`/migration/drafts/tracks/${trackId}`, data);
    return response.data;
  },

  publishDraftAlbum: async (albumId, data) => {
    const response = await axiosInstance.post(`/migration/drafts/albums/${albumId}/publish`, data);
    return response.data;
  },

  retryMigration: async (jobId) => {
    const response = await axiosInstance.post(`/migration/${jobId}/retry`);
    return response.data;
  },

  importMigration: async (jobId, data) => {
    const response = await axiosInstance.post(`/migration/${jobId}/import`, data);
    return response.data;
  }
};
