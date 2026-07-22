import React, { useRef, useState, useCallback, useMemo, useEffect, memo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import { BsSoundwave } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

import MatchingGenreSong from "../MatchingGenreSong";
import { useMatchingGenreSongs } from "../../../hooks/api/useSongs";
import { handlePlaySong } from "../../../utills/songHelpers";

// ─── Memoized outside the parent so React never sees a "new" component type ──
const AlbumCard = memo(({ album, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="min-w-[140px] md:min-w-[160px] mx-1 flex-shrink-0 cursor-pointer group"
      onClick={() => onClick(album)}
    >
      <div className="relative h-32 w-32 md:h-44 md:w-44 rounded-none overflow-hidden bg-gray-700/50">
        {album?.songs[0]?.coverImage && !imageError ? (
          <>
            <img
              src={album.songs[0].coverImage}
              alt=""
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
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
        <div className="absolute top-0 right-2">
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-black backdrop-blur-sm text-blue-300 rounded-sm border-r-2 border-blue-400">
            Album
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-start gap-2">
        <p className="text-white font-medium text-sm truncate">
          {album.title?.length > 12
            ? album.title.slice(0, 12) + "…"
            : album.title || "Untitled"}
        </p>
        <span className="text-gray-200 text-[10px] flex-shrink-0 text-right mt-0.5 max-w-[55px] truncate">
          {album.songs[0]?.artist?.name?.length > 7
            ? album.songs[0].artist.name.slice(0, 7) + "…"
            : album.songs[0]?.artist?.name}
        </span>
      </div>
    </div>
  );
});

// ─── Hook: append-only stable list from infinite query pages ─────────────────
// Returns a stable array that only ever grows — existing items are never
// replaced or re-ordered, so React never unmounts them.
function useStableItems(pages) {
  // albumMap: id → album (with songs array)
  const albumMapRef = useRef(new Map());
  // set of standalone song _ids already added
  const standaloneSeenRef = useRef(new Set());
  // stable ordered arrays (append-only)
  const albumsRef = useRef([]);
  const standaloneRef = useRef([]);

  // We use a counter to trigger re-render only when something new was added
  const [, forceUpdate] = useState(0);

  const processedPageCountRef = useRef(0);

  useEffect(() => {
    if (!pages?.length) return;

    // Only process pages we haven't seen yet
    const newPages = pages.slice(processedPageCountRef.current);
    if (!newPages.length) return;

    let changed = false;

    newPages.forEach((page) => {
      (page.songs || []).forEach((song) => {
        if (song.album?._id) {
          const id = song.album._id;
          if (!albumMapRef.current.has(id)) {
            const albumEntry = { ...song.album, songCount: 1, songs: [song] };
            albumMapRef.current.set(id, albumEntry);
            albumsRef.current = [...albumsRef.current, albumEntry];
            changed = true;
          } else {
            const existing = albumMapRef.current.get(id);
            if (!existing.songs.find((s) => s._id === song._id)) {
              existing.songCount += 1;
              existing.songs.push(song);
              // No re-render needed — same object reference, AlbumCard is already mounted
            }
          }
        } else {
          if (!standaloneSeenRef.current.has(song._id)) {
            standaloneSeenRef.current.add(song._id);
            standaloneRef.current = [...standaloneRef.current, song];
            changed = true;
          }
        }
      });
    });

    processedPageCountRef.current = pages.length;

    if (changed) {
      forceUpdate((n) => n + 1);
    }
  }, [pages?.length]);

  // Reset on demand (returns a reset function)
  const reset = useCallback(() => {
    albumMapRef.current = new Map();
    standaloneSeenRef.current = new Set();
    albumsRef.current = [];
    standaloneRef.current = [];
    processedPageCountRef.current = 0;
    forceUpdate((n) => n + 1);
  }, []);

  return {
    albums: albumsRef.current,
    standalone: standaloneRef.current,
    reset,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const MatchingGenreSection = ({ onSubscribeRequired, onRoleUpdateError }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const currentlyPlayingSong = useSelector((state) => state.player.selectedSong);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useMatchingGenreSongs(10);

  const { albums: displayAlbums, standalone: displayStandalone, reset } = useStableItems(
    data?.pages
  );

  // Reset when user changes
  const prevUserIdRef = useRef(currentUser?._id);
  useEffect(() => {
    if (prevUserIdRef.current !== currentUser?._id) {
      prevUserIdRef.current = currentUser?._id;
      reset();
    }
  }, [currentUser?._id, reset]);

  const matchingGenres = useMemo(
    () => data?.pages?.[0]?.matchingGenres ?? [],
    [data]
  );

  const handleAlbumClick = useCallback(
    (album) => {
      navigate(`/album/${album._id}`, {
        state: { album, songs: album.songs },
      });
    },
    [navigate]
  );

  const onPlaySong = useCallback(
    (song) => {
      const result = handlePlaySong(song, currentUser, null);
      if (result.requiresSubscription) {
        onSubscribeRequired?.(song.artist, "play", song);
        toast.error("Subscribe to play this song!");
      }
    },
    [currentUser, onSubscribeRequired]
  );

  const handleScrollArrows = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "right" ? 200 : -200,
      behavior: "smooth",
    });
  };

  const onHorizontalScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    if (
      scrollLeft + clientWidth >= scrollWidth - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, rootMargin: "200px", threshold: 0.1 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ─── Early returns ──────────────────────────────────────────────────────
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

  if (isError) {
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

  if (isLoading) {
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
            <h2 className="md:text-xl text-lg font-semibold text-white">Created For You</h2>
            <p className="text-gray-400 text-sm">
              Based on your music taste •{" "}
              {matchingGenres?.slice(0, 3).join(", ") || "Loading..."}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => handleScrollArrows("left")}
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-all"
            type="button"
          >
            <LuSquareChevronLeft />
          </button>
          <button
            onClick={() => handleScrollArrows("right")}
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

      {/* Scrollable Content */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
          onScroll={onHorizontalScroll}
        >
          {displayAlbums.map((album) => (
            <AlbumCard
              key={album._id}
              album={album}
              onClick={handleAlbumClick}
            />
          ))}

          {displayStandalone.map((song) => (
            <MatchingGenreSong
              key={song._id}
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
          ))}

          {isFetchingNextPage && (
            <div className="flex-shrink-0 flex items-center justify-center min-w-[100px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}

          <div ref={sentinelRef} className="w-1 h-1 flex-shrink-0" />
        </div>
      </div>
    </section>
  );
};

export default MatchingGenreSection;