// components/player/PlayerUI.jsx
import React, { useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { formatDuration } from "../../../utills/helperFunctions";
import ShareDropdown from "../ShareDropdown";
import {
  RiSkipLeftFill,
  RiSkipRightFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
} from "react-icons/ri";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosMore } from "react-icons/io";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { BsHeart, BsHeartFill } from "react-icons/bs";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const PlayerUI = ({
  // Data
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isLoading,
  playbackError,
  streamError,
  isDisplayOnly,
  isLiked,
  nextSongs,
  selectedSong,
  
  // Handlers
  handleTogglePlay,
  handleToggleMute,
  handleNext,
  handlePrev,
  handleSeekChange,
  handleVolumeChange,
  handleLikeToggle,
  handleNextSongClick,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [open, setOpen] = useState(true);

  const trackStyle = {
    background: `linear-gradient(to right, #007aff ${
      volume * 100
    }%, #ffffff22 ${volume * 100}%)`,
  };

  if (!currentSong) {
    return (
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="ml-3">
          <Skeleton width={250} height={800} />
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="player-wrapper">
      <div className="player-card w-[15.25rem] py-4 px-4 flex flex-col items-center">
        {/* Album Art */}
        <div className="w-full aspect-square overflow-hidden rounded-md">
          <img
            src={currentSong?.coverImage}
            className={`w-full h-full object-cover ${isDisplayOnly ? 'opacity-80' : ''}`}
            alt=""
          />
        </div>

        {/* Song Info */}
        <p className="text-lg mt-2">{currentSong?.title}</p>
        <span className="text-sm text-gray-500">{currentSong?.singer}</span>

        {/* Progress Bar */}
        <div className="w-full mt-4">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={isDisplayOnly ? 0 : currentTime}
            onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
            className={`track-progress w-full h-1 appearance-none rounded ${
              isDisplayOnly ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isDisplayOnly}
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1 px-[2px]">
            <span>{isDisplayOnly ? "0:00" : formatTime(currentTime)}</span>
            <span>{formatDuration(duration || currentSong?.duration)}</span>
          </div>
        </div>

        {/* Quality & AMB Buttons */}
        <div className="w-full flex justify-between mt-4">
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button flex justify-center items-center gap-2">
              lossless
            </button>
          </div>
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button 
              className="player-button flex justify-center items-center gap-2"
              title="Refresh default song"
            >
              ΛMB 
            </button>
          </div>
        </div>

        {/* Player Controls */}
        <div className="w-full mt-4 flex justify-between items-center">
          {/* Like Button */}
          <button onClick={handleLikeToggle} className="focus:outline-none">
            {isLiked ? (
              <BsHeartFill className="text-base text-red-500" />
            ) : (
              <BsHeart className="text-base text-gray-400" />
            )}
          </button>

          {/* Previous */}
          <RiSkipLeftFill
            className="text-md text-white cursor-pointer"
            onClick={handlePrev}
          />

          {/* Play/Pause */}
          <div className="play-pause-wrapper shadow-xl shadow-blue-800 flex justify-center items-center">
            <button
              className="play-pause-button flex justify-center items-center gap-2"
              onClick={handleTogglePlay}
              disabled={isLoading || (streamError?.songId === selectedSong?._id)}
            >
              {streamError?.songId === selectedSong?._id ? (
                <FaLock className="text-sm text-white" />
              ) : isLoading ? (
                <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (isPlaying && !isDisplayOnly) ? (
                <FaPause className="text-sm" />
              ) : (
                <FaPlay className="text-sm" />
              )}
            </button>
          </div>

          {/* Next */}
          <RiSkipRightFill
            className="text-md text-white cursor-pointer"
            onClick={handleNext}
          />

          {/* Share Dropdown */}
          <div className="relative">
            <IoIosMore
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={`text-base ${
                showShareMenu
                  ? "text-blue-400"
                  : "group-hover:text-blue-400"
              }`}
            />
            <ShareDropdown
              isOpen={showShareMenu}
              onClose={() => setShowShareMenu(false)}
              url={`${window.location.origin}/song/${currentSong?._id || currentSong?.slug}`}
              title={currentSong?.title}
              text={`Listen to "${currentSong?.title}" on Reset Music`}
              isActive={showShareMenu}
              className="lg:right-0 right-[-80px] sm:right-[-40px]"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="player-gradiant-line mt-4"></div>

        {/* Volume Control */}
        <div className="flex w-full mt-4 justify-between items-center">
          <button onClick={handleToggleMute} className="focus:outline-none">
            {isMuted ? (
              <RiVolumeMuteFill className="text-base text-gray-400" />
            ) : (
              <RiVolumeUpFill className="text-base" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="neon-range w-[90%] h-2 appearance-none rounded-full"
            style={trackStyle}
          />
        </div>

        {/* Divider */}
        <div className="gradiant-line mt-4"></div>

        {/* Next Songs Queue */}
        <div className="w-full rounded-md p-3 mt-4 relative text-white shadow-md bg-transparent overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setOpen(!open)}
            >
              <h2 className="text-sm font-semibold tracking-wide">
                playing next
              </h2>
              {open ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {open && (
              <div className="space-y-3">
                {nextSongs.map((song) => (
                  <div
                    key={song._id}
                    className={`flex items-center justify-between text-sm cursor-pointer hover:bg-blue-800/30 rounded-md p-1 transition ${
                      song._id === selectedSong?._id ? "bg-blue-800/40" : ""
                    }`}
                    onClick={() => handleNextSongClick(song)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={song.coverImage || "/images/placeholder.png"}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-[13px]">
                          {song.title}
                        </span>
                        <span className="text-[11px] text-gray-300">
                          {song.singer}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-200">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerUI;