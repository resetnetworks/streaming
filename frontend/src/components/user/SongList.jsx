import React, { useState, useRef } from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useLikeSong, useLikedSongs } from "../../hooks/api/useSongs";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addToQueue, playNext } from "../../features/playback/playerSlice";
import { formatDuration } from "../../utills/helperFunctions";
import ShareDropdown from "./ShareDropdown";

const SongList = ({
  img,
  songName,
  singerName,
  seekTime,
  isSelected,
  onTitleClick,
  onPlay,
  songId,
  songSlug,
  artistSlug,
  albumSlug,
  shareUrl,
  currentUser,
  isShareDropdownOpen,
  onShareDropdownToggle,
  onShareMenuClose,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── triggerRef: points at the ⋯ button so PortalDropdown can anchor to it ──
  const triggerRef = useRef(null);

  const [localOpen, setLocalOpen] = useState(false);
  const controlled = isShareDropdownOpen !== undefined;
  const isOpen = controlled ? isShareDropdownOpen : localOpen;

  const likeMutation = useLikeSong();
  const { data } = useLikedSongs(20);
  const likedSongs = data?.pages.flatMap((p) => p.songs) || [];
  const isLiked = likedSongs.some((s) => s._id === songId);

  const handleClose = () => {
    if (controlled) onShareMenuClose?.();
    else setLocalOpen(false);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (controlled) onShareDropdownToggle?.();
    else setLocalOpen((prev) => !prev);
  };

  const handleClick = (e) => {
    if (!e.target.closest(".action-btn")) onPlay();
  };

  const handleTitleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onTitleClick?.();
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUser) return toast.error("Login required to like songs");
    likeMutation.mutate(songId, {
      onSuccess: () =>
        toast.success(isLiked ? "Removed from Liked Songs" : "Added to Liked Songs"),
      onError: () => toast.error("Failed to update like"),
    });
  };

  const handleAddToQueue = () => {
    dispatch(
      addToQueue({
        _id: songId,
        title: songName,
        artist: singerName,
        coverImage: img,
        duration: seekTime,
        artistSlug,
        albumSlug,
      })
    );
    toast.success("Added to queue");
  };

  const handlePlayNext = () => {
    dispatch(
      playNext({
        _id: songId,
        title: songName,
        artist: singerName,
        coverImage: img,
        duration: seekTime,
        artistSlug,
        albumSlug,
      })
    );
    toast.success("Will play next");
  };

  return (
    <div
      className={`flex w-full justify-between p-2 cursor-pointer relative ${
        isSelected ? "border-b border-blue-500" : "border-b border-gray-600"
      }`}
      onClick={handleClick}
    >
      {/* Left: thumbnail + title */}
      <div className="flex items-center">
        <img
          src={img}
          alt=""
          className={`w-10 h-10 rounded-lg object-cover ${
            isSelected ? "shadow-[0_0_5px_1px_#3b82f6]" : ""
          }`}
        />
        <div className="mx-4 max-w-[160px] md:max-w-[300px] lg:max-w-[400px]">
            <h3 className="text-white text-lg leading-none sm:truncate">
              <span className="block sm:hidden">
                {songName.length > 12 ? songName.slice(0, 7) + "..." : songName}
              </span>
              <span className="hidden sm:block">{songName}</span>
            </h3>
        </div>
      </div>

      {/* Right: duration + like + options */}
      <div className="flex gap-6 ml-4 items-center">
        <div className="flex items-center">
          <MdAccessTimeFilled
            className={`text-base ${isSelected ? "text-blue-700" : "text-gray-500"}`}
          />
          <span className="ml-2">{formatDuration(seekTime)}</span>
        </div>

        <button
          type="button"
          className="action-btn"
          onClick={handleToggleLike}
          disabled={likeMutation.isLoading}
        >
          {isLiked ? (
            <BsHeartFill className="text-red-600 text-md" />
          ) : (
            <BsHeart className="text-white text-md hover:text-red-700" />
          )}
        </button>

        {/* Options trigger — ref passed to ShareDropdown for portal anchoring */}
        <div className="relative action-btn">
          <button ref={triggerRef} className="action-btn" onClick={handleToggle}>
            <FiMoreHorizontal
              className={`text-lg ${isOpen ? "text-blue-400" : "text-white"}`}
            />
          </button>

          <ShareDropdown
            isOpen={isOpen}
            onClose={handleClose}
            triggerRef={triggerRef}          // ← pass the ref here
            songName={songName}
            singerName={singerName}
            songSlug={songSlug}
            artistSlug={artistSlug}
            albumSlug={albumSlug}
            shareUrl={shareUrl || `${window.location.origin}/song/${songSlug || songId}`}
            onAddToQueue={handleAddToQueue}
            onPlayNext={handlePlayNext}
            isPlayerContext={false}
            navigate={navigate}
            placement="bottom-right"
          />
        </div>
      </div>
    </div>
  );
};

export default SongList;