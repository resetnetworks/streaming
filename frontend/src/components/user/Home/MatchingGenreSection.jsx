import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LuSquareChevronRight, LuSquareChevronLeft } from 'react-icons/lu';
import { BsSoundwave } from "react-icons/bs";
import Skeleton from 'react-loading-skeleton';
import { toast } from "sonner";

import MatchingGenreSong from '../MatchingGenreSong';
import { 
  fetchSongsMatchingUserGenres,
  setMatchingGenreCachedData 
} from '../../../features/songs/songSlice';
import { 
  selectMatchingGenreSongs,
  selectMatchingGenres,
  selectSongsStatus,
  selectIsMatchingGenreCacheValid,
  selectIsMatchingGenrePageCached,
  selectMatchingGenreCachedPageData,
  selectMatchingGenrePagination
} from '../../../features/songs/songSelectors';

import { handlePlaySong } from "../../../utills/songHelpers";

// Album Card Component
const AlbumCard = ({ album, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="min-w-[140px] md:min-w-[160px] mx-1 flex-shrink-0 cursor-pointer group"
      onClick={() => onClick(album)}
    >
      {/* Cover - same size as MatchingGenreSong */}
      <div className="relative h-32 w-32 md:h-44 md:w-44 rounded-lg overflow-hidden bg-gray-700/50">
        {album?.songs[0]?.coverImage && !imageError ? (
          <>
            <img
              src={album.songs[0].coverImage}
              alt=""
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-700/50 animate-pulse flex items-center justify-center">
                <BsSoundwave className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <BsSoundwave className="w-10 h-10 text-gray-400" />
          </div>
        )}

        {/* Album tag */}
        <div className="absolute top-0 right-2">
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-black backdrop-blur-sm text-blue-300 rounded-sm border-r-2 border-blue-400">
            Album
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 flex justify-between items-start gap-2">
        <p className="text-white font-medium text-sm truncate">
          {album.title?.length > 12 ? album.title.slice(0, 12) + "…" : album.title || "Untitled"}
        </p>
        <span className="text-gray-200 text-[10px] flex-shrink-0 text-right mt-0.5 max-w-[55px] truncate">
          {album.songs[0]?.artist?.name?.length > 7
            ? album.songs[0].artist.name.slice(0, 7) + "…"
            : album.songs[0]?.artist?.name}
        </span>
      </div>
    </div>
  );
};

