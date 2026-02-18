// src/components/user/Home/AllTracksSection.jsx
import React, { useRef, useCallback, useState, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SongList from "../SongList";
import { handlePlaySong } from "../../../utills/songHelpers";
import { formatDuration } from "../../../utills/helperFunctions";
import { useAllSingles } from "../../../hooks/api/useSongs";

const AllTracksSection = ({ 
  onSubscribeRequired,
  onPurchaseClick,
  processingPayment,
  paymentLoading
}) => {
  const scrollRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ React Query hook for singles
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error
  } = useAllSingles(20);


  // ✅ Flatten all singles from all pages
  const allSingles = data?.pages?.flatMap(page => page.songs) || [];
  
  // ✅ Get pagination info from last page
  const lastPage = data?.pages?.[data.pages.length - 1];
  const singlesPagination = lastPage?.pagination || { page: 1, totalPages: 1 };

  // ✅ Track active song share dropdown
  const [activeSongShareDropdown, setActiveSongShareDropdown] = useState(null);

  // ✅ Handle song share dropdown toggle
  const handleSongShareDropdownToggle = (songId) => {
    setActiveSongShareDropdown(prev => prev === songId ? null : songId);
  };

  // ✅ Load more singles function
  const loadMoreSingles = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  // ✅ Intersection observer for infinite scroll
  const lastElementRef = useCallback((node) => {
    if (isLoading || isFetchingNextPage) return;
    
    if (node) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            loadMoreSingles();
          }
        },
        { threshold: 0.5 }
      );
      
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [isLoading, isFetchingNextPage, hasNextPage, loadMoreSingles]);

  // Handle scroll buttons
  const handleScroll = useCallback((direction = "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Handle play song
  const onPlaySong = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      onSubscribeRequired(song.artist, "play", song);
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch, onSubscribeRequired]);

  // ✅ Show error toast if fetch fails
  useEffect(() => {
    if (isError && error) {
      toast.error(error.message || "Failed to load singles");
    }
  }, [isError, error]);

  // Grid columns for horizontal scroll
  const chunkSize = 5;
  const dataColumns = [];
  for (let i = 0; i < allSingles.length; i += chunkSize) {
    dataColumns.push(allSingles.slice(i, i + chunkSize));
  }

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <h2 className="md:text-xl text-lg font-semibold">
          trending singles
        </h2>

        {/* Back and Next buttons (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            title="Back"
          >
            <LuSquareChevronLeft />
          </button>
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            title="Next"
          >
            <LuSquareChevronRight />
          </button>
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar min-h-[280px]"
      >
        <div className="flex md:gap-8 gap-16">
          {/* ✅ Initial loading skeletons */}
          {isLoading && !allSingles.length && (
            [...Array(5)].map((_, idx) => (
              <div
                key={`singles-skeleton-${idx}`}
                className="flex flex-col gap-4 min-w-[400px]"
              >
                {[...Array(5)].map((__, i) => (
                  <div
                    key={`skeleton-item-${i}`}
                    className="flex items-center gap-4 skeleton-wrapper"
                  >
                    <Skeleton height={50} width={50} className="rounded-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton width={120} height={14} />
                      <Skeleton width={80} height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          {/* ✅ Render singles columns */}
          {!isLoading && dataColumns.map((column, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              ref={columnIndex === dataColumns.length - 1 ? lastElementRef : null}
              className="flex flex-col gap-4 min-w-[400px]"
            >
              {column.map((single) => (
                <SongList
                  onTitleClick={() => navigate(`/song/${single?.slug}`)}
                  key={single._id}
                  songSlug={single?.slug}
                  songId={single._id}
                  img={single.coverImage || "/images/placeholder.png"}
                  songName={single.title}
                  singerName={single.singer}
                  seekTime={formatDuration(single.duration)}
                  onPlay={() => onPlaySong(single)}
                  isSelected={selectedSong?._id === single._id}
                  shareUrl={`${window.location.origin}/song/${single?.slug || single._id}`}
                  isShareDropdownOpen={activeSongShareDropdown === single._id}
                  onShareDropdownToggle={() => handleSongShareDropdownToggle(single._id)}
                  onShareMenuClose={() => setActiveSongShareDropdown(null)}
                />
              ))}
            </div>
          ))}

          {/* ✅ Loading more indicator */}
          {isFetchingNextPage && (
            <div className="flex flex-col gap-4 min-w-[400px]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`loading-more-${i}`}
                  className="flex items-center gap-4 skeleton-wrapper"
                >
                  <Skeleton height={50} width={50} className="rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={12} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Empty state */}
          {!isLoading && !isFetching && allSingles.length === 0 && (
            <div className="min-w-[400px] flex items-center justify-center py-8">
              <p className="text-gray-400 text-center">
                No singles available at the moment
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllTracksSection;