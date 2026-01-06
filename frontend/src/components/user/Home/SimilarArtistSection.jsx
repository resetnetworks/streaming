import React, { useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

import RecentPlays from "../RecentPlays";
import { setSelectedSong, play } from "../../../features/playback/playerSlice";
import { handlePlaySong } from "../../../utills/songHelpers";
import {
  selectRandomArtist,
  selectRandomArtistSongs,
} from "../../../features/artists/artistsSelectors";

const SimilarArtistSection = ({ 
  onPurchaseClick, 
  onSubscribeRequired, 
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const randomArtist = useSelector(selectRandomArtist);
  const similarSongs = useSelector(selectRandomArtistSongs);

  // updated to support both directions
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

  const getSongPriceDisplay = (song) => {
    if (song.accessType === "purchase-only") {
      if (currentUser?.purchasedSongs?.includes(song._id)) {
        return "Purchased";
      }
      return (
        <button
          className={`text-white text-xs px-2 py-1 rounded transition-colors ${
            processingPayment || paymentLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          onClick={() => onPurchaseClick(song, "song")}
          disabled={processingPayment || paymentLoading}
          type="button"
        >
          {processingPayment || paymentLoading ? "..." : `Buy for ₹${song.price}`}
        </button>
      );
    }
    return "Subs..";
  };

  if (!randomArtist) {
    return (
      <>
        <div className="flex md:gap-2 gap-4 items-center">
          <Skeleton circle width={48} height={48} />
          <div className="flex flex-col gap-1">
            <Skeleton width={80} height={14} />
            <Skeleton width={100} height={18} />
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]">
          {[...Array(10)].map((_, idx) => (
            <div
              key={`similar-skeleton-${idx}`}
              className="w-[160px] flex flex-col gap-2 skeleton-wrapper"
            >
              <Skeleton height={160} width={160} className="rounded-xl" />
              <Skeleton width={100} height={12} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex md:gap-2 gap-4 items-center">
        <img
          src={
            randomArtist?.profileImage ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqfAcDALkSsCqPtfyFv69i8j0k_ZXVBM-Juw&s"
          }
          alt={randomArtist.name}
          className="md:w-12 md:h-12 w-8 h-8 object-cover rounded-full border-blue-800 border shadow-[0_0_5px_1px_#3b82f6]"
        />
        <div>
          <h2 className="text-blue-400 text-base leading-none">explore more</h2>
          <p
            onClick={() => navigate(`/artist/${randomArtist.slug}`)}
            className="text-lg leading-none text-white hover:underline cursor-pointer"
          >
            {randomArtist.name}
          </p>
        </div>

        {/* Back and Next buttons (desktop) */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
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

      {similarSongs.length === 0 ? (
        <p className="text-gray-400 italic">No songs available for this artist.</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
        >
          {similarSongs.map((song) => (
            <RecentPlays
              key={song._id}
              title={song.title}
              price={getSongPriceDisplay(song)}
              singer={song.singer}
              image={song.coverImage || "/images/placeholder.png"}
              onPlay={() => onPlaySong(song)}
              isSelected={selectedSong?._id === song._id}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default SimilarArtistSection;
