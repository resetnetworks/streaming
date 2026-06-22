import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { notificationApi } from "../../api/notificationApi";

export const notificationKeys = {
  all: ["notifications"],
  list: () => [...notificationKeys.all, "list"],
  unread: () => [...notificationKeys.all, "unread"],
};

// Hook to fetch notifications list (only enables when user is logged in)
export const useNotifications = (limit = 20, options = {}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationApi.fetchNotifications(limit),
    enabled: !!isAuthenticated,
    staleTime: 30 * 1000, // consider data fresh for 30s
    ...options,
  });
};

// Hook to poll unread count every 30 seconds
export const useUnreadNotificationCount = (options = {}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationApi.fetchUnreadCount(),
    enabled: !!isAuthenticated,
    refetchInterval: 30 * 1000, // poll count every 30 seconds in the background
    refetchIntervalInBackground: false, // pause when tab is minimized
    ...options,
  });
};

// Hook to mark all notifications as read and invalidate cache
export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.readAllNotifications(),
    onSuccess: () => {
      // Invalidate count and list queries to refresh UI instantly
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};
