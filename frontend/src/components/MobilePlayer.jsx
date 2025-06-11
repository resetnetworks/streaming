import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useSelector, useDispatch } from "react-redux";
import { selectAllSongs } from "../features/songs/songSelectors.js";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
} from "../features/playback/playerSlice";
import { FaPlay, FaPause } from "react-icons/fa";
import { RiVolumeUpFill, RiVolumeMuteFill } from "react-icons/ri";
import { IoIosArrowDown, IoIosInfinite, IoMdShuffle } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { RiSkipLeftFill, RiSkipRightFill } from "react-icons/ri";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const MobilePlayer = () => {
  const dispatch = useDispatch();

  const songs = useSelector(selectAllSongs);
  const selectedSongId = useSelector((state) => state.player.selectedSong);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const volume = useSelector((state) => state.player.volume);

  const currentSong = songs.find((s) => s._id === selectedSongId) || songs[0];
  const currentIndex = songs.findIndex((s) => s._id === selectedSongId);
  const nextSongs = songs.slice(currentIndex, currentIndex + 3);

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const audioRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!currentSong?.audio?.url) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(currentSong.audio.url);
      hls.attachMedia(audioRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audioRef.current.play();
        }
      });
    } else if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      audioRef.current.src = currentSong.audio.url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }

    dispatch(setCurrentTime(0));
    dispatch(setDuration(0));
  }, [currentSong, dispatch, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => dispatch(setDuration(audio.duration));
    const onTimeUpdate = () => dispatch(setCurrentTime(audio.currentTime));
    const onEnded = () => {
      if (!isLooping) handleNext();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [dispatch, currentSong, isLooping]);

  const handleTogglePlay = () => {
    isPlaying ? dispatch(pause()) : dispatch(play());
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
    if (!songs.length) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    dispatch(setSelectedSong(songs[nextIndex]._id));
    dispatch(play());
  };

  const handlePrev = () => {
    if (!songs.length) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    dispatch(setSelectedSong(songs[prevIndex]._id));
    dispatch(play());
  };

  const handleSeekChange = (newSeek) => {
    dispatch(setCurrentTime(newSeek));
    if (audioRef.current) {
      audioRef.current.currentTime = newSeek;
    }
  };

  if (!currentSong) return null;

  return (
    <>
      <audio ref={audioRef} style={{ display: "none" }} muted={isMuted} />

      {/* Mini Player */}
      <div
        className="md:hidden fixed cursor-pointer bottom-16 left-0 right-0 z-40 bg-gradient-to-bl from-blue-900 to-black border-t border-b border-gray-800"
        onClick={() => setIsFullPlayerOpen(true)}
      >
        <div
          className="h-1 from-black to-blue-600 bg-gradient-to-br transition-all duration-300 ease-in-out"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        ></div>

        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentSong?.thumbnail?.url}
                className="w-12 h-12 rounded-md shadow-[0_0_5px_1px_#3b82f6]"
                alt="Album cover"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {currentSong?.title}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {currentSong?.singer}
                </div>
              </div>
            </div>

            <div className="play-pause-wrapper shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
              <button
                className="play-pause-button flex justify-center items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
              >
                {isPlaying ? (
                  <FaPause className="text-sm" />
                ) : (
                  <FaPlay className="text-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="gradiant-line"></div>
      </div>

      {/* Full Player */}
      <div
        className={`fixed inset-0 z-50 bg-image text-white flex flex-col items-center px-4 py-6 transition-transform duration-500 ease-in-out transform ${
          isFullPlayerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex w-full justify-between text-base text-white">
          <button onClick={() => setIsFullPlayerOpen(false)}>
            <IoIosArrowDown />
          </button>
          <marquee className="w-[80%] text-sm" scrollamount="6">
            {currentSong?.title} - {currentSong?.singer}
          </marquee>
          <button onClick={() => setIsFullPlayerOpen(false)}>
            <IoIosArrowDown />
          </button>
        </div>

        <img
          src={currentSong?.thumbnail?.url}
          className="w-64 h-64 object-contain rounded-lg shadow-lg mt-6 mb-8"
          alt="Album cover"
        />

        <div className="w-full flex justify-between items-center">
          <marquee
            className="w-[90%] text-lg font-bold"
            scrollamount="6"
          >
            {currentSong?.title} - {currentSong?.singer}
          </marquee>
          <CiHeart className="text-xl cursor-pointer" />
        </div>

        <div className="w-full mt-4">
          <div className="gradiant-line mb-2"></div>
          <div className="w-full py-3 group">
            <div className="relative h-1.5">
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden"></div>
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-900 rounded-full"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-1/2 left-0 w-3 h-3 -mt-1.5 bg-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform"
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="gradiant-line mt-2"></div>
          </div>
        </div>

        <div className="w-full mt-4 flex justify-between items-center">
          <IoMdShuffle className="text-3xl cursor-pointer" />
          <RiSkipLeftFill className="text-3xl cursor-pointer" onClick={handlePrev} />
          <div className="play-pause-wrapper-mobile shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
            <button
              className="play-pause-button-mobile flex justify-center items-center gap-2"
              onClick={handleTogglePlay}
            >
              {isPlaying ? (
                <FaPause className="text-lg" />
              ) : (
                <FaPlay className="text-lg" />
              )}
            </button>
          </div>
          <RiSkipRightFill className="text-3xl cursor-pointer" onClick={handleNext} />
          <IoIosInfinite
            className={`text-3xl cursor-pointer ${
              isLooping ? "text-blue-500" : "text-gray-400"
            }`}
            onClick={() => setIsLooping(!isLooping)}
          />
        </div>
      </div>
    </>
  );
};

export default MobilePlayer;
