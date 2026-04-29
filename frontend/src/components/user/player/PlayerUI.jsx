// components/player/player/PlayerUI.jsx
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
import SpectrumCanvas from "./SpectrumCanvas";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

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

        {/* Ghost Spectrum */}
        <div className="w-full mt-4 flex flex-col gap-[6px]">
          <div className="flex justify-between text-xs text-gray-600 mt-1 px-[2px]">
            <span>0:00</span>
            <span>0:00</span>
          </div>
        </div>

        {/* Ghost scrub */}
        <div className="w-full h-1 rounded-full bg-gray-700/60 mt-1" />

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
  // ── new spectrum props ──
  frequencyData,
  beatPulse,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [open, setOpen] = useState(true);
  const [transitionReady, setTransitionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setTransitionReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const shareMenuTriggerRef = useRef(null);

  if (!currentSong) return <GhostPlayer />;

  const trackStyle = {
    background: `linear-gradient(to right, #007aff ${volume * 100}%, #ffffff22 ${volume * 100}%)`,
  };

  const progressPercent = duration > 0 ? ((currentTime / duration) * 100).toFixed(2) : 0;

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

        {/* ── Spectrum + Progress Section ── */}
        <div className="w-full flex flex-col gap-[6px]">

          {/* Canvas-based spectrum visualizer */}
          <SpectrumCanvas
            frequencyData={isDisplayOnly ? null : frequencyData}
            isPlaying={isPlaying && !isDisplayOnly}
            beatPulse={isDisplayOnly ? 0 : beatPulse}
          />

          {/* Scrub track */}
          <div className="relative w-full h-1 bg-white/10 rounded-full cursor-pointer group mt-1">
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
          <div
            className="cursor-pointer transition-transform duration-150"
            onClick={handleTogglePlay}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="f_outer" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="-3" dy="-3" stdDeviation="4" floodColor="rgba(137,48,7,0)"/>
                </filter>
                <filter id="f_glass" x="-10%" y="-10%" width="120%" height="120%">
                  <feFlood floodOpacity={0} result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy={1}/>
                  <feGaussianBlur stdDeviation={1.5}/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <linearGradient id="grad_ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ECF3FD"/>
                  <stop offset="35%" stopColor="#1448FF"/>
                  <stop offset="100%" stopColor="#010203"/>
                </linearGradient>
                <linearGradient id="grad_fill" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
                  <stop offset="0%" stopColor="#050F2A" stopOpacity="0.32"/>
                  <stop offset="30%" stopColor="#0941A4" stopOpacity="0.75"/>
                  <stop offset="56%" stopColor="#2775FF" stopOpacity="0.88"/>
                  <stop offset="78%" stopColor="#0C63FF" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#020A1A" stopOpacity="0.10"/>
                </linearGradient>
                <linearGradient id="grad_stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white"/>
                  <stop offset="10%" stopColor="#88B2EF"/>
                  <stop offset="64%" stopColor="#88B2EF"/>
                  <stop offset="87%" stopColor="#033CAA"/>
                </linearGradient>
              </defs>

              <circle cx="22" cy="22" r="21" fill="none" stroke="url(#grad_ring)" strokeWidth="1.2"/>
              <circle cx="22" cy="22" r="19.4" fill="#1A1C20"/>
              <circle cx="22" cy="22" r="19.4" fill="url(#grad_fill)"/>
              <circle cx="22" cy="22" r="19.4" fill="none" stroke="url(#grad_stroke)" strokeWidth="0.7"/>

              {streamError?.songId === selectedSong?._id ? (
                <g filter="url(#f_glass)">
                  <rect x="15" y="20" width="14" height="10" rx="1.5" fill="white"/>
                  <path d="M17 20V17a5 5 0 0 1 10 0v3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </g>
              ) : isPlayerLoading ? (
                <g>
                  <circle cx="22" cy="22" r="7" fill="none" stroke="white" strokeWidth="2" strokeDasharray="22" strokeDashoffset="10" opacity="0.8">
                    <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.8s" repeatCount="indefinite"/>
                  </circle>
                </g>
              ) : isPlaying && !isDisplayOnly ? (
                <g filter="url(#f_glass)">
                  <rect x="16.5" y="15.75" width="3.5" height="12.5" rx="1.5" fill="white"/>
                  <rect x="24" y="15.75" width="3.5" height="12.5" rx="1.5" fill="white"/>
                </g>
              ) : (
                <g filter="url(#f_glass)" transform="translate(15.726, 14.691) scale(0.5455)">
                  <path
                    d="M21.5455 15.4362C21.4636 15.547 21.0818 16.018 20.7818 16.3227L20.6182 16.4889C18.3273 19.01 12.6273 22.8053 9.73636 24.0243C9.73636 24.052 8.01818 24.7723 7.2 24.8H7.09091C5.83636 24.8 4.66364 24.0797 4.06364 22.9162C3.73636 22.279 3.43636 20.4228 3.40909 20.3951C3.16364 18.7329 3 16.187 3 13.3861C3 10.4496 3.16364 7.79004 3.46364 6.15553C3.46364 6.12782 3.76364 4.63183 3.95455 4.13317C4.25455 3.41288 4.8 2.8034 5.48182 2.41555C6.02727 2.13852 6.6 2 7.2 2C7.82727 2.0277 9 2.44603 9.46364 2.63718C12.5182 3.85614 18.3545 7.84544 20.5909 10.2834C20.9727 10.6712 21.3818 11.1422 21.4909 11.253C21.9545 11.8625 22.2 12.6104 22.2 13.4166C22.2 14.1341 21.9818 14.8544 21.5455 15.4362Z"
                    fill="white"
                  />
                </g>
              )}
            </svg>
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
        <div className="w-full rounded-md p-3 mt-4 max-h-52 relative text-white shadow-md bg-transparent overflow-hidden">
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
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
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