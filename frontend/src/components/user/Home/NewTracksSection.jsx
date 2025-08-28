import React, { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

import RecentPlays from "../RecentPlays";
import { useSongCache } from "../../../hooks/useSongCache";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { setSelectedSong, play } from "../../../features/playback/playerSlice";
import { handlePlaySong } from "../../../utills/songHelpers";

const NewTracksSection = ({ 
  onPurchaseClick, 
  onSubscribeRequired, 
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);

  const {
    songs: recentSongs,
    loading,
    loadingMore,
    pagination,
    loadMore,
    hasMore
  } = useSongCache("recent", { limit: 20 });

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore
  });

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

  return (
    <>
      {/* Header with Back and Next */}
      <div className="w-full flex justify-between items-center">
        <h2 className="md:text-xl text-lg font-semibold">new tracks</h2>

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

      {/* Row */}
      <div
        ref={scrollRef}
        className="flex sm:gap-4 gap-1 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
      >
        {loading && recentSongs.length === 0
          ? [...Array(10)].map((_, idx) => (
              <div key={`recent-skeleton-${idx}`} className="w-[160px] flex flex-col gap-2 skeleton-wrapper">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={100} height={12} />
              </div>
            ))
          : recentSongs.map((song, idx) => (
              <RecentPlays
                ref={idx === recentSongs.length - 1 ? lastElementRef : null}
                key={song._id}
                title={song.title}
                price={getSongPriceDisplay(
                  song, 
                  currentUser, 
                  onPurchaseClick, 
                  onSubscribeRequired, 
                  processingPayment, 
                  paymentLoading
                )}
                singer={song.singer}
                image={song.coverImage || "/images/placeholder.png"}
                onPlay={() => onPlaySong(song)}
                isSelected={selectedSong?._id === song._id}
              />
            ))}

        {loadingMore && (
          <div className="w-[160px] flex flex-col gap-2 skeleton-wrapper">
            <Skeleton height={160} width={160} className="rounded-xl" />
            <Skeleton width={100} height={12} />
          </div>
        )}
      </div>
    </>
  );
};

// Helper function for price display logic
const getSongPriceDisplay = (
  song, 
  currentUser, 
  onPurchaseClick, 
  onSubscribeRequired, 
  processingPayment, 
  paymentLoading
) => {
  if (currentUser?.purchasedSongs?.includes(song._id)) {
    return "Purchased";
  }

  if (song.accessType === "subscription") {
    return "Subs..";
  }

  if (song.accessType === "purchase-only" && song.price > 0) {
    // Route through onSubscribeRequired so Home decides: subscribe modal or direct purchase
    return (
      <button
        className={`text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 rounded transition-colors ${
          processingPayment || paymentLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSubscribeRequired?.(song.artist, "purchase", song);
        }}
        disabled={processingPayment || paymentLoading}
        type="button"
      >
        {processingPayment || paymentLoading ? "..." : `Buy ₹${song.price}`}
      </button>
    );
  }

  if (song.accessType === "purchase-only" && song.price === 0) {
    return "album";
  }

  return "Free";
};

export default NewTracksSection;
