// src/hooks/api/useAdminAnalytics.js
import { useQuery } from "@tanstack/react-query";
import { adminAnalyticsApi } from "../../api/adminAnalyticsApi";

export const adminAnalyticsKeys = {
  all: ["admin-analytics"],
  overview: (range = "30d", startDate = null, endDate = null) => [
    ...adminAnalyticsKeys.all,
    "overview",
    range,
    startDate || "all",
    endDate || "all",
  ],
  timeseries: (range = "30d", startDate = null, endDate = null) => [
    ...adminAnalyticsKeys.all,
    "timeseries",
    range,
    startDate || "all",
    endDate || "all",
  ],
  artistsSummary: (range = "30d", sortBy = "plays", page = 1, limit = 20) => [
    ...adminAnalyticsKeys.all,
    "artists-summary",
    range,
    sortBy,
    page,
    limit,
  ],
};

/**
 * Hook to fetch platform-wide overview metrics.
 */
export const useAdminOverview = (params = {}, options = {}) => {
  const { range = "30d", startDate = null, endDate = null, enabled = true } = params;

  return useQuery({
    queryKey: adminAnalyticsKeys.overview(range, startDate, endDate),
    queryFn: () => adminAnalyticsApi.fetchAdminOverview({ range, startDate, endDate }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Hook to fetch platform day-by-day continuous timeseries.
 */
export const useAdminTimeseries = (params = {}, options = {}) => {
  const { range = "30d", startDate = null, endDate = null, enabled = true } = params;

  return useQuery({
    queryKey: adminAnalyticsKeys.timeseries(range, startDate, endDate),
    queryFn: () => adminAnalyticsApi.fetchAdminTimeseries({ range, startDate, endDate }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Hook to fetch ranked artists performance breakdown across platform.
 */
export const useAdminArtistsSummary = (params = {}, options = {}) => {
  const { range = "30d", sortBy = "plays", page = 1, limit = 20, enabled = true } = params;

  return useQuery({
    queryKey: adminAnalyticsKeys.artistsSummary(range, sortBy, page, limit),
    queryFn: () => adminAnalyticsApi.fetchAdminArtistsSummary({ range, sortBy, page, limit }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Combined hook for full Admin Dashboard analytics state.
 */
export const useAdminDashboardAnalytics = ({
  range = "30d",
  sortBy = "plays",
  page = 1,
  limit = 20,
} = {}) => {
  const overviewQuery = useAdminOverview({ range });
  const timeseriesQuery = useAdminTimeseries({ range });
  const artistsQuery = useAdminArtistsSummary({ range, sortBy, page, limit });

  const isLoading = overviewQuery.isLoading || timeseriesQuery.isLoading || artistsQuery.isLoading;
  const isFetching = overviewQuery.isFetching || timeseriesQuery.isFetching || artistsQuery.isFetching;
  const isError = overviewQuery.isError || timeseriesQuery.isError || artistsQuery.isError;
  const error = overviewQuery.error || timeseriesQuery.error || artistsQuery.error;

  const refetchAll = () => {
    overviewQuery.refetch();
    timeseriesQuery.refetch();
    artistsQuery.refetch();
  };

  return {
    overview: overviewQuery.data,
    timeseries: timeseriesQuery.data?.timeseries || [],
    timeseriesRange: timeseriesQuery.data?.range,
    artistsSummary: artistsQuery.data?.artists || [],
    pagination: artistsQuery.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    overviewQuery,
    timeseriesQuery,
    artistsQuery,
    isLoading,
    isFetching,
    isError,
    error,
    refetchAll,
  };
};

export default useAdminDashboardAnalytics;

