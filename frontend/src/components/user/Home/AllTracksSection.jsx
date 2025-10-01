// src/components/user/Home/AllTracksSection.jsx
import React, { useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

import SongList from "../SongList";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { handlePlaySong } from "../../../utills/songHelpers";
import { formatDuration } from "../../../utills/helperFunctions";
import { fetchAllSingles } from "../../../features/songs/songSlice";
import { 
  selectAllSingles, 
  selectSinglesPagination, 
  selectSongsStatus,
  selectIsSinglesCached,
  selectIsSinglesCacheValid 
} from "../../../features/songs/songSelectors";

const AllTracksSection = ({ 
  onSubscribeRequired,
  onPurchaseClick,
  processingPayment,
  paymentLoading
}) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);

  // ✅ Singles selectors only
  const allSingles = useSelector(selectAllSingles);
  const singlesPagination = useSelector(selectSinglesPagination);
  const singlesStatus = useSelector(selectSongsStatus);
  const isSinglesCached = useSelector(selectIsSinglesCached);
  const isSinglesCacheValid = useSelector(selectIsSinglesCacheValid);

  // ✅ Fetch singles on component mount if not cached or cache invalid
  useEffect(() => {
    if (!isSinglesCached || !isSinglesCacheValid) {
      dispatch(fetchAllSingles({ page: 1, limit: 20 }));
    }
  }, [dispatch, isSinglesCached, isSinglesCacheValid]);

  // ✅ Load more singles function
  const loadMoreSingles = useCallback(() => {
    if (singlesPagination.page < singlesPagination.totalPages && singlesStatus !== 'loading') {
      dispatch(fetchAllSingles({ 
        page: singlesPagination.page + 1, 
        limit: 20 
      }));
    }
  }, [dispatch, singlesPagination, singlesStatus]);

  // ✅ Singles data and loading states
  const currentData = allSingles;
  const currentLoading = singlesStatus === 'loading' && allSingles.length === 0;
  const currentLoadingMore = singlesStatus === 'loading' && allSingles.length > 0;
  const hasMore = singlesPagination.page < singlesPagination.totalPages;

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    loading: currentLoading || currentLoadingMore,
    onLoadMore: loadMoreSingles
  });

  // Updated: support both directions
  const handleScroll = (direction = "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const onPlaySong = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      onSubscribeRequired(song.artist, "play", song);
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch, onSubscribeRequired]);

  // grid columns
  const chunkSize = 5;
  const dataColumns = [];
  for (let i = 0; i < currentData.length; i += chunkSize) {
    dataColumns.push(currentData.slice(i, i + chunkSize));
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
          {currentLoading
            ? [...Array(5)].map((_, idx) => (
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
            : dataColumns.map((column, columnIndex) => (
                <div
                  key={`column-${columnIndex}`}
                  ref={columnIndex === dataColumns.length - 1 ? lastElementRef : null}
                  className="flex flex-col gap-4 min-w-[400px]"
                >
                  {column.map((single) => (
                    <SongList
                      key={single._id}
                      songId={single._id}
                      img={single.coverImage || "/images/placeholder.png"}
                      songName={single.title}
                      singerName={single.singer}
                      seekTime={formatDuration(single.duration)}
                      onPlay={() => onPlaySong(single)}
                      isSelected={selectedSong?._id === single._id}
                    />
                  ))}
                </div>
              ))}
          
          {currentLoadingMore && (
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

          {/* ✅ Show empty state if no singles available */}
          {!currentLoading && currentData.length === 0 && (
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
