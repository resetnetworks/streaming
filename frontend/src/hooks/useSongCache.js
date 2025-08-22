import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { 
  fetchAllSongs,
  setCachedData 
} from "../features/songs/songSlice";
import {
  selectIsPageCached,
  selectCachedPageData,
  selectIsCacheValid
} from "../features/songs/songSelectors";

export const useSongCache = (type, options = {}) => {
  // ✅ default 30 songs per page
  const { limit = 30 } = options;  
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState([]);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const status = useSelector((state) => state.songs.status);
  const pagination = useSelector((state) => state.songs.pagination);
  const isPageCached = useSelector(selectIsPageCached(page));
  const cachedPageData = useSelector(selectCachedPageData(page));
  const isCacheValid = useSelector(selectIsCacheValid);

  const fetchSongs = useCallback(async (pageNum, isInitial = false) => {
    if (!isInitial) setLoadingMore(true);

    const isCurrentPageCached = isPageCached && cachedPageData && isCacheValid;
    
    if (isCurrentPageCached) {
      if (cachedPageData.songs) {
        if (isInitial) {
          setSongs(cachedPageData.songs);
        } else {
          setSongs(prev => {
            const seen = new Set(prev.map(s => s._id));
            const newSongs = cachedPageData.songs.filter(s => !seen.has(s._id));
            return [...prev, ...newSongs];
          });
        }
      }
    } else {
      try {
        const result = await dispatch(fetchAllSongs({ 
          type, 
          page: pageNum, 
          limit 
        }));
        
        if (result.payload?.songs) {
          if (isInitial) {
            setSongs(result.payload.songs);
          } else {
            setSongs(prev => {
              const seen = new Set(prev.map(s => s._id));
              const newSongs = result.payload.songs.filter(s => !seen.has(s._id));
              return [...prev, ...newSongs];
            });
          }
          
          dispatch(setCachedData({
            page: pageNum,
            songs: result.payload.songs,
            pagination: result.payload.pagination || { 
              page: pageNum, 
              limit, 
              total: result.payload.total || 0, 
              totalPages: Math.ceil((result.payload.total || 0) / limit) || 1
            }
          }));
        }
      } catch (error) {
        console.error(`Error fetching ${type} songs:`, error);
      }
    }
    
    setLoadingMore(false);
  }, [dispatch, type, limit, isPageCached, cachedPageData, isCacheValid]);

  useEffect(() => {
    if (!initialFetchDone) {
      fetchSongs(page, true);
      setInitialFetchDone(true);
    }
  }, [fetchSongs, page, initialFetchDone]);

  useEffect(() => {
    if (initialFetchDone && page > 1) {
      fetchSongs(page, false);
    }
  }, [fetchSongs, page, initialFetchDone]);

  const loadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages && !loadingMore) {
      setPage(prev => prev + 1);
    }
  }, [page, pagination, loadingMore]);

  return {
    songs,
    loading: status === "loading" && songs.length === 0,
    loadingMore,
    pagination,
    loadMore,   // ✅ Infinite scroll trigger karega
    hasMore: pagination ? page < pagination.totalPages : false
  };
};
