

import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useSelector, useDispatch } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  selectAllSongs,
  selectSelectedSong,
} from "../features/songs/songSelectors.js";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
} from "../features/playback/playerSlice";
import { toggleLikeSong } from "../features/auth/authSlice.js";
import { selectIsSongLiked } from "../features/auth/authSelectors.js";
import { formatDuration } from "../utills/helperFunctions";

import {
  RiSkipLeftFill,
  RiSkipRightFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
} from "react-icons/ri";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosMore } from "react-icons/io";
import { FaPlay, FaPause } from "react-icons/fa";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { LuDna } from "react-icons/lu";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const Player = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const selectedSong = useSelector(selectSelectedSong);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const volume = useSelector((state) => state.player.volume);

  const [open, setOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const currentSong =
    selectedSong && songs.length
      ? songs.find((s) => s._id === selectedSong)
      : null;

  const currentIndex = currentSong
    ? songs.findIndex((s) => s._id === selectedSong)
    : -1;

  const nextSongs =
    currentIndex !== -1
      ? songs.slice(currentIndex, currentIndex + 4)
      : songs.slice(0, 4);

  const isLiked = useSelector(selectIsSongLiked(currentSong?._id));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSong || !currentSong.hlsUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const handleCanPlay = async () => {
      dispatch(setCurrentTime(0));
      dispatch(setDuration(video.duration || currentSong?.duration || 0));
      if (isPlaying) {
        try {
          await video.play();
        } catch (err) {
          console.warn("Playback error on canplay:", err);
        }
      }
    };

    video.addEventListener("canplay", handleCanPlay);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(currentSong.hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = currentSong.hlsUrl;
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentSong, dispatch]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playAudio = async () => {
        try {
          if (video.readyState >= 3) {
            await video.play();
          } else {
            const onCanPlay = async () => {
              try {
                await video.play();
              } catch (err) {
                console.warn("Playback error during delayed play:", err);
              }
              video.removeEventListener("canplay", onCanPlay);
            };
            video.addEventListener("canplay", onCanPlay);
          }
        } catch (err) {
          console.warn("Playback error on isPlaying change:", err);
        }
      };

      playAudio();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSong) return;

    const onLoadedMetadata = () =>
      dispatch(setDuration(video.duration || currentSong?.duration || 0));
    const onTimeUpdate = () => dispatch(setCurrentTime(video.currentTime || 0));
    const onEnded = () => handleNext();

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [dispatch, currentSong]);

  const handleTogglePlay = () => {
    dispatch(isPlaying ? pause() : play());
  };

  const handleToggleMute = () => {
    if (isMuted) {
      dispatch(setVolume(prevVolume));
    } else {
      setPrevVolume(volume);
      dispatch(setVolume(0));
    }
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    dispatch(setSelectedSong(songs[nextIndex]._id));
    dispatch(play());
  };

  const handlePrev = () => {
    if (!currentSong || songs.length === 0) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    dispatch(setSelectedSong(songs[prevIndex]._id));
    dispatch(play());
  };

  const handleSeekChange = (newSeek) => {
    dispatch(setCurrentTime(newSeek));
    if (videoRef.current) {
      videoRef.current.currentTime = newSeek;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value) / 100;
    dispatch(setVolume(vol));
    if (isMuted) setIsMuted(false);
  };

  const handleLikeToggle = () => {
    if (currentSong?._id) {
      dispatch(toggleLikeSong(currentSong._id));
    }
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

  const trackStyle = {
    background: `linear-gradient(to right, #007aff ${volume * 100}%, #ffffff22 ${volume * 100}%)`,
  };

  return (
      <div className="player-wrapper shadow-[-10px_-10px_80px_rgba(0,153,255,0.4)] shadow-[#0e52ff3b]">
      {currentSong?.audioUrl && currentSong.audioUrl.trim().length > 0 && (
        <video
          ref={videoRef}
          style={{ display: "none" }}
          muted={isMuted}
          preload="auto"
          playsInline
          crossOrigin="anonymous"
        />
      )}

      <div className="player-card w-[15.25rem] py-4 px-4 flex flex-col items-center">
        <div className="w-full aspect-square overflow-hidden rounded-md">
          <img
            src={currentSong?.coverImage}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <p className="text-lg mt-2">{currentSong?.title}</p>
        <span className="text-sm text-gray-500">{currentSong?.singer}</span>

        <div className="w-full mt-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
            className="track-progress w-full h-1 appearance-none rounded"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1 px-[2px]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatDuration(currentSong?.duration)}</span>
          </div>
        </div>

        <div className="w-full flex justify-between mt-4">
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button flex justify-center items-center gap-2">
              <LuDna className="text-blue-500 text-sm" /> lossless
            </button>
          </div>
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button">reset master</button>
          </div>
        </div>

        <div className="w-full mt-4 flex justify-between items-center">
          <button onClick={handleLikeToggle} className="focus:outline-none">
            {isLiked ? (
              <BsHeartFill className="text-base text-red-500" />
            ) : (
              <BsHeart className="text-base text-gray-400" />
            )}
          </button>

          <RiSkipLeftFill
            className="text-md text-white cursor-pointer"
            onClick={handlePrev}
          />
          <div className="play-pause-wrapper shadow-xl shadow-blue-800 flex justify-center items-center">
            <button
              className="play-pause-button flex justify-center items-center gap-2"
              onClick={handleTogglePlay}
            >
              {isPlaying ? (
                <FaPause className="text-sm" />
              ) : (
                <FaPlay className="text-sm" />
              )}
            </button>
          </div>
          <RiSkipRightFill
            className="text-md text-white cursor-pointer"
            onClick={handleNext}
          />
          <IoIosMore className="text-md text-white" />
        </div>

        <div className="player-gradiant-line mt-4"></div>

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
        <div className="gradiant-line mt-4"></div>

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
                      song._id === selectedSong ? "bg-blue-800/40" : ""
                    }`}
                    onClick={() => {
                      dispatch(setSelectedSong(song._id));
                      dispatch(play());
                    }}
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

export default Player;



