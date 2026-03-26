// src/api/workspaceApi.js
import axios from "../utills/axiosInstance";

export const workspaceApi = {
  // 📥 Get my workspaces
  fetchMyWorkspaces: async () => {
    const res = await axios.get("/workspaces/me/workspaces");
    return res.data.workspaces;
  },

  // 📊 Get workspace dashboard
  fetchWorkspaceDashboard: async (workspaceId) => {
    const res = await axios.get(`/workspaces/${workspaceId}`);
    return res.data;
  },

  // 👥 Get members
  fetchMembers: async (workspaceId) => {
    const res = await axios.get(`/workspaces/${workspaceId}/members`);
    return res.data.members;
  },

  // ✉️ Invite member
  inviteMember: async ({ workspaceId, data }) => {
    const res = await axios.post(
      `/workspaces/${workspaceId}/invite`,
      data
    );
    return res.data.invite;
  },

  // ✅ Accept invite
  acceptInvite: async (token) => {
    const res = await axios.post(`/workspaces/invite/accept`, { token });
    return res.data;
  },

  // ❌ Remove member
  removeMember: async ({ workspaceId, userId }) => {
    const res = await axios.delete(
      `/workspaces/${workspaceId}/members/${userId}`
    );
    return res.data;
  },

  // ✏️ Update member
  updateMember: async ({ workspaceId, userId, data }) => {
    const res = await axios.patch(
      `/workspaces/${workspaceId}/members/${userId}`,
      data
    );
    return res.data.member;
  },
};