import axios from "../utills/axiosInstance";

export const workspaceApi = {
  // Get all workspaces the current user belongs to
  getMyWorkspaces: async () => {
    const res = await axios.get("/workspaces/me/workspaces");
    return res.data;
  },

  // Get dashboard data/stats for a workspace
  getWorkspaceDashboard: async (workspaceId) => {
    const res = await axios.get(`/workspaces/${workspaceId}`);
    return res.data;
  },

  // Get list of members in a workspace
  getWorkspaceMembers: async (workspaceId) => {
    const res = await axios.get(`/workspaces/${workspaceId}/members`);
    return res.data;
  },

  // Invite a new member to the workspace
  inviteWorkspaceMember: async ({ workspaceId, email, role, permissionsOverride }) => {
    const res = await axios.post(`/workspaces/${workspaceId}/invite`, {
      email,
      role,
      permissionsOverride,
    });
    return res.data;
  },

  // Accept a workspace invitation
  acceptInvite: async ({ token }) => {
    const res = await axios.post("/workspaces/invite/accept", { token });
    return res.data;
  },

  // Update a workspace member's role and/or permission overrides
  updateWorkspaceMember: async ({ workspaceId, userId, role, permissionsOverride }) => {
    const res = await axios.patch(
      `/workspaces/workspaces/${workspaceId}/members/${userId}`,
      { role, permissionsOverride }
    );
    return res.data;
  },

  // Remove a workspace member
  removeWorkspaceMember: async ({ workspaceId, userId }) => {
    const res = await axios.delete(
      `/workspaces/workspaces/${workspaceId}/members/${userId}`
    );
    return res.data;
  },
};
