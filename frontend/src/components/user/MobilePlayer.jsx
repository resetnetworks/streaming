import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useSelector, useDispatch } from "react-redux";
import { fetchStreamUrl } from "../../features/stream/streamSlice";
import {
  selectAllSongs,
  selectSelectedSong,
  selectDefaultSong,
  selectDisplaySong,
  selectIsDisplayOnly,
  selectHasPersistentDefault, // ✅ NEW IMPORT
  selectPlaybackContext, // ✅ NEW IMPORT
  selectPlaybackContextSongs, // ✅ NEW IMPORT
} from "../../features/songs/songSelectors";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  clearPlaybackContext,
  setRandomDefaultFromSongs, // ✅ NEW IMPORT
} from "../../features/playback/playerSlice";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { formatDuration } from "../../utills/helperFunctions";
import { FaPlay, FaPause, FaLock, FaRandom } from "react-icons/fa"; // ✅ ADDED FaRandom
import { RiSkipLeftFill, RiSkipRightFill, RiVolumeUpFill, RiVolumeMuteFill } from "react-icons/ri";
import { IoIosArrowDown, IoIosInfinite, IoMdShuffle } from "react-icons/io";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { LuDna } from "react-icons/lu";
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
  
  // ✅ UPDATED: Enhanced selectors with persistent default functionality
  const defaultSong = useSelector(selectDefaultSong);
  const displaySong = useSelector(selectDisplaySong);
  const isDisplayOnly = useSelector(selectIsDisplayOnly);
  const hasPersistentDefault = useSelector(selectHasPersistentDefault); // ✅ NEW
  const playbackContext = useSelector(selectPlaybackContext);
  const playbackContextSongs = useSelector(selectPlaybackContextSongs);
  
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const volume = useSelector((state) => state.player.volume);
  const streamUrls = useSelector((state) => state.stream.urls);
  const streamLoading = useSelector((state) => state.stream.loading);
  const streamError = useSelector((state) => state.stream.error);
  
  const likedSongIds = useSelector(selectLikedSongIds);

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isArtworkExpanded, setIsArtworkExpanded] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const artworkRef = useRef(null);

  // ✅ UPDATED: Use display song instead of selected song only
  const currentSong = displaySong;
  const isLiked = currentSong ? likedSongIds.includes(currentSong._id) : false;

  // ✅ UPDATED: Use context songs instead of all songs
  const contextSongs = playbackContextSongs.length > 0 
    ? playbackContextSongs 
    : songs; // fallback to all songs

  const currentIndex = currentSong
    ? contextSongs.findIndex((s) => s._id === currentSong._id)
    : -1;

  // ✅ NEW: Set random default song if none exists on component mount
  useEffect(() => {
    if (!hasPersistentDefault && songs.length > 0) {
      console.log("No persistent default song found, setting random default from", songs.length, "songs");
      dispatch(setRandomDefaultFromSongs(songs));
    }
  }, [hasPersistentDefault, songs.length, dispatch]);

  // ✅ UPDATED: Smart Context Detection - Auto-exit when song doesn't belong to current context (SILENT)
  useEffect(() => {
    if (playbackContext.type !== 'all' && currentSong && playbackContextSongs.length > 0) {
      const songInContext = playbackContextSongs.some(song => song._id === currentSong._id);
      
      if (!songInContext) {
        // Song doesn't belong to current context, switch to library mode silently
        dispatch(clearPlaybackContext());
        console.log("Auto-switched to library playback - song not in current context");
      }
    }
  }, [currentSong?._id, playbackContext.type, playbackContextSongs, dispatch]);

  // ✅ UPDATED: Fetch stream URL only for selected songs (not default display songs)
  useEffect(() => {
    if (selectedSong && !streamUrls[selectedSong._id]) {
      dispatch(fetchStreamUrl(selectedSong._id));
    }
  }, [selectedSong, streamUrls, dispatch]);

  // ✅ UPDATED: Main HLS player initialization - Only for selected songs
  useEffect(() => {
    const video = videoRef.current;
    // ✅ Only initialize player for selected songs, not display-only songs
    if (!video || !selectedSong || !streamUrls[selectedSong._id]) return;

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
              if (selectedSong.audioUrl) {
                video.src = selectedSong.audioUrl;
                video.load();
              }
            }
          });

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(mediaUrl);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.currentTime = currentTime || 0; // ✅ restore last time
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
            ? selectedSong.duration || 0
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
  }, [selectedSong, streamUrls, isLooping]); // ✅ Only depend on selectedSong, not displaySong

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
        duration: 2000,
      });
      setPlaybackError(streamError.message);
    }
  }, [streamError?.songId]);

  // ✅ UPDATED: Handle play button with display-only mode
  const handleTogglePlay = async () => {
    const video = videoRef.current;
    
    // ✅ UPDATED: If display-only mode, make default song selected first
    if (isDisplayOnly && defaultSong) {
      console.log("Converting display-only song to selected song:", defaultSong.title);
      dispatch(setSelectedSong(defaultSong));
      dispatch(play());
      return;
    }
    
    if (!video || !selectedSong) return;

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

  // ✅ NEW: Handle random default song refresh
  const handleRefreshDefaultSong = () => {
    if (songs.length > 0) {
      dispatch(setRandomDefaultFromSongs(songs));
      toast.success("Default song refreshed!");
    }
  };

  // ✅ UPDATED: Use context songs for navigation
  const handleNext = () => {
    if (!currentSong || contextSongs.length === 0) return;
    const nextIndex = (currentIndex + 1) % contextSongs.length;
    dispatch(setSelectedSong(contextSongs[nextIndex]));
    dispatch(play());
  };

  // ✅ UPDATED: Use context songs for navigation
  const handlePrev = () => {
    if (!currentSong || contextSongs.length === 0) return;
    if (currentTime > 3) {
      handleSeekChange(0);
    } else {
      const prevIndex = (currentIndex - 1 + contextSongs.length) % contextSongs.length;
      dispatch(setSelectedSong(contextSongs[prevIndex]));
      dispatch(play());
    }
  };

  const handleSeekChange = (val) => {
    const video = videoRef.current;
    // ✅ Only allow seeking for selected songs, not display-only
    if (video && !isDisplayOnly) {
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

  const toggleArtworkSize = () => {
    setIsArtworkExpanded(!isArtworkExpanded);
  };

  // ✅ UPDATED: Show player even with just default song, no skeleton
  if (!currentSong) {
    return null;
  }

  const trackStyle = {
    background: `linear-gradient(to right, #007aff ${
      volume * 100
    }%, #ffffff22 ${volume * 100}%)`,
  };

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
                className={`w-12 h-12 rounded-md shadow-[0_0_5px_1px_#3b82f6] ${isDisplayOnly ? 'opacity-80' : ''}`}
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
          </div>
        </div>
        <div className="gradiant-line"></div>
      </div>

      {/* Enhanced Full Player with Blue & Black Theme */}
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
          className={`relative ${isArtworkExpanded ? "w-72 h-72" : "w-64 h-64"} rounded-xl border-4 border-blue-500 shadow-lg transition-all duration-500 mb-8 overflow-hidden cursor-pointer`}
          onClick={toggleArtworkSize}
          style={{
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.7)",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)",
          }}
        >
          <img
            src={currentSong?.coverImage}
            className={`w-full h-full object-cover ${isDisplayOnly ? 'opacity-80' : ''}`}
            alt="Album cover"
          />
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
              value={isDisplayOnly ? 0 : currentTime}
              onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
              className={`absolute w-full h-full opacity-0 cursor-pointer z-10 ${
                isDisplayOnly ? 'cursor-not-allowed' : ''
              }`}
              disabled={isDisplayOnly}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{isDisplayOnly ? "0:00" : formatTime(currentTime)}</span>
            <span>{formatTime(duration || currentSong?.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between items-center px-6">
            <button
              onClick={handleRefreshDefaultSong}
              className="p-3 text-gray-400 hover:text-blue-400 transition-colors"
              title="Refresh default song"
            >
              <FaRandom className="text-xl" />
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
              disabled={isLoading || (streamError?.songId === selectedSong?._id)}
            >
              {streamError?.songId === selectedSong?._id ? (
                <FaLock className="text-xl text-white" />
              ) : isLoading ? (
                <div className="spinner h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (isPlaying && !isDisplayOnly) ? (
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
