// GenreSongRow.jsx
import React, { useCallback } from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { RiPlayFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { toast } from "sonner";
import debounce from "lodash.debounce";

const btnBase =
  "action-button inline-flex items-center justify-center text-[10px] sm:text-xs h-7 w-[96px] px-2.5 rounded font-semibold leading-[14px] whitespace-nowrap disabled:bg-gray-600 transition-colors";

const AccessChip = ({
  song,
  purchased,
  alreadySubscribed,
  onSubscribeRequired,
  onPurchaseClick,
  processingPayment,
  paymentLoading,
}) => {
  if (purchased) {
    return <span className={`${btnBase} bg-emerald-600/80 text-white`}>Purchased</span>;
  }

  if (song.accessType === "subscription") {
    return (
      <button
        type="button"
        className={`${btnBase} bg-indigo-600 hover:bg-indigo-700 text-white`}
        onClick={(e) => {
          e.stopPropagation();
          onSubscribeRequired?.(song.artist, "play", song);
        }}
        disabled={processingPayment || paymentLoading}
      >
        Subscription
      </button>
    );
  }

  if (song.accessType === "purchase-only" && song.price > 0 && !purchased) {
    return (
      <button
        type="button"
        className={`${btnBase} bg-rose-600 hover:bg-rose-700 text-white`}
        onClick={(e) => {
          e.stopPropagation();
          if (processingPayment || paymentLoading) return;
          if (alreadySubscribed) {
            onPurchaseClick?.(song, "song"); // open Razorpay directly
          } else {
            onSubscribeRequired?.(song.artist, "purchase", song);
          }
        }}
      >
        Buy ₹{song.price}
      </button>
    );
  }

  if (song.accessType === "purchase-only" && song.price === 0) {
    return <span className={`${btnBase} bg-slate-600/80 text-white`}>Album</span>;
  }

  return <span className={`${btnBase} bg-teal-600/80 text-white`}>Free</span>;
};

const GenreSongRow = ({
  song,
  img = song.coverImage || song.album?.coverImage || "/images/placeholder.png",
  songName = song.title,
  singerName = song.artist?.name || "Unknown",
  seekTime,
  isSelected,
  onPlay,
  onSubscribeRequired,
  onPurchaseClick, // expects (item, "song")
  processingPayment,
  paymentLoading,
  purchased,
  alreadySubscribed,
}) => {
  const dispatch = useDispatch();
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = likedSongIds.includes(song._id);

  const debouncedLikeToggle = useCallback(
    debounce(async (songId, wasLiked) => {
      try {
        const resultAction = await dispatch(toggleLikeSong(songId));
        if (toggleLikeSong.fulfilled.match(resultAction)) {
          toast.success(wasLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
        } else {
          toast.error("Failed to update like");
        }
      } catch {
        toast.error("Something went wrong");
      }
    }, 400),
    [dispatch]
  );

  const handleToggleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!song?._id) return;
    debouncedLikeToggle(song._id, isLiked);
  };

  const handleRowClick = (e) => {
    if (e.target.closest(".action-button")) return;
    onPlay?.(song);
  };

  return (
    <div
      className={`flex w-full justify-between items-center p-2 cursor-pointer border-b ${
        isSelected ? "border-blue-500 bg-white/5" : "border-gray-700"
      } hover:bg-white/5 transition-colors group`}
      onClick={handleRowClick}
    >
      {/* Left */}
      <div className="flex items-center min-w-0">
        <div className="relative">
          <img
            src={img}
            alt={songName}
            className={`w-10 h-10 rounded-lg object-cover ${
              isSelected ? "shadow-[0_0_6px_1px_#3b82f6]" : ""
            }`}
          />
          <button
            type="button"
            className="action-button absolute -bottom-1 -right-1 bg-gray-200 text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(song);
            }}
            title="Play"
            aria-label="Play"
          >
            <RiPlayFill size={12} />
          </button>
        </div>
        <div className="mx-4 min-w-0">
          <h3 className="text-white text-sm truncate">{songName}</h3>
          <p className="text-gray-400 text-xs truncate">{singerName}</p>
        </div>
      </div>

      {/* Middle */}
      {isSelected ? (
        <div className="equalizer mr-2">
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
        </div>
      ) : (
        <div />
      )}

      {/* Right */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center text-gray-300">
          <MdAccessTimeFilled className="text-base text-gray-500" />
          <span className="ml-2 text-sm">{seekTime}</span>
        </div>

        <button type="button" className="action-button" onClick={handleToggleLike}>
          {isLiked ? (
            <BsHeartFill className="text-red-600" />
          ) : (
            <BsHeart className="text-white" />
          )}
        </button>

        <FiMoreHorizontal
          className="action-button text-white text-lg"
          onClick={(e) => {
            e.stopPropagation();
            toast.info("More options coming soon");
          }}
          title="More"
          aria-label="More options"
        />

        <AccessChip
          song={song}
          purchased={purchased}
          alreadySubscribed={alreadySubscribed}
          onSubscribeRequired={onSubscribeRequired}
          onPurchaseClick={onPurchaseClick}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
        />
      </div>
    </div>
  );
};

export default GenreSongRow;
