// hooks/usePlayer.js
import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Hls from "hls.js";
import { fetchStreamUrl } from "../features/stream/streamSlice";
import { toast } from "sonner";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  clearPlaybackContext,
  setRandomDefaultFromSongs,
  removeFirstQueueItem,
  removeLastHistoryItem,
  addToQueue,
  setRepeatMode,
  setShuffleMode,
} from "../features/playback/playerSlice";
import {
  selectAllSongs,
  selectSelectedSong,
  selectDefaultSong,
  selectDisplaySong,
  selectIsDisplayOnly,
  selectHasPersistentDefault,
  selectPlaybackContext,
  selectPlaybackContextSongs,
} from "../features/songs/songSelectors";
import { useLikeSong, useLikedSongs } from "./api/useSongs";

export const usePlayer = () => {
  const dispatch = useDispatch();

  // Selectors
  const songs = useSelector(selectAllSongs);
  const selectedSong = useSelector(selectSelectedSong);
  const defaultSong = useSelector(selectDefaultSong);
  const displaySong = useSelector(selectDisplaySong);
  const isDisplayOnly = useSelector(selectIsDisplayOnly);
  const hasPersistentDefault = useSelector(selectHasPersistentDefault);
  const playbackContext = useSelector(selectPlaybackContext);
  const playbackContextSongs = useSelector(selectPlaybackContextSongs);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const queue = useSelector((state) => state.player.queue);
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const volume = useSelector((state) => state.player.volume);
  const streamUrls = useSelector((state) => state.stream.urls);
  const streamLoading = useSelector((state) => state.stream.loading);
  const streamError = useSelector((state) => state.stream.error);
  const currentUser = useSelector((state) => state.auth.user);
  const repeatMode = useSelector((state) => state.player.repeatMode);
  const shuffleMode = useSelector((state) => state.player.shuffleMode);
  const likeMutation = useLikeSong();
  const { data } = useLikedSongs(20);

  // Local state
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isBuffering, setIsBuffering] = useState(false);
  const repeatModeRef = useRef(repeatMode);

  // Refs
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Computed values
  const currentSong = displaySong;
  const contextSongs =
    playbackContextSongs.length > 0 ? playbackContextSongs : songs;

  const currentIndex = currentSong
    ? contextSongs.findIndex((s) => s._id === currentSong._id)
    : -1;

  const nextSongs = queue.upcoming.slice(0, 4);

  const likedSongs = data?.pages?.flatMap((page) => page.songs) || [];
  const isLiked = currentSong
    ? likedSongs.some((song) => song._id === currentSong._id)
    : false;

  // Effects
  useEffect(() => {
    if (!hasPersistentDefault && songs.length > 0) {
      dispatch(setRandomDefaultFromSongs(songs));
    }
  }, [hasPersistentDefault, songs.length, dispatch]);

  useEffect(() => {
    if (
      playbackContext.type !== "all" &&
      currentSong &&
      playbackContextSongs.length > 0
    ) {
      const songInContext = playbackContextSongs.some(
        (song) => song._id === currentSong._id,
      );

      // ✅ Sirf tab clear karo jab queue bhi empty ho
      // Queue mein songs hain matlab intentionally bahar gaye hain
      if (!songInContext && queue.upcoming.length === 0) {
        dispatch(clearPlaybackContext());
      }
    }
  }, [
    currentSong?._id,
    playbackContext.type,
    playbackContextSongs,
    queue.upcoming.length,
    dispatch,
  ]);

  useEffect(() => {
    if (selectedSong && !streamUrls[selectedSong._id]) {
      dispatch(fetchStreamUrl(selectedSong._id));
    }
  }, [selectedSong, streamUrls, dispatch]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedSong || !streamUrls[selectedSong._id]) return;

    let hls;
    const initPlayer = async () => {
      try {
        setIsLoading(true);
        setPlaybackError(null);
        dispatch(setCurrentTime(0));
        dispatch(setDuration(0));

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        const streamUrl = streamUrls[selectedSong._id]?.url;
        const mediaUrl = `${streamUrl}?nocache=${Date.now()}`;

        const getAdaptiveBuffer = () => {
          const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

          if (!connection) return 25; // default buffer length

          const speed = connection.downlink;
          if (speed >= 5) return 40; // fast connection
          if (speed >= 2) return 25; // average connection
          return 12; // slow connection
        };
        const bufferLength = getAdaptiveBuffer();
        // console.log("Adaptive Buffer Length:", bufferLength);
        // console.log("Network Downlink:", navigator.connection?.downlink);

        if (Hls.isSupported()) {
          hls = new Hls({
            maxBufferLength: bufferLength,
            maxMaxBufferLength: bufferLength * 2,
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
          const mediaDuration = video.duration;

          if (!isNaN(mediaDuration) && mediaDuration > 0) {
            dispatch(setDuration(mediaDuration));
          } else {
            dispatch(setDuration(selectedSong?.duration || 0));
          }
        };

        video.ontimeupdate = () => {
          if (!isNaN(video.currentTime)) {
            dispatch(setCurrentTime(video.currentTime));
          }
        };

        video.onwaiting = () => {
          setIsBuffering(true);
        };

        video.onplaying = () => {
          setIsBuffering(false);
          setIsLoading(false);
          dispatch(play());
        };

        video.oncanplaythrough = () => {
          setIsBuffering(false);
        };

        video.onended = () => {
          const repeat = repeatModeRef.current;
          // 🔁 repeat one
          if (repeatModeRef.current === "one") {
            video.currentTime = 0;
            video.play().catch(() => {});
            return;
          }

          // ▶ queue priority
          if (!shuffleMode && queueRef.current.upcoming.length > 0) {
  handleNext();
  return;
}

          if (shuffleMode) {
  const randomSong = getRandomSongFromContext();

  if (randomSong) {
    dispatch(setSelectedSong(randomSong));
    dispatch(play());
    return;
  }
}

          // 📀 playlist / album logic

          if (
            playbackContext?.type !== "all" &&
            playbackContextSongs.length > 0
          ) {
            const currentIndex = playbackContextSongs.findIndex(
              (s) => s._id === selectedSong?._id,
            );

            const nextIndex = currentIndex + 1;

            if (nextIndex < playbackContextSongs.length) {
              dispatch(setSelectedSong(playbackContextSongs[nextIndex]));
              dispatch(play());
              return;
            }

            // album finished
            const firstSong = playbackContextSongs[0];

            dispatch(setSelectedSong(firstSong));

            if (repeat === "all") {
              dispatch(play());
            } else {
              dispatch(pause());
            }

            return;
          }

          // ⏹ default stop
          dispatch(pause());
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
        video.onwaiting = null;
        video.onplaying = null;
        video.oncanplaythrough = null;
      }
    };
  }, [selectedSong, streamUrls]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const getRandomSongFromContext = () => {
  if (!contextSongs || contextSongs.length === 0) return null;

  const filtered = contextSongs.filter(
    (song) => song._id !== selectedSong?._id
  );

  if (filtered.length === 0) return contextSongs[0];

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

  // Event handlers
  const handleTogglePlay = useCallback(async () => {
    const video = videoRef.current;

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
        setIsBuffering(true);

        await video.play();
      }
    } catch (err) {
      setPlaybackError(err.message);
    }
  }, [isPlaying, isDisplayOnly, defaultSong, selectedSong, dispatch]);

  const handleRepeatToggle = () => {
    if (repeatMode === "off") {
      dispatch(setRepeatMode("all"));
    } else if (repeatMode === "all") {
      dispatch(setRepeatMode("one"));
    } else {
      dispatch(setRepeatMode("off"));
    }
  };

  // ✅ Global event listener
  useEffect(() => {
    const handler = (e) => {
      const action = e.detail?.action;
      const video = videoRef.current;

      if (action === "pause") {
        if (video) {
          video.pause();
          dispatch(pause());
        }
      } else if (action === "play") {
        if (video) {
          video.play().catch(() => {});
          dispatch(play());
        }
      } else {
        handleTogglePlay();
      }
    };
    window.addEventListener("toggle-playback", handler);
    return () => window.removeEventListener("toggle-playback", handler);
  }, [handleTogglePlay, dispatch]);

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
    const queueNext = queueRef.current?.upcoming?.[0];

    if (!shuffleMode && queueNext) {
  dispatch(setSelectedSong(queueNext));
  dispatch(removeFirstQueueItem());
  dispatch(play());
  return;
}

    if (shuffleMode) {
    const randomSong = getRandomSongFromContext();

    if (randomSong) {
      dispatch(setSelectedSong(randomSong));
      dispatch(play());
      return;
    }
  }

    if (playbackContext?.type !== "all" && playbackContextSongs?.length > 0) {
      // ✅ selectedSong album mein nahi mila (queue se aaya tha)
      // toh album ke first track pe wapas jao
      const currentIndex = playbackContextSongs.findIndex(
        (s) => s._id === selectedSong?._id,
      );

      if (currentIndex === -1) {
        // Queue wala song tha, album restart karo
        const firstSong = playbackContextSongs[0];
        const remainingSongs = playbackContextSongs.slice(1);
        dispatch(setSelectedSong(firstSong));
        remainingSongs.forEach((song) => dispatch(addToQueue(song)));
        dispatch(play());
        return;
      }

      const nextIndex = currentIndex + 1;

      if (nextIndex >= playbackContextSongs.length) {
        const firstSong = playbackContextSongs[0];

        dispatch(setSelectedSong(firstSong));

        if (repeatMode === "all") {
          dispatch(play());
        } else {
          dispatch(pause());
        }

        return;
      }

      dispatch(setSelectedSong(playbackContextSongs[nextIndex]));
      dispatch(play());
      return;
    }

    dispatch(pause());
  };

  const handlePrev = () => {
    const video = videoRef.current;

    // 1️⃣ restart current song if played more than 3 seconds
    if (video && video.currentTime > 3) {
      video.currentTime = 0;
      dispatch(setCurrentTime(0));
      return;
    }

    const prevSong =
      queueRef.current?.history?.[queueRef.current.history.length - 1];

    // 2️⃣ no history
    if (!prevSong) {
      if (video) {
        video.currentTime = 0;
        dispatch(setCurrentTime(0));
      }
      return;
    }

    // 3️⃣ play previous song
    dispatch(removeLastHistoryItem());
    dispatch(setSelectedSong(prevSong));
    dispatch(play());
  };

  const handleShuffleToggle = () => {
  dispatch(setShuffleMode(!shuffleMode));
};

  const handleSeekChange = (val) => {
    const video = videoRef.current;
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
    if (!currentSong?._id) return;

    if (!currentUser) {
      toast.error("You must be logged in to like songs");
      return;
    }

    likeMutation.mutate(currentSong._id, {
      onSuccess: () => {
        toast.success(
          isLiked ? "Removed from Liked Songs" : "Added to Liked Songs",
        );
      },
      onError: () => {
        toast.error("Failed to update like");
      },
    });
  };

  const handleNextSongClick = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const isPreview = selectedSong
    ? (streamUrls[selectedSong._id]?.isPreview ?? false)
    : false;

  const isPlayerLoading = streamLoading || isLoading;

  // Return everything needed by UI
  return {
    // Refs
    videoRef,

    // State
    currentSong,
    isPlaying,
    currentTime,
    isPreview,
    duration,
    volume,
    isMuted,
    isLoading,
    playbackError,
    streamError,
    isDisplayOnly,
    isLiked,
    nextSongs,
    isPlayerLoading,
    selectedSong,
    repeatMode,
    shuffleMode,

    // Handlers
    handleTogglePlay,
    handleToggleMute,
    handleNext,
    handlePrev,
    handleSeekChange,
    handleLikeToggle,
    handleVolumeChange,
    handleNextSongClick,
    handleRepeatToggle,
    handleShuffleToggle,
  };
};
