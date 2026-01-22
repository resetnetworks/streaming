import React, { useCallback } from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { toast } from "sonner";
import debounce from "lodash.debounce";

const handleFeatureSoon = () => {
  toast.success("This feature will be available soon");
};

const SongList = ({
  img,
  songName,
  singerName,
  seekTime,
  isSelected,
  onTitleClick, // ✅ ADD THIS PROP
  onPlay,
  songId,
}) => {
  const dispatch = useDispatch();

  // ✅ Get the liked song IDs just once
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = likedSongIds.includes(songId);

  const handleClick = (e) => {
    if (!e.target.closest(".action-button")) {
      onPlay();
    }
  };

  // ✅ ADD TITLE CLICK HANDLER
  const handleTitleClick = (e) => {
    e.stopPropagation(); // Prevent triggering onPlay
    e.preventDefault();
    if (onTitleClick) {
      onTitleClick();
    }
  };

  const debouncedLikeToggle = useCallback(
    debounce(async (songId, wasLiked) => {
      try {
        const resultAction = await dispatch(toggleLikeSong(songId));
        if (toggleLikeSong.fulfilled.match(resultAction)) {
          toast.success(
            wasLiked ? "Removed from Liked Songs" : "Added to Liked Songs"
          );
        } else if (toggleLikeSong.rejected.match(resultAction)) {
          toast.error(resultAction.payload || "Failed to update like");
        }
      } catch (err) {
        toast.error("Something went wrong");
      }
    }, 500),
    [dispatch]
  );

  const handleToggleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    debouncedLikeToggle(songId, isLiked);
  };

  return (
    <div
      className={`flex w-full justify-between p-2 cursor-pointer ${
        isSelected ? "border-b border-blue-500" : "border-b border-gray-600"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <img
          src={img}
          alt=""
          className={`w-10 h-10 rounded-lg object-cover ${
            isSelected ? "shadow-[0_0_5px_1px_#3b82f6]" : ""
          }`}
        />
        <div className="mx-4 max-w-[160px] md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
          {/* ✅ MAKE SONG TITLE CLICKABLE */}
          <button
            onClick={handleTitleClick}
            className="text-left w-full"
          >
            <h3 className="text-white text-lg leading-none sm:truncate">
              <span className="block sm:hidden hover:underline">
                {songName.length > 12 ? songName.slice(0, 7) + "..." : songName}
              </span>
              <span className="hidden sm:block hover:underline">{songName}</span>
            </h3>
          </button>

          <p className="text-gray-400 text-xs font-light mt-1 truncate">
            {singerName}
          </p>
        </div>
      </div>

      {/* {isSelected ? (
        <div className="equalizer">
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
        </div>
      ) : (
        <div></div>
      )} */}

      <div className="flex gap-6 ml-4 items-center">
        <div className="flex items-center">
          <MdAccessTimeFilled
            className={`text-base ${
              isSelected ? "text-blue-700" : "text-gray-500"
            }`}
          />
          <span className="ml-2">{seekTime}</span>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleToggleLike}
        >
          {isLiked ? (
            <BsHeartFill className="text-red-600 text-md" />
          ) : (
            <BsHeart className="text-white text-md hover:text-red-700" />
          )}
        </button>

        <FiMoreHorizontal
          className="action-button text-white text-lg hover:cursor-pointer"
          onClick={handleFeatureSoon}
        />
      </div>
    </div>
  );
};

export default SongList;
