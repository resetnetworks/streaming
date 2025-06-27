import React, { useCallback } from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectIsSongLiked } from "../../features/auth/authSelectors";
import { toast } from "sonner";
import debounce from "lodash.debounce";
const handleFeatureSoon = ()=>{
  toast.success("this feature will available soon")
}

const SongList = ({
  img,
  songName,
  singerName,
  seekTime,
  isSelected,
  onPlay,
  songId,
}) => {
  const dispatch = useDispatch();
  const isLiked = useSelector(selectIsSongLiked(songId));

  const handleClick = (e) => {
    if (!e.target.closest(".action-button")) {
      onPlay();
    }
  };

  // ✅ Debounced like toggle
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
    }, 500), // 500ms debounce
    []
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
        <div className="mx-4 max-w-[160px]">
          <h3 className="text-white text-lg leading-none truncate">
            {songName}
          </h3>
          <p className="text-gray-400 text-xs font-light mt-1 truncate">
            {singerName}
          </p>
        </div>
      </div>

      {isSelected ? (
        <div className="equalizer">
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
        </div>
      ) : (
        <div></div>
      )}

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

        <FiMoreHorizontal className="action-button text-white text-lg hover:cursor-pointer" onClick={handleFeatureSoon}/>
      </div>
    </div>
  );
};

export default SongList;
