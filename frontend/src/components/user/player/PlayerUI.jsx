import React, { useState, useRef, useEffect } from "react";
import { formatDuration } from "../../../utills/helperFunctions";
import ShareDropdown from "../ShareDropdown";
import {
  RiSkipLeftFill,
  RiSkipRightFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
} from "react-icons/ri";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosMore, IoMdMore, IoMdShuffle } from "react-icons/io";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { TbRepeat, TbRepeatOnce } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const waveHeights = [
  4, 7, 10, 6, 12, 18, 14, 9, 16, 20, 13, 8, 18, 15, 10,
  7, 14, 19, 11, 6, 9, 17, 13, 8, 16, 20, 12, 7, 10, 15,
  18, 6, 11, 14, 9, 17, 13, 8, 16, 10, 7, 12, 20, 15, 9, 13,
];

// ─── Ghost / Empty State Player ───────────────────────────────────────────────
const GhostPlayer = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="player-wrapper">
      <div className="player-card w-[15.25rem] py-4 px-4 flex flex-col items-center relative">
        <div
          className="absolute inset-0 z-10 rounded-xl pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(1.5px)",
          }}
        />

        <div className="w-full aspect-square overflow-hidden rounded-md bg-gray-700/60 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
        </div>

        <div className="w-3/4 h-4 mt-3 rounded bg-gray-700/60" />
        <div className="w-1/2 h-3 mt-2 rounded bg-gray-700/40" />

        {/* Ghost Progress */}
        <div className="w-full mt-4 flex flex-col gap-[6px]">
          <div className="flex items-end gap-[2px] h-5 w-full opacity-30">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-gray-600"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="w-full h-1 rounded-full bg-gray-700/60" />
          <div className="flex justify-between text-xs text-gray-600 mt-1 px-[2px]">
            <span>0:00</span>
            <span>0:00</span>
          </div>
        </div>

        <div className="w-full flex justify-between mt-4">
          <div className="button-wrapper shadow-md shadow-gray-800 opacity-40">
            <button className="player-button flex justify-center items-center gap-2">lossless</button>
          </div>
          <div className="button-wrapper shadow-md shadow-gray-800 opacity-40">
            <button className="player-button flex justify-center items-center gap-2">ΛMB</button>
          </div>
        </div>

        <div className="w-full mt-4 flex justify-between items-center opacity-40">
          <BsHeart className="text-base text-gray-500" />
          <RiSkipLeftFill className="text-md text-gray-500" />
          <div className="play-pause-wrapper shadow-xl shadow-blue-900 flex justify-center items-center">
            <button className="play-pause-button flex justify-center items-center gap-2" disabled>
              <FaPlay className="text-sm text-gray-400" />
            </button>
          </div>
          <RiSkipRightFill className="text-md text-gray-500" />
          <IoIosMore className="text-base text-gray-500" />
        </div>

        <div className="player-gradiant-line mt-4 opacity-30" />

        <div className="flex w-full mt-4 justify-between items-center opacity-40">
          <RiVolumeUpFill className="text-base text-gray-500" />
          <div className="w-[90%] h-2 rounded-full bg-gray-700/60" />
        </div>

        <div className="gradiant-line mt-4 opacity-30" />

        <div className="w-full rounded-md p-3 mt-4 relative text-white shadow-md bg-transparent overflow-hidden opacity-40">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold tracking-wide text-gray-500">playing next</h2>
            {open ? (
              <FiChevronUp className="text-gray-500" onClick={() => setOpen(false)} />
            ) : (
              <FiChevronDown className="text-gray-500" onClick={() => setOpen(true)} />
            )}
          </div>
          {open && (
           <div className="max-h-[180px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-700/60" />
                    <div className="flex flex-col gap-1">
                      <div className="w-24 h-3 rounded bg-gray-700/60" />
                      <div className="w-16 h-2 rounded bg-gray-600/40" />
                    </div>
                  </div>
                  <div className="w-8 h-2 rounded bg-gray-700/40" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main PlayerUI ─────────────────────────────────────────────────────────────
const PlayerUI = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackError,
  streamError,
  isDisplayOnly,
  isPreview,
  isLiked,
  nextSongs,
  selectedSong,
  handleTogglePlay,
  handleToggleMute,
  handleNext,
  handlePrev,
  handleSeekChange,
  handleVolumeChange,
  handleLikeToggle,
  handleNextSongClick,
  isPlayerLoading,
  repeatMode,
  handleRepeatToggle,
  shuffleMode,
  handleShuffleToggle,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [open, setOpen] = useState(true);
  const [transitionReady, setTransitionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTransitionReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const shareMenuTriggerRef = useRef(null);

  if (!currentSong) {
    return <GhostPlayer />;
  }

  const trackStyle = {
    background: `linear-gradient(to right, #007aff ${volume * 100}%, #ffffff22 ${volume * 100}%)`,
  };

  // ✅ Fix: Only compute progressPercent if duration is valid and > 0
  const progressPercent = duration > 0 ? ((currentTime / duration) * 100).toFixed(2) : 0;
  const remainingTime = Math.max(0, (duration || 0) - currentTime);

  return (
    <div className="player-wrapper">
      <div className="player-card w-[15.25rem] py-4 px-4 flex flex-col items-center">
        {/* Album Art */}
        <div className="w-full aspect-square overflow-hidden rounded-md relative">
          <img
            src={currentSong?.coverImage}
            className={`w-full h-full object-cover ${isDisplayOnly ? "opacity-80" : ""}`}
            alt=""
          />
          {(isPreview || isDisplayOnly) && (
            <div className="absolute top-0 right-1">
              <span className="px-2 py-0.5 text-[10px] rounded-sm font-semibold border border-blue-400 text-blue-300 bg-black tracking-widest uppercase">
                Preview
              </span>
            </div>
          )}
        </div>

        {/* Song Info */}
        <p className="text-lg mt-2">{currentSong?.title}</p>
        <span className="text-sm text-gray-500">{currentSong?.singer}</span>

        {/* ── Progress Section ── */}
        <div className="w-full mt-4 flex flex-col gap-[6px]">

          {/* Waveform bars */}
          <div className="flex items-end gap-[2px] h-5 w-full">
            {waveHeights.map((h, i) => {
              const filled =
                !isDisplayOnly &&
                duration > 0 && // ✅ Only fill if duration is known
                (i / waveHeights.length) * 100 < parseFloat(progressPercent);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}px`,
                    background: filled ? "#3b82f6" : "rgba(255,255,255,0.08)",
                    opacity: filled ? 0.4 + (h / 20) * 0.6 : 1,
                    transition: transitionReady ? "background 0.1s" : "none",
                  }}
                />
              );
            })}
          </div>

          {/* Scrub track */}
          <div className="relative w-full h-1 bg-white/10 rounded-full cursor-pointer group">
            <div
              className="h-full bg-blue-500 rounded-full relative"
              style={{
                width: `${isDisplayOnly ? 0 : progressPercent}%`,
                transition: transitionReady ? "width 0.1s linear" : "none",
              }}
            >
              {!isDisplayOnly && (
                <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] group-hover:scale-125 transition-transform duration-150" />
              )}
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={isDisplayOnly ? 0 : currentTime}
              onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              disabled={isDisplayOnly}
            />
          </div>

          {/* Timestamps */}
          <div className="flex justify-between items-center text-[11px] px-[2px]">
            <span className="text-blue-200 font-medium tracking-wide">
              {isDisplayOnly ? "0:00" : formatDuration(currentTime)}
            </span>
            <span className="text-gray-200">
              {formatDuration(duration || currentSong?.duration)}
            </span>
          </div>
        </div>

        {/* Quality & AMB Buttons */}
        <div className="w-full flex justify-between mt-4">
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button flex justify-center items-center gap-2">lossless</button>
          </div>
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button flex justify-center items-center gap-2" title="Refresh default song">
              ΛMB
            </button>
          </div>
        </div>

        {/* Player Controls */}
        <div className="w-full mt-4 flex justify-between items-center">
          {/* Like */}
          <button onClick={handleLikeToggle} className="focus:outline-none">
            {isLiked ? (
              <BsHeartFill className="text-base text-red-500" />
            ) : (
              <BsHeart className="text-base text-gray-400" />
            )}
          </button>

          {/* Shuffle */}
          <button onClick={handleShuffleToggle} title="Shuffle" className="focus:outline-none">
            <IoMdShuffle className={`text-lg ${shuffleMode ? "text-blue-400" : "text-gray-400"}`} />
          </button>

          {/* Previous */}
          <RiSkipLeftFill className="text-md text-white cursor-pointer" onClick={handlePrev} />

          {/* Play/Pause */}
          <div className="play-pause-wrapper shadow-xl shadow-blue-800 flex justify-center items-center">
            <button
              className="play-pause-button flex justify-center items-center gap-2"
              onClick={handleTogglePlay}
              disabled={streamError?.songId === selectedSong?._id}
            >
              {streamError?.songId === selectedSong?._id ? (
                <FaLock className="text-sm text-white" />
              ) : isPlayerLoading ? (
                <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying && !isDisplayOnly ? (
                <FaPause className="text-sm" />
              ) : (
                <FaPlay className="text-sm" />
              )}
            </button>
          </div>

          {/* Next */}
          <RiSkipRightFill className="text-md text-white cursor-pointer" onClick={handleNext} />

          {/* Repeat */}
          <button
            onClick={handleRepeatToggle}
            title={
              repeatMode === "off"
                ? "Repeat off"
                : repeatMode === "all"
                  ? "Repeat playlist"
                  : "Repeat one"
            }
          >
            {repeatMode === "one" ? (
              <TbRepeatOnce className="text-blue-400 text-lg" />
            ) : (
              <TbRepeat className={`text-lg ${repeatMode === "all" ? "text-blue-400" : "text-gray-400"}`} />
            )}
          </button>

          {/* Share / More */}
          <button
            ref={shareMenuTriggerRef}
            onClick={() => setShowShareMenu((prev) => !prev)}
            className="focus:outline-none"
          >
            <IoIosMore
              className={`text-base ${showShareMenu ? "text-blue-400" : "text-gray-400 hover:text-blue-400"}`}
            />
          </button>

          <ShareDropdown
            isOpen={showShareMenu}
            navigate={navigate}
            onClose={() => setShowShareMenu(false)}
            triggerRef={shareMenuTriggerRef}
            shareUrl={`${window.location.origin}/song/${currentSong?.slug || currentSong?._id}`}
            songName={currentSong?.title}
            singerName={currentSong?.singer}
            songSlug={currentSong?.slug}
            artistSlug={currentSong?.artist?.slug || currentSong?.artistSlug}
            albumSlug={currentSong?.albumSlug}
            isPlayerContext={true}
            placement="bottom-right"
          />
        </div>

        {/* Divider */}
        <div className="player-gradiant-line mt-4" />

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
        <div className="gradiant-line mt-4" />

        {/* Next Songs Queue */}
        <div className="w-full rounded-md p-3 mt-4 relative text-white shadow-md bg-transparent overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setOpen(!open)}
            >
              <h2 className="text-sm font-semibold tracking-wide">playing next</h2>
              {open ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {open && (
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
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
                        src={song?.coverImage || "/images/placeholder.png"}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="flex flex-col text-left">
                       <span className="font-medium text-[13px]">
  {song?.title?.length > 10
    ? song.title.slice(0, 10) + "..."
    : song.title}
</span>
                        <span className="text-[11px] text-gray-300">{song?.singer}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-200">{formatDuration(song?.duration)}</span>
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