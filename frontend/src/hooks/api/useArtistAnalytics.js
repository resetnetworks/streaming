// src/hooks/api/useArtistAnalytics.js
import { useQuery } from "@tanstack/react-query";
import { artistAnalyticsApi } from "../../api/artistAnalyticsApi";

export const artistAnalyticsKeys = {
  all: ["artist-analytics"],
  overview: (range = "30d", artistId = null) => [
    ...artistAnalyticsKeys.all,
    "overview",
    range,
    artistId || "me",
  ],
  timeseries: (range = "30d", artistId = null) => [
    ...artistAnalyticsKeys.all,
    "timeseries",
    range,
    artistId || "me",
  ],
  topSongs: (range = "30d", sortBy = "plays", limit = 10, artistId = null) => [
    ...artistAnalyticsKeys.all,
    "top-songs",
    range,
    sortBy,
    limit,
    artistId || "me",
  ],
  funnel: (artistId = null, startDate = null, endDate = null) => [
    ...artistAnalyticsKeys.all,
    "funnel",
    artistId || "me",
    startDate || "all",
    endDate || "all",
  ],
};

/**
 * Hook to fetch aggregated artist overview metrics.
 */
export const useArtistOverview = (params = {}, options = {}) => {
  const { range = "30d", artistId = null, enabled = true } = params;

  return useQuery({
    queryKey: artistAnalyticsKeys.overview(range, artistId),
    queryFn: () => artistAnalyticsApi.fetchArtistOverview({ range, artistId }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Hook to fetch artist day-by-day continuous timeseries.
 */
export const useArtistTimeseries = (params = {}, options = {}) => {
  const { range = "30d", artistId = null, enabled = true } = params;

  return useQuery({
    queryKey: artistAnalyticsKeys.timeseries(range, artistId),
    queryFn: () => artistAnalyticsApi.fetchArtistTimeseries({ range, artistId }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Hook to fetch top performing songs for artist.
 */
export const useArtistTopSongs = (params = {}, options = {}) => {
  const { range = "30d", sortBy = "plays", limit = 10, artistId = null, enabled = true } = params;

  return useQuery({
    queryKey: artistAnalyticsKeys.topSongs(range, sortBy, limit, artistId),
    queryFn: () => artistAnalyticsApi.fetchArtistTopSongs({ range, sortBy, limit, artistId }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Hook to fetch conversion funnel metrics for artist.
 */
export const useArtistFunnel = (params = {}, options = {}) => {
  const { artistId = null, startDate = null, endDate = null, enabled = true } = params;

  return useQuery({
    queryKey: artistAnalyticsKeys.funnel(artistId, startDate, endDate),
    queryFn: () => artistAnalyticsApi.fetchArtistFunnel({ artistId, startDate, endDate }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    ...options,
  });
};

/**
 * Combined hook for full Artist Dashboard analytics state.
 */
export const useArtistDashboardAnalytics = ({
  range = "30d",
  sortBy = "plays",
  limit = 10,
  artistId = null,
} = {}) => {
  const overviewQuery = useArtistOverview({ range, artistId });
  const timeseriesQuery = useArtistTimeseries({ range, artistId });
  const topSongsQuery = useArtistTopSongs({ range, sortBy, limit, artistId });
  const startDate = overviewQuery.data?.range?.startDate || null;
  const endDate = overviewQuery.data?.range?.endDate || null;
  const funnelQuery = useArtistFunnel({ artistId, startDate, endDate });

  const isLoading = overviewQuery.isLoading || timeseriesQuery.isLoading || topSongsQuery.isLoading;
  const isError = overviewQuery.isError || timeseriesQuery.isError || topSongsQuery.isError;
  const error = overviewQuery.error || timeseriesQuery.error || topSongsQuery.error;

  const refetchAll = () => {
    overviewQuery.refetch();
    timeseriesQuery.refetch();
    topSongsQuery.refetch();
    funnelQuery.refetch();
  };

  return {
    overview: overviewQuery.data,
    timeseries: timeseriesQuery.data?.timeseries || [],
    timeseriesRange: timeseriesQuery.data?.range,
    topSongs: topSongsQuery.data?.songs || [],
    funnel: funnelQuery.data,
    overviewQuery,
    timeseriesQuery,
    topSongsQuery,
    funnelQuery,
    isLoading,
    isError,
    error,
    refetchAll,
  };
};

export default useArtistDashboardAnalytics;
