import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setShuffleMode,
  setRepeatMode,
} from "../../features/playback/playerSlice";
import { usePlayer } from "../../hooks/usePlayer";
import { formatDuration } from "../../utills/helperFunctions";
import ShareDropdown from "./ShareDropdown";
import {
  IoIosArrowDown,
  IoMdShuffle,
  IoIosMore,
} from "react-icons/io";
import {
  TbRepeat,
  TbRepeatOnce,
} from "react-icons/tb";
import {
  RiSkipLeftFill,
  RiSkipRightFill,
} from "react-icons/ri";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { BsHeart, BsHeartFill } from "react-icons/bs";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const MobilePlayer = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const shuffleMode = useSelector((state) => state.player.shuffleMode);
  const repeatMode = useSelector((state) => state.player.repeatMode);
  const moreBtnRef = useRef(null);

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);

  const player = usePlayer();
  const {
    videoRef,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    isPlayerLoading,
    streamError,
    isDisplayOnly,
    isPreview,
    isLiked,
    selectedSong,
    playbackError,
    handleTogglePlay,
    handleNext,
    handlePrev,
    handleSeekChange,
    handleLikeToggle,
  } = player;

  useEffect(() => {
    if (isFullPlayerOpen) setIsFullPlayerOpen(false);
  }, [location.pathname]);

  const handleToggleShuffle = () => dispatch(setShuffleMode(!shuffleMode));

  const handleRepeatToggle = () => {
    const modes = ["off", "one", "all"];
    dispatch(setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]));
  };

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY;
    if (delta > 80) setIsFullPlayerOpen(false);
    setTouchStartY(null);
  };

  const progressPercentage =
    duration && !isNaN(duration) && !isNaN(currentTime)
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  const showPreviewBadge = isPreview || isDisplayOnly;
  const hasStreamError = streamError?.songId === selectedSong?._id;

  if (!currentSong) return null;

  return (
    <>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        muted={isMuted}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Mini Player */}
      <div
        className="md:hidden fixed cursor-pointer bottom-16 left-0 right-0 z-40 bg-gradient-to-bl from-blue-900 to-black border-t border-b border-gray-800"
        onClick={() => setIsFullPlayerOpen(true)}
      >
        <div
          className="h-1 from-black to-blue-600 bg-gradient-to-br transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />

        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0 w-12 h-12">
                <img
                  src={currentSong?.coverImage}
                  className={`w-12 h-12 rounded-sm shadow-[0_0_5px_1px_#3b82f6] ${
                    showPreviewBadge ? "opacity-70" : ""
                  }`}
                  alt="Album cover"
                />
                {showPreviewBadge && (
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-sm bg-black/75 border-t border-blue-400/50 flex items-center justify-center py-[2px]">
                    <span className="text-[6.5px] font-bold text-blue-300 tracking-[0.15em] uppercase">
                      PREVIEW
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {currentSong?.title}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {currentSong?.singer}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleLikeToggle(); }}
                className="p-2"
              >
                {isLiked
                  ? <BsHeartFill className="text-base text-red-500" />
                  : <BsHeart className="text-base text-gray-400" />
                }
              </button>

              <div className="play-pause-wrapper shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
                <button
                  className="play-pause-button flex justify-center items-center gap-2"
                  onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }}
                  disabled={hasStreamError}
                >
                  {hasStreamError ? (
                    <FaLock className="text-sm text-white" />
                  ) : isPlayerLoading ? (
                    <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <FaPause className="text-sm" />
                  ) : (
                    <FaPlay className="text-sm" />
                  )}
                </button>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-2"
              >
                <RiSkipRightFill className="text-xl text-gray-300" />
              </button>
            </div>
          </div>
        </div>
        <div className="gradiant-line" />
      </div>

      {/* Full Player */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col transition-transform duration-500 ease-in-out transform md:hidden ${
          isFullPlayerOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
          style={{ backgroundImage: `url(${currentSong?.coverImage})` }}
        />

        <div className="flex justify-center pt-3 pb-1 relative z-10">
          <div className="w-12 h-1 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 relative z-10">
          <button
            onClick={() => setIsFullPlayerOpen(false)}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-all"
          >
            <IoIosArrowDown className="text-2xl" />
          </button>

          <div className="text-center flex-1 px-4">
            <p className="text-sm font-medium text-gray-300 truncate">
              {currentSong?.albumName || "Now Playing"}
            </p>
          </div>

          {/* ✅ Share/More button — desktop PlayerUI ke same props */}
          <div className="relative">
            <button
              ref={moreBtnRef}
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-all"
            >
              <IoIosMore className={`text-2xl ${showShareMenu ? "text-blue-400" : "text-white"}`} />
            </button>
            <ShareDropdown
              isOpen={showShareMenu}
              navigate={navigate}
              onClose={() => setShowShareMenu(false)}
              triggerRef={moreBtnRef}
              // ✅ Desktop wale same props — yahi fix hai
              shareUrl={`${window.location.origin}/song/${currentSong?.slug || currentSong?._id}`}
              songName={currentSong?.title}
              singerName={currentSong?.singer}
              songSlug={currentSong?.slug}
              artistSlug={currentSong?.artist?.slug || currentSong?.artistSlug}
              albumSlug={currentSong?.albumSlug}
              isPlayerContext={true}
              placement="bottom-left"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 relative z-10 flex flex-col">

          {/* Album Art */}
          <div className="flex justify-center mt-2 mb-8">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ width: "min(70vw, 320px)", aspectRatio: "1/1" }}
            >
              <img
                src={currentSong?.coverImage}
                className={`w-full h-full object-cover ${showPreviewBadge ? "opacity-80" : ""}`}
                alt=""
              />
              {showPreviewBadge && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs border-y-2 border-blue-400 text-blue-300 bg-black/60 backdrop-blur-sm tracking-wider font-semibold">
                    Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Song Info + Like */}
          <div className="flex items-start justify-between mb-6 w-full">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-2xl font-bold text-white truncate">{currentSong?.title}</h2>
              <p className="text-base text-gray-400 mt-1 truncate">{currentSong?.singer}</p>
              {currentSong?.albumName && (
                <p className="text-xs text-gray-500 truncate mt-1">{currentSong.albumName}</p>
              )}
            </div>
            <button onClick={handleLikeToggle} className="flex-shrink-0 p-2">
              {isLiked
                ? <BsHeartFill className="text-2xl text-red-500" />
                : <BsHeart className="text-2xl text-gray-400" />
              }
            </button>
          </div>

          {/* Error */}
          {(playbackError || streamError) && (
            <p className="text-xs text-red-400 text-center mb-4 bg-red-900/20 py-2 rounded-full">
              {playbackError || streamError?.message}
            </p>
          )}

          {/* Progress Bar */}
          <div className="w-full mb-6">
            <div className="relative h-1.5 mb-2 group">
              <div className="absolute inset-0 bg-gray-700 rounded-full" />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={isDisplayOnly ? 0 : currentTime}
                onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                disabled={isDisplayOnly}
                className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{isDisplayOnly ? "0:00" : formatTime(currentTime)}</span>
              <span>{formatDuration(duration || currentSong?.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center">
              <button
                onClick={handleToggleShuffle}
                className={`p-3 transition-colors ${shuffleMode ? "text-blue-500" : "text-gray-400"}`}
              >
                <IoMdShuffle className="text-2xl" />
              </button>

              <button
                onClick={handlePrev}
                className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all"
              >
                <RiSkipLeftFill className="text-3xl" />
              </button>

              <button
                onClick={handleTogglePlay}
                disabled={hasStreamError}
                className="p-5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full shadow-xl hover:from-blue-500 hover:to-cyan-400 transition-all transform hover:scale-105 active:scale-95"
              >
                {hasStreamError ? (
                  <FaLock className="text-2xl text-white" />
                ) : isPlayerLoading ? (
                  <div className="spinner h-7 w-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <FaPause className="text-2xl" />
                ) : (
                  <FaPlay className="text-2xl ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all"
              >
                <RiSkipRightFill className="text-3xl" />
              </button>

              <button
                onClick={handleRepeatToggle}
                className={`p-3 transition-colors ${repeatMode !== "off" ? "text-blue-500" : "text-gray-400"}`}
              >
                {repeatMode === "one" ? (
                  <TbRepeatOnce className="text-2xl" />
                ) : (
                  <TbRepeat className="text-2xl" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-[10px] text-gray-500">
            {shuffleMode && <span>Shuffle is on</span>}
            {repeatMode === "all" && <span>Repeat all</span>}
            {repeatMode === "one" && <span>Repeat one</span>}
          </div>

          <div className="h-8" />
        </div>
      </div>
    </>
  );
};

export default MobilePlayer;