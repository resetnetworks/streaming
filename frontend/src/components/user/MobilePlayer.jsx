import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useSelector, useDispatch } from "react-redux";
import { fetchStreamUrl } from "../../features/stream/streamSlice";
import { selectAllSongs, selectSelectedSong } from "../../features/songs/songSelectors";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
} from "../../features/playback/playerSlice";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { formatDuration } from "../../utills/helperFunctions";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { RiVolumeUpFill, RiVolumeMuteFill, RiSkipLeftFill, RiSkipRightFill } from "react-icons/ri";
import { IoIosArrowDown, IoIosInfinite, IoMdShuffle } from "react-icons/io";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { toast } from "sonner";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const handleFeatureSoon = () => {
  toast.success("This feature will be available soon");
};

const MobilePlayer = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const selectedSong = useSelector(selectSelectedSong);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const volume = useSelector((state) => state.player.volume);
  const streamUrls = useSelector((state) => state.stream.urls);
  const streamLoading = useSelector((state) => state.stream.loading);
  const streamError = useSelector((state) => state.stream.error);
  
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = selectedSong ? likedSongIds.includes(selectedSong._id) : false;

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const currentSong = selectedSong || songs[0] || null;
  const currentIndex = currentSong ? songs.findIndex((s) => s._id === currentSong._id) : -1;
  const nextSongs = currentIndex !== -1 ? songs.slice(currentIndex + 1, currentIndex + 4) : songs.slice(0, 3);

  // Fetch stream URL when song changes
  useEffect(() => {
    if (selectedSong && !streamUrls[selectedSong._id]) {
      dispatch(fetchStreamUrl(selectedSong._id));
    }
  }, [selectedSong, streamUrls, dispatch]);

  // Initialize with first song if none selected
  useEffect(() => {
    if (!selectedSong && songs.length > 0) {
      dispatch(setSelectedSong(songs[0]));
    }
  }, [selectedSong, songs, dispatch]);

  // Main HLS player initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSong || !streamUrls[selectedSong?._id]) return;

    let hls;
    const initPlayer = async () => {
      try {
        setIsLoading(true);
        setPlaybackError(null);

        // Reset player state
        dispatch(setCurrentTime(0));
        dispatch(setDuration(0));

        // Clean up previous HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        const streamUrl = streamUrls[selectedSong._id];
        const mediaUrl = `${streamUrl}?nocache=${Date.now()}`;

        if (Hls.isSupported()) {
          hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            enableWorker: true,
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error("HLS Error:", data);
              setPlaybackError(`Playback Error: ${data.type}`);
              hls.destroy();
              if (currentSong.audioUrl) {
                video.src = currentSong.audioUrl;
                video.load();
              }
            }
          });

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(mediaUrl);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.currentTime = 0;
            dispatch(setCurrentTime(0));
            if (isPlaying) {
              video.play().catch((err) => {
                setPlaybackError("Autoplay blocked. Tap play to continue.");
                dispatch(pause());
              });
            }
          });

          hls.attachMedia(video);
          hlsRef.current = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
          video.addEventListener("loadedmetadata", () => {
            dispatch(setDuration(video.duration));
            if (isPlaying) {
              video.play().catch((err) => {
                setPlaybackError("Autoplay blocked. Tap play to continue.");
                dispatch(pause());
              });
            }
          });
        }

        video.onloadedmetadata = () => {
          const safeDuration = isNaN(video.duration)
            ? currentSong.duration || 0
            : video.duration;
          dispatch(setDuration(safeDuration));
        };

        video.ontimeupdate = () => {
          if (!isNaN(video.currentTime)) {
            dispatch(setCurrentTime(video.currentTime));

            const remainingTime = (video.duration || 0) - video.currentTime;

            // Auto trigger next song 0.5s before end
            if (remainingTime <= 0.5 && video.duration > 1 && !isLooping) {
              video.ontimeupdate = null; // prevent multiple triggers
              handleNext();
            }
          }
        };

        video.onended = () => {
          if (!isLooping) handleNext();
        };
      } catch (err) {
        setPlaybackError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (hls) hls.destroy();
      const video = videoRef.current;
      if (video) {
        video.ontimeupdate = null;
        video.onended = null;
        video.onloadedmetadata = null;
      }
    };
  }, [selectedSong, streamUrls, isLooping]);

  // Volume control
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Show 403 error toast if current song can't be streamed
  useEffect(() => {
    if (streamError && selectedSong && streamError.songId === selectedSong._id) {
      const toastId = `stream-error-${selectedSong._id}`;
      toast.warning(streamError.message, {
        id: toastId,
        duration: 5000,
      });
      setPlaybackError(streamError.message);
    }
  }, [streamError?.songId]);

  const handleTogglePlay = async () => {
    const video = videoRef.current;
    if (!video || !currentSong) return;

    try {
      if (isPlaying) {
        await video.pause();
        dispatch(pause());
      } else {
        await video.play();
        dispatch(play());
      }
    } catch (err) {
      setPlaybackError(err.message);
    }
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
    dispatch(setSelectedSong(songs[nextIndex]));
    dispatch(play());
  };

  const handlePrev = () => {
    if (!currentSong || songs.length === 0) return;
    if (currentTime > 3) {
      handleSeekChange(0);
    } else {
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      dispatch(setSelectedSong(songs[prevIndex]));
      dispatch(play());
    }
  };

  const handleSeekChange = (val) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = val;
      dispatch(setCurrentTime(val));
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value) / 100;
    dispatch(setVolume(vol));
    if (isMuted && vol > 0) setIsMuted(false);
  };

  const handleLikeToggle = () => {
    if (currentSong?._id) dispatch(toggleLikeSong(currentSong._id));
  };

  if (!currentSong || songs.length === 0) {
    return null;
  }

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
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        ></div>

        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentSong?.coverImage}
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
                {streamError?.songId === currentSong?._id ? (
                  <FaLock className="text-sm text-white" />
                ) : isLoading ? (
                  <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
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
          src={currentSong?.coverImage}
          className="w-64 h-64 object-contain rounded-lg shadow-lg mt-6 mb-8"
          alt="Album cover"
        />

        <div className="w-full flex justify-between items-center">
          <marquee className="w-[90%] text-lg font-bold" scrollamount="6">
            {currentSong?.title} - {currentSong?.singer}
          </marquee>
          <button onClick={handleLikeToggle}>
            {isLiked ? (
              <BsHeartFill className="text-xl text-red-500" />
            ) : (
              <BsHeart className="text-xl text-gray-400" />
            )}
          </button>
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
          <IoMdShuffle 
            className="text-3xl cursor-pointer" 
            onClick={handleFeatureSoon}
          />
          <RiSkipLeftFill 
            className="text-3xl cursor-pointer" 
            onClick={handlePrev} 
          />
          <div className="play-pause-wrapper-mobile shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
            <button
              className="play-pause-button-mobile flex justify-center items-center gap-2"
              onClick={handleTogglePlay}
            >
              {streamError?.songId === currentSong?._id ? (
                <FaLock className="text-lg text-white" />
              ) : isLoading ? (
                <div className="spinner h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <FaPause className="text-lg" />
              ) : (
                <FaPlay className="text-lg" />
              )}
            </button>
          </div>
          <RiSkipRightFill 
            className="text-3xl cursor-pointer" 
            onClick={handleNext} 
          />
          <IoIosInfinite
            className={`text-3xl cursor-pointer ${
              isLooping ? "text-blue-500" : "text-gray-400"
            }`}
            onClick={() => setIsLooping(!isLooping)}
          />
        </div>

        <div className="w-full mt-8 flex items-center gap-3">
          <button onClick={handleToggleMute}>
            {isMuted ? (
              <RiVolumeMuteFill className="text-xl text-gray-400" />
            ) : (
              <RiVolumeUpFill className="text-xl" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${
                volume * 100
              }%, #d1d5db ${volume * 100}%)`,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default MobilePlayer;