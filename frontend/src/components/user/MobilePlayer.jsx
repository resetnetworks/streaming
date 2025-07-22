import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useSelector, useDispatch } from "react-redux";
import { fetchStreamUrl } from "../../features/stream/streamSlice";
import { selectAllSongs, selectSelectedSong } from "../../features/songs/songselectors";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
} from "../../features/playback/playerSlice";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { formatDuration } from "../../utills/helperFunctions";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { RiSkipLeftFill, RiSkipRightFill } from "react-icons/ri";
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
  const streamUrls = useSelector((state) => state.stream.urls);
  const streamLoading = useSelector((state) => state.stream.loading);
  const streamError = useSelector((state) => state.stream.error);
  
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = selectedSong ? likedSongIds.includes(selectedSong._id) : false;

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isArtworkExpanded, setIsArtworkExpanded] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const artworkRef = useRef(null);

  const currentSong = selectedSong || songs[0] || null;
  const currentIndex = currentSong ? songs.findIndex((s) => s._id === currentSong._id) : -1;

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
            video.currentTime = currentTime || 0;
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

  const handleLikeToggle = () => {
    if (currentSong?._id) dispatch(toggleLikeSong(currentSong._id));
  };

  const toggleArtworkSize = () => {
    setIsArtworkExpanded(!isArtworkExpanded);
  };

  if (!currentSong || songs.length === 0) {
    return null;
  }

  return (
    <>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Mini Player - Remains unchanged */}
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

      {/* Enhanced Full Player with DJ/Night Club Theme */}
     {/* Full Player with Blue & Black Theme */}
<div
  className={`fixed inset-0 z-50 bg-gradient-to-br from-black via-blue-900 to-black text-white flex flex-col items-center px-4 py-6 transition-transform duration-500 ease-in-out transform ${
    isFullPlayerOpen ? "translate-y-0" : "translate-y-full"
  }`}
>
  {/* Glowing blue border effect */}
  <div
    className="absolute inset-0 border-8 border-transparent animate-pulse pointer-events-none"
    style={{
      boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.5)", // blue-500
    }}
  ></div>

  {/* Header */}
  <div className="flex w-full justify-between items-center mb-4">
    <button
      onClick={() => setIsFullPlayerOpen(false)}
      className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
    >
      <IoIosArrowDown className="text-xl" />
    </button>

    <div className="text-center flex-1 px-4">
      <div className="text-sm font-medium text-blue-400">NOW PLAYING</div>
      <div className="text-lg font-bold truncate max-w-xs mx-auto">
        {currentSong?.title}
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
    className={`relative ${isArtworkExpanded ? "w-72 h-72" : "w-64 h-64"} rounded-full border-4 border-blue-500 shadow-lg transition-all duration-500 mb-8 overflow-hidden cursor-pointer`}
    onClick={toggleArtworkSize}
    style={{
      boxShadow: "0 0 30px rgba(59, 130, 246, 0.7)",
      background:
        "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)",
    }}
  >
    <img
      src={currentSong?.coverImage}
      className="w-full h-full object-cover"
      alt="Album cover"
    />

    {/* Equalizer */}
    {isPlaying && (
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent flex justify-center items-end gap-1 px-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-2 bg-blue-400 rounded-t-sm"
            style={{
              height: `${Math.random() * 100}%`,
              animation: `equalizer 1s infinite ${i * 0.1}s alternate`,
            }}
          ></div>
        ))}
      </div>
    )}
  </div>

  {/* Song Info */}
  <div className="w-full text-center mb-6">
    <h2 className="text-2xl font-bold truncate px-10">
      {currentSong?.title}
    </h2>
    <p className="text-blue-300">{currentSong?.singer}</p>
  </div>

  {/* Progress Bar */}
  <div className="w-full px-4 mb-6">
    <div className="relative h-3 mb-2 group">
      <div className="absolute inset-0 bg-gray-800 rounded-full overflow-hidden"></div>
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
        style={{
          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
        }}
      ></div>
      <div
        className="absolute top-0 left-0 h-full w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: "0 0 10px rgba(59,130,246,0.7)",
          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
        }}
      ></div>
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
      />
    </div>
    <div className="flex justify-between text-xs text-gray-400">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>

  {/* Controls */}
  <div className="w-full max-w-md">
    <div className="flex justify-between items-center px-6">
      <button
        onClick={handleFeatureSoon}
        className="p-3 text-gray-400 hover:text-white transition-colors"
      >
        <IoMdShuffle className="text-2xl" />
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
      >
        {streamError?.songId === currentSong?._id ? (
          <FaLock className="text-xl text-white" />
        ) : isLoading ? (
          <div className="spinner h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : isPlaying ? (
          <FaPause className="text-xl" />
        ) : (
          <FaPlay className="text-xl" />
        )}
      </button>

      <button
        onClick={handleNext}
        className="p-4 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
      >
        <RiSkipRightFill className="text-3xl" />
      </button>

      <button
        onClick={() => setIsLooping(!isLooping)}
        className={`p-3 transition-colors ${
          isLooping ? "text-blue-500" : "text-gray-400"
        }`}
      >
        <IoIosInfinite className="text-2xl" />
      </button>
    </div>
  </div>

  {/* Footer Visualizer */}
  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent flex justify-center items-end gap-1 px-4">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-blue-400 rounded-t-sm"
        style={{
          height: `${Math.random() * 100}%`,
          animation: `equalizer 1.5s infinite ${i * 0.05}s alternate`,
        }}
      ></div>
    ))}
  </div>

  {/* CSS Animation */}
  <style>{`
    @keyframes equalizer {
      0% { height: 10%; }
      100% { height: 100%; }
    }
  `}</style>
</div>

    </>
  );
};

export default MobilePlayer;