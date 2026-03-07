import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  setShuffleMode,
  setRepeatMode,
} from "../../features/playback/playerSlice";
import { usePlayer } from "../../hooks/usePlayer";
import { IoIosArrowDown, IoMdShuffle } from "react-icons/io";
import { TbRepeat } from "react-icons/tb";
import { RiSkipLeftFill, RiSkipRightFill } from "react-icons/ri";
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
  const shuffleMode = useSelector((state) => state.player.shuffleMode);
  const repeatMode = useSelector((state) => state.player.repeatMode);

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isArtworkExpanded, setIsArtworkExpanded] = useState(false);
  const artworkRef = useRef(null);

  const player = usePlayer();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    isLoading,
    streamError,
    isDisplayOnly,
    isPreview,
    isLiked,
    selectedSong,
    handleTogglePlay,
    handleNext,
    handlePrev,
    handleSeekChange,
    handleLikeToggle,
    videoRef,
  } = player;

  useEffect(() => {
    if (isFullPlayerOpen) setIsFullPlayerOpen(false);
  }, [location.pathname]);

  const handleToggleShuffle = () => dispatch(setShuffleMode(!shuffleMode));

  const handleToggleRepeat = () => {
    const modes = ["off", "one", "all"];
    dispatch(setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]));
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return (
          <div className="relative">
            <TbRepeat className="text-2xl text-blue-500" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              1
            </span>
          </div>
        );
      case "all":
        return <TbRepeat className="text-2xl text-blue-500" />;
      default:
        return <TbRepeat className="text-2xl text-gray-400" />;
    }
  };

  const progressPercentage =
    duration && !isNaN(duration) && !isNaN(currentTime)
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  // ✅ Single source of truth for preview state
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

      {/* ── Mini Player ─────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed cursor-pointer bottom-16 left-0 right-0 z-40 bg-gradient-to-bl from-blue-900 to-black border-t border-b border-gray-800"
        onClick={() => setIsFullPlayerOpen(true)}
      >
        {/* Progress line — hidden when preview */}
        <div
          className="h-1 from-black to-blue-600 bg-gradient-to-br transition-all duration-300 ease-in-out"
          style={{ width: `${showPreviewBadge ? 0 : progressPercentage}%` }}
        />

        <div className="p-3">
          <div className="flex items-center justify-between">

            {/* Album art + preview badge + song info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* ✅ Thumbnail with PREVIEW label overlay */}
              <div className="relative flex-shrink-0 w-12 h-12">
                <img
                  src={currentSong?.coverImage}
                  className={`w-12 h-12 rounded-md shadow-[0_0_5px_1px_#3b82f6] ${
                    showPreviewBadge ? "opacity-70" : ""
                  }`}
                  alt="Album cover"
                />
                {/* ✅ PREVIEW strip at bottom of thumbnail */}
                {showPreviewBadge && (
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/75 border-t border-blue-400/50 flex items-center justify-center py-[2px]">
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

            {/* Play/Pause */}
            <div className="play-pause-wrapper shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
              <button
                className="play-pause-button flex justify-center items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                disabled={isLoading || hasStreamError}
              >
                {hasStreamError ? (
                  <FaLock className="text-sm text-white" />
                ) : isLoading ? (
                  <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying && !showPreviewBadge ? (
                  <FaPause className="text-sm" />
                ) : (
                  <FaPlay className="text-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="gradiant-line" />
      </div>

      {/* ── Full Player ──────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-br from-black via-blue-900 to-black text-white flex flex-col items-center px-4 py-6 transition-transform duration-500 ease-in-out transform ${
          isFullPlayerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="absolute inset-0 border-8 border-transparent animate-pulse pointer-events-none"
          style={{ boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.5)" }}
        />

        {/* Header */}
        <div className="flex w-full justify-between items-center mb-4">
          <button
            onClick={() => setIsFullPlayerOpen(false)}
            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
          >
            <IoIosArrowDown className="text-xl" />
          </button>

          <div className="text-center flex-1 px-4">
            <div className="text-sm font-medium text-blue-400 tracking-widest uppercase">
            </div>
            <div className="text-lg font-bold truncate max-w-xs mx-auto">
              {currentSong?.title
                ? `${currentSong.title.slice(0, 25)}${currentSong.title.length > 25 ? ".." : ""}`
                : ""}
            </div>
          </div>

          <button
            onClick={handleLikeToggle}
            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
          >
            {isLiked ? (
              <BsHeartFill className="text-xl text-blue-400 animate-pulse" />
            ) : (
              <BsHeart className="text-xl text-gray-400" />
            )}
          </button>
        </div>

        {/* Artwork */}
        <div
          ref={artworkRef}
          className={`relative ${
            isArtworkExpanded ? "w-72 h-72" : "w-64 h-64"
          } rounded-xl border-4 border-blue-500 shadow-lg transition-all duration-500 mb-8 overflow-hidden cursor-pointer`}
          onClick={() => setIsArtworkExpanded(!isArtworkExpanded)}
          style={{
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.7)",
            background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)",
          }}
        >
          <img
            src={currentSong?.coverImage}
            className={`w-full h-full object-cover ${showPreviewBadge ? "opacity-80" : ""}`}
            alt="Album cover"
          />
          {showPreviewBadge && (
            <div className="absolute top-0 right-1">
              <span className="px-2 py-0.5 text-[10px] rounded-sm font-semibold border border-blue-400 text-blue-300 bg-black tracking-widest uppercase">
                Preview
              </span>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold truncate px-10">{currentSong?.title}</h2>
          <p className="text-blue-300">{currentSong?.singer}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full px-4 mb-6">
          <div className="relative h-3 mb-2 group">
            <div className="absolute inset-0 bg-gray-800 rounded-full overflow-hidden" />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${showPreviewBadge ? 0 : progressPercentage}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                boxShadow: "0 0 10px rgba(59,130,246,0.7)",
                width: `${showPreviewBadge ? 0 : progressPercentage}%`,
              }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={showPreviewBadge ? 0 : currentTime}
              onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
              className={`absolute w-full h-full opacity-0 z-10 ${
                showPreviewBadge ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              disabled={showPreviewBadge}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{showPreviewBadge ? "0:00" : formatTime(currentTime)}</span>
            <span>{formatTime(duration || currentSong?.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between items-center px-6">
            <button
              onClick={handleToggleShuffle}
              className={`p-3 transition-colors relative ${
                shuffleMode ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <IoMdShuffle className="text-2xl" />
              {shuffleMode && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={handlePrev}
              className="p-4 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
            >
              <RiSkipLeftFill className="text-3xl" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="p-5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full shadow-lg hover:from-blue-500 hover:to-cyan-400 transition-all transform hover:scale-105"
              disabled={isLoading || hasStreamError}
            >
              {hasStreamError ? (
                <FaLock className="text-xl text-white" />
              ) : isLoading ? (
                <div className="spinner h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying && !showPreviewBadge ? (
                <FaPause className="text-xl" />
              ) : (
                <FaPlay className="text-xl" />
              )}
            </button>

            <button
              onClick={() => handleNext(true)}
              className="p-4 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
            >
              <RiSkipRightFill className="text-3xl" />
            </button>

            <button
              onClick={handleToggleRepeat}
              className={`p-3 transition-colors relative ${
                repeatMode !== "off" ? "text-blue-500" : "text-gray-400"
              }`}
            >
              {getRepeatIcon()}
              {repeatMode === "all" && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePlayer;