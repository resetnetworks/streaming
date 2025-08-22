import React, { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuSquareChevronRight } from "react-icons/lu";
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
  } = useSongCache("recent", { limit: 20 }); // ✅ default 20 songs per page

  // ✅ Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore   // ✅ fix: ab naya data fetch hoga
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
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
      <div className="w-full flex justify-between items-center">
        <h2 className="md:text-xl text-lg font-semibold">new tracks</h2>
        <LuSquareChevronRight
          className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
          onClick={handleScroll}
        />
      </div>
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
                ref={idx === recentSongs.length - 1 ? lastElementRef : null} // ✅ last element observe hoga
                key={song._id}
                title={song.title}
                price={getSongPriceDisplay(song, currentUser, onPurchaseClick, processingPayment, paymentLoading)}
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
const getSongPriceDisplay = (song, currentUser, onPurchaseClick, processingPayment, paymentLoading) => {
  if (currentUser?.purchasedSongs?.includes(song._id)) {
    return "Purchased";
  }
  
  if (song.accessType === "subscription") {
    return "Subs..";
  }
  
  if (song.accessType === "purchase-only" && song.price > 0) {
    return (
      <button
        className={`text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 rounded transition-colors ${
          processingPayment || paymentLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        onClick={() => onPurchaseClick(song, "song")}
        disabled={processingPayment || paymentLoading}
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