const MatchingGenreSection = ({ 
  onSubscribeRequired,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Keep a stable, append-only merged list to avoid blinking
  const [merged, setMerged] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Preserve scroll position across renders/appends
  const pendingScrollLeftRef = useRef(null);

  // Current page and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const matchingGenres = useSelector(selectMatchingGenres);
  const status = useSelector(selectSongsStatus);
  const pagination = useSelector(selectMatchingGenrePagination);

  const currentUser = useSelector((state) => state.auth.user);
  const currentlyPlayingSong = useSelector((state) => state.player.selectedSong);

  const isCacheValid = useSelector(selectIsMatchingGenreCacheValid);
  const isPageCached = useSelector(selectIsMatchingGenrePageCached(currentPage));
  const cachedPageData = useSelector(selectMatchingGenreCachedPageData(currentPage));

  // Process data to extract unique albums
  const uniqueAlbums = useMemo(() => {
    const albumMap = new Map();
    
    merged.forEach(song => {
      if (song.album && song.album._id) {
        const albumId = song.album._id;
        if (!albumMap.has(albumId)) {
          albumMap.set(albumId, {
            ...song.album,
            songCount: 1,
            songs: [song]
          });
        } else {
          const existingAlbum = albumMap.get(albumId);
          existingAlbum.songCount += 1;
          existingAlbum.songs.push(song);
        }
      }
    });
    
    return Array.from(albumMap.values());
  }, [merged]);

  // Handle album click navigation
  const handleAlbumClick = (album) => {
    navigate(`/album/${album._id}`, { 
      state: { 
        album: album,
        songs: album.songs 
      } 
    });
  };


  // Unique by _id helper
  const mergeUnique = useCallback((prev, next) => {
    const seen = new Set(prev.map(s => s._id));
    const out = [...prev];
    for (const s of next) {
      if (!seen.has(s._id)) {
        seen.add(s._id);
        out.push(s);
      }
    }
    return out;
  }, []);

  // Load a page with cache awareness
  const loadPage = useCallback(async (page) => {
    if (!currentUser) return;
    if (pageLoaded.has(page)) return;
    setLoadingMore(true);

    try {
      if (isPageCached && isCacheValid && cachedPageData && page === currentPage && hasInitialLoad) {
        const fromCache = cachedPageData.songs || [];
        setMerged(prev => mergeUnique(prev, fromCache));
        setPageLoaded(prev => new Set(prev).add(page));
        setLoadingMore(false);
        return;
      }

      const result = await dispatch(fetchSongsMatchingUserGenres({ page, limit })).unwrap();

      dispatch(setMatchingGenreCachedData({
        page,
        songs: result.songs,
        pagination: result.pagination,
        matchingGenres: result.matchingGenres
      }));

      setMerged(prev => mergeUnique(prev, result.songs));
      setPageLoaded(prev => new Set(prev).add(page));
      setHasInitialLoad(true);
    } catch (error) {
      toast.error(`Failed to load songs: ${error}`);
    } finally {
      setLoadingMore(false);
    }
  }, [
    currentUser,
    pageLoaded,
    isPageCached,
    isCacheValid,
    cachedPageData,
    currentPage,
    hasInitialLoad,
    dispatch,
    limit,
    mergeUnique
  ]);

  // Initial load
  useEffect(() => {
    setMerged([]);
    setPageLoaded(new Set());
    setCurrentPage(1);
    setHasInitialLoad(false);
  }, [currentUser._id]);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  // Preserve scrollLeft around merges
  useEffect(() => {
    if (!scrollRef.current) return;
    if (pendingScrollLeftRef.current == null) return;
    const target = pendingScrollLeftRef.current;
    pendingScrollLeftRef.current = null;
    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollLeft = target;
    });
  }, [merged]);

  const onPlaySong = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      onSubscribeRequired?.(song.artist, "play", song);
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch, onSubscribeRequired]);

  const handleScrollArrows = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  // IntersectionObserver for infinite load (sentinel)
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const root = scrollRef.current || null;

    const io = new IntersectionObserver(
      (entries) => {
        const last = entries[0];
        if (last.isIntersecting && !loadingMore && pagination && currentPage < (pagination.totalPages || Infinity)) {
          if (scrollRef.current) {
            pendingScrollLeftRef.current = scrollRef.current.scrollLeft;
          }
          setCurrentPage(p => p + 1);
        }
      },
      {
        root,
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [loadingMore, pagination, currentPage]);

  // Also support manual infinite load via scroll end
  const onHorizontalScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    const nearEnd = scrollLeft + clientWidth >= scrollWidth - 10;
    if (nearEnd && !loadingMore && pagination && currentPage < (pagination.totalPages || Infinity)) {
      pendingScrollLeftRef.current = scrollLeft;
      setCurrentPage(p => p + 1);
    }
  };

  // Loading skeleton for very first load only
  if (!currentUser) {
    return (
      <div className="w-full py-0">
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/30 rounded-xl p-6 text-center backdrop-blur-sm">
          <div className="text-white text-lg font-semibold mb-2">AI Personalized Music</div>
          <p className="text-gray-400">Please log in to see personalized song recommendations</p>
        </div>
      </div>
    );
  }

  if (status === 'failed' && !hasInitialLoad) {
    return (
      <div className="w-full py-6">
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6 text-center backdrop-blur-sm">
          <h3 className="text-red-400 text-lg font-semibold mb-2">Failed to Load</h3>
          <p className="text-gray-400 mb-4">Unable to fetch personalized recommendations</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if ((status === 'loading' && !hasInitialLoad) || (merged.length === 0 && status === 'loading')) {
    return (
      <section className="w-full py-0">
        <div className="w-full flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg" />
            <div>
              <Skeleton width={200} height={24} baseColor="#1a2238" highlightColor="#243056" />
              <Skeleton width={150} height={16} baseColor="#1a2238" highlightColor="#243056" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, idx) => (
            <div key={`matching-skeleton-${idx}`} className="flex-shrink-0">
              <Skeleton 
                height={240} 
                width={180} 
                className="rounded-xl" 
                baseColor="#1a2238"
                highlightColor="#243056"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full py-0">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg backdrop-blur-md border border-white/10">
              <img
                src={`${window.location.origin}/icon.png`}
                alt="AI Recommendations"
                className="w-6 h-6"
              />
            </div>
            <div>
              <h2 className="md:text-xl text-lg font-semibold text-white">
                Created For You
              </h2>
              <p className="text-gray-400 text-sm">
                Based on your music taste • {matchingGenres?.slice(0, 3).join(', ') || 'Loading...'}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleScrollArrows('left')}
              className="text-white cursor-pointer text-lg hover:text-blue-400 transition-all"
              type="button"
            >
              <LuSquareChevronLeft />
            </button>
            <button
              onClick={() => handleScrollArrows('right')}
              className="text-white cursor-pointer text-lg hover:text-blue-400 transition-all"
              type="button"
            >
              <LuSquareChevronRight />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-6">
          <BsSoundwave className="text-blue-400 text-lg animate-pulse" />
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 via-indigo-500/50 to-blue-500/30" />
          <BsSoundwave className="text-blue-400 text-lg animate-pulse" />
        </div>

        {/* Albums Display */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar"
            style={{ scrollSnapType: "x mandatory" }}
            onScroll={onHorizontalScroll}
          >
            {uniqueAlbums.map((album, index) => (
              <AlbumCard
                key={`album-${album._id}-${index}`}
                album={album}
                onClick={handleAlbumClick}
              />
            ))}

            {/* Show individual songs that don't belong to any album */}
            {merged.filter(song => !song.album || !song.album._id).map((song, index) => (
              
              <MatchingGenreSong
                key={`matching-song-${song._id}-${index}`}
                title={song.title}
                songId={song._id}
                artist={song.artist}
                album={song.album}
                image={song.coverImage || song.album?.coverImage}
                duration={song.duration}
                onPlay={() => onPlaySong(song)}
                isPlaying={currentlyPlayingSong?._id === song._id}
                isSelected={currentlyPlayingSong?._id === song._id}
              />
            )) }

            {/* Loading spinner while appending more */}
            {loadingMore && (
              <div className="flex-shrink-0 flex items-center justify-center min-w-[100px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} className="w-1 h-1" />
          </div>
        </div>
      </section>
    </>
  );
};

export default MatchingGenreSection;
