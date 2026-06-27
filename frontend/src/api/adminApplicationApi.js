// src/api/adminApplicationApi.js
import axios from "../utills/axiosInstance";

export const adminApplicationApi = {
  list: async (params = {}) => {
    const { status, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    let url = `/v2/admin/artist-applications?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const res = await axios.get(url);
    return res.data; // returns: { success, data: { applications, pagination, stats } }
  },

  fetchById: async (id) => {
    const res = await axios.get(`/v2/admin/artist-applications/${id}`);
    return res.data.data?.application || res.data.application;
  },

  approve: async ({ id, notes }) => {
    const res = await axios.post(`/v2/admin/artist-applications/${id}/approve`, { notes });
    return res.data;
  },

  reject: async ({ id, reason }) => {
    const res = await axios.post(`/v2/admin/artist-applications/${id}/reject`, { notes: reason });
    return res.data;
  },

  requestMoreInfo: async ({ id, reason }) => {
    const res = await axios.post(`/v2/admin/artist-applications/${id}/request-more-info`, { notes: reason });
    return res.data;
  },

  updateStatus: async ({ id, status, notes }) => {
    const res = await axios.patch(`/v2/admin/artist-applications/${id}/status`, { status, notes });
    return res.data;
  },

  addNote: async ({ id, note }) => {
    const res = await axios.post(`/v2/admin/artist-applications/${id}/notes`, { note });
    return res.data;
  },

  delete: async (id) => {
    await axios.delete(`/v2/admin/artist-applications/${id}`);
    return id;
  },
};
