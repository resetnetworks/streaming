import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { useSelector, useDispatch } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
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
import {
  RiSkipLeftFill,
  RiSkipRightFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
} from "react-icons/ri";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosMore } from "react-icons/io";
import { FaPlay, FaPause, FaLock, FaRandom } from "react-icons/fa"; // ✅ ADDED FaRandom
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

const Player = () => {
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

  const [open, setOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // ✅ UPDATED: Use display song instead of selected song only
  const currentSong = displaySong;

  // ✅ UPDATED: Use context songs instead of all songs
  const contextSongs = playbackContextSongs.length > 0 
    ? playbackContextSongs 
    : songs; // fallback to all songs

  const currentIndex = currentSong
    ? contextSongs.findIndex((s) => s._id === currentSong._id)
    : -1;

  const nextSongs =
    currentIndex !== -1
      ? contextSongs.slice(currentIndex + 1, currentIndex + 5)
      : contextSongs.slice(0, 4);

  // NEW (✅)
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = currentSong ? likedSongIds.includes(currentSong._id) : false;

  // ✅ NEW: Set random default song if none exists on component mount
  useEffect(() => {
    if (!hasPersistentDefault && songs.length > 0) {
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
            if (remainingTime <= 0.5 && video.duration > 1) {
              video.ontimeupdate = null; // prevent multiple triggers
              handleNext();
            }
          }
        };

        video.onended = () => {
          handleNext();
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
  }, [selectedSong, streamUrls]); // ✅ Only depend on selectedSong, not displaySong

  // Volume control
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (
      streamError &&
      selectedSong &&
      streamError.songId === selectedSong._id
    ) {
      const toastId = `stream-error-${selectedSong._id}`;

      // This will ensure the toast shows only once for a specific song
      toast.warning(streamError.message, {
        id: toastId, // Sonner will auto-prevent duplicates by this ID
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

  // ✅ NEW: Handle next songs click
  const handleNextSongClick = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  // ✅ UPDATED: Show player even with just default song, no skeleton
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
    background: `linear-gradient(to right, #007aff ${
      volume * 100
    }%, #ffffff22 ${volume * 100}%)`,
  };

  return (
    <div className="player-wrapper">
      <video
        ref={videoRef}
        style={{ display: "none" }}
        muted={isMuted}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />

      <div className="player-card w-[15.25rem] py-4 px-4 flex flex-col items-center">
        
        <div className="w-full aspect-square overflow-hidden rounded-md">
          <img
            src={currentSong?.coverImage}
            className={`w-full h-full object-cover ${isDisplayOnly ? 'opacity-80' : ''}`}
            alt=""
          />
        </div>

        <p className="text-lg mt-2">{currentSong?.title}</p>
        <span className="text-sm text-gray-500">{currentSong?.singer}</span>

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

        <div className="w-full flex justify-between mt-4">
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button
              className="player-button flex justify-center items-center gap-2"
            >
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
          <RiSkipRightFill
            className="text-md text-white cursor-pointer"
            onClick={handleNext}
          />
          <IoIosMore
            className="text-md text-white"
            onClick={handleFeatureSoon}
          />
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

export default Player;