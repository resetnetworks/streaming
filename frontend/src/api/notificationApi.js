import axios from "../utills/axiosInstance";

export const notificationApi = {
  // Fetch latest notifications for the user
  fetchNotifications: async (limit = 20) => {
    const res = await axios.get("/v2/notifications", { params: { limit } });
    return res.data;
  },

  // Fetch count of unread notifications
  fetchUnreadCount: async () => {
    const res = await axios.get("/v2/notifications/unread-count");
    return res.data;
  },

  // Mark all notifications as read for the user
  readAllNotifications: async () => {
    const res = await axios.post("/v2/notifications/read-all");
    return res.data;
  },
};
