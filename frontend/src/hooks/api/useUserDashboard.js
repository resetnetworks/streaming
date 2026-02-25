import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userDashboardApi } from "../../api/userDashboardApi";

// 🎯 Query Keys
export const userDashboardKeys = {
  all: ["userDashboard"],
  purchases: () => [...userDashboardKeys.all, "purchases"],
  subscriptions: () => [...userDashboardKeys.all, "subscriptions"],
};

// 📥 QUERIES

// Get user purchases
export const useUserPurchases = (options = {}) => {
  return useQuery({
    queryKey: userDashboardKeys.purchases(),
    queryFn: () => userDashboardApi.fetchPurchases(),
    staleTime: 10 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get user subscriptions
export const useUserSubscriptions = (options = {}) => {
  return useQuery({
    queryKey: userDashboardKeys.subscriptions(),
    queryFn: () => userDashboardApi.fetchSubscriptions(),
    staleTime: 10 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Combined hook for dashboard (if you need both at once)
export const useUserDashboard = () => {
  const purchasesQuery = useUserPurchases();
  const subscriptionsQuery = useUserSubscriptions();

  return {
    purchases: purchasesQuery.data,
    subscriptions: subscriptionsQuery.data?.subscriptions,
    isLoading: purchasesQuery.isLoading || subscriptionsQuery.isLoading,
    isError: purchasesQuery.isError || subscriptionsQuery.isError,
    error: purchasesQuery.error || subscriptionsQuery.error,
    refetch: () => {
      purchasesQuery.refetch();
      subscriptionsQuery.refetch();
    },
  };
};