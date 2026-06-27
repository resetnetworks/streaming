import { useQuery } from "@tanstack/react-query";
import { streamApi } from "../../api/streamApi";

export const useSongStreamUrl = (songId, options = {}) => {
  return useQuery({
    queryKey: ["stream", "song", songId],
    queryFn: () => streamApi.fetchSongStreamUrl(songId),
    enabled: !!songId,
    staleTime: 10 * 60 * 1000, // consider signed S3 URL fresh for 10 minutes
    gcTime: 15 * 60 * 1000,    // clear from cache after 15 minutes
    ...options,
  });
};
