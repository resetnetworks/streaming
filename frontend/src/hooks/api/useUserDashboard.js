import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { userDashboardApi } from "../../api/userDashboardApi";

export const userDashboardKeys = {
  all: ["userDashboard"],
  purchases: () => [...userDashboardKeys.all, "purchases"],
  subscriptions: () => [...userDashboardKeys.all, "subscriptions"],
};

export const useUserPurchases = (options = {}) => {
  const currentUser = useSelector((state) => state.auth.user);
  
  return useQuery({
    queryKey: userDashboardKeys.purchases(),
    queryFn: () => userDashboardApi.fetchPurchases(),
    staleTime: 10 * 60 * 1000,
    enabled: !!currentUser, // ✅ Only fetch if logged in
    ...options,
  });
};

export const useUserSubscriptions = (options = {}) => {
  const currentUser = useSelector((state) => state.auth.user);
  
  return useQuery({
    queryKey: userDashboardKeys.subscriptions(),
    queryFn: () => userDashboardApi.fetchSubscriptions(),
    staleTime: 10 * 60 * 1000,
    enabled: !!currentUser, // ✅ Only fetch if logged in
    ...options,
  });
};

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