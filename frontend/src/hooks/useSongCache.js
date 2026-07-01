import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import { songApi } from "../api/songApi";
import { 
  setRandomDefaultFromSongs,
  loadDefaultSongFromStorage 
} from "../features/playback/playerSlice";
import { selectDefaultSong, selectSelectedSong } from "../features/playback/playerSelectors";

export const useSongCache = (type, options = {}) => {
  const { limit = 30 } = options;  
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  const defaultSong = useSelector(selectDefaultSong);
  const selectedSong = useSelector(selectSelectedSong);

  // Load default song from localStorage on component mount
  useEffect(() => {
    dispatch(loadDefaultSongFromStorage());
  }, [dispatch]);

  // Use React Query's useInfiniteQuery for infinite scroll and cache management
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status
  } = useInfiniteQuery({
    queryKey: ["songs", "cache", type, limit],
    queryFn: ({ pageParam = 1 }) => songApi.fetchAll({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      // API response returns { songs: [...], totalPages, currentPage, total } or similar
      const currentPage = lastPage.currentPage || lastPage.page || 1;
      const totalPages = lastPage.totalPages || lastPage.pages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const songs = useMemo(() => {
    return data?.pages?.flatMap(page => page.songs || []) || [];
  }, [data]);

  // Set default song when songs are loaded and no song is selected
  useEffect(() => {
    if (
      songs.length > 0 && 
      !selectedSong && 
      !defaultSong && 
      status === 'success'
    ) {
      dispatch(setRandomDefaultFromSongs(songs));
    }
  }, [songs, selectedSong, defaultSong, status, dispatch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      setPage(prev => prev + 1);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pagination = useMemo(() => {
    const lastPage = data?.pages?.[data.pages.length - 1];
    return lastPage 
      ? {
          page: lastPage.currentPage || lastPage.page || 1,
          limit,
          total: lastPage.total || 0,
          totalPages: lastPage.totalPages || lastPage.pages || 1,
        }
      : { page: 1, limit, total: 0, totalPages: 1 };
  }, [data, limit]);

  return {
    songs,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    pagination,
    loadMore,
    hasMore: hasNextPage,
    defaultSongInfo: {
      hasDefaultSong: !!defaultSong,
      defaultSongTitle: defaultSong?.title || null,
      hasSelectedSong: !!selectedSong
    }
  };
};
