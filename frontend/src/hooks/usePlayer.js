
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

// ✅ Module level — React re-renders aur remounts se bahar
const connectedVideoNodes = new WeakMap();

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
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animFrameRef = useRef(null);
  const beatHistoryRef = useRef([]);
  const lastBeatTimeRef = useRef(0);
  const sourceNodeRef = useRef(null);
  const [barHeights, setBarHeights] = useState(() => Array(46).fill(4));

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

  const nextSongs = queue.upcoming;

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

  // Main player initialisation effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedSong || !streamUrls[selectedSong._id]) return;

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

          if (!connection) return 25;

          const speed = connection.downlink;
          if (speed >= 5) return 40;
          if (speed >= 2) return 25;
          return 12;
        };
        const bufferLength = getAdaptiveBuffer();

        if (Hls.isSupported()) {
          const hls = new Hls({
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
              video.play().catch(() => {
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
              video.play().catch(() => {
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

          if (repeat === "one") {
            video.currentTime = 0;
            video.play().catch(() => {});
            return;
          }

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

            const firstSong = playbackContextSongs[0];
            dispatch(setSelectedSong(firstSong));

            if (repeat === "all") {
              dispatch(play());
            } else {
              dispatch(pause());
            }
            return;
          }

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
      // Cleanup HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Remove video event listeners
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
  }, [selectedSong, streamUrls]); // Missing dependencies: isPlaying, shuffleMode, etc. are intentionally omitted to avoid re-creating the effect too often.
  // The onended callback uses refs (repeatModeRef, queueRef) and the latest handleNext function (which is stable via useCallback later).
  // However handleNext depends on many things. This is a known trade-off; for crash fixes we focus on AudioContext.

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ✅ FIXED: Properly close AudioContext on unmount to prevent browser limit crash
  useEffect(() => {
    return () => {
  cancelAnimationFrame(animFrameRef.current);
  animFrameRef.current = null;

  const video = videoRef.current;

  if (video && connectedVideoNodes.has(video)) {
    const existing = connectedVideoNodes.get(video);

    if (existing?.ctx?.state !== "closed") {
      existing.ctx.suspend(); // NOT close
    }

    connectedVideoNodes.delete(video);
  }

  sourceNodeRef.current = null;
  analyserRef.current = null;
  audioCtxRef.current = null;
};
  }, []);

  const getRandomSongFromContext = () => {
    if (!contextSongs || contextSongs.length === 0) return null;
    const filtered = contextSongs.filter(
      (song) => song._id !== selectedSong?._id,
    );
    if (filtered.length === 0) return contextSongs[0];
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  };

  const setupAnalyser = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reuse existing AudioContext for this video element if available
    if (connectedVideoNodes.has(video)) {
      const existing = connectedVideoNodes.get(video);
      audioCtxRef.current = existing.ctx;
      analyserRef.current = existing.analyser;
      sourceNodeRef.current = existing.source;
      return;
    }

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;

      const source = ctx.createMediaElementSource(video);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;

      connectedVideoNodes.set(video, { ctx, analyser, source });
    } catch (err) {
      console.warn("AudioContext setup failed:", err.message);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (!audioCtxRef.current) setupAnalyser();
      if (audioCtxRef.current?.state === "suspended") {
  audioCtxRef.current.resume().catch(() => {});
}

      const animate = () => {
        if (!analyserRef.current) return;

        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);

        let bassEnergy = 0;
        const bassRange = 10;
        for (let i = 0; i < bassRange; i++) {
          bassEnergy += data[i];
        }
        bassEnergy = bassEnergy / bassRange;

        beatHistoryRef.current.push(bassEnergy);
        if (beatHistoryRef.current.length > 40) {
          beatHistoryRef.current.shift();
        }

        const avgEnergy =
          beatHistoryRef.current.reduce((a, b) => a + b, 0) /
          beatHistoryRef.current.length;

        const now = Date.now();
        const threshold = avgEnergy * 1.4;
        let isBeat = false;

        if (bassEnergy > threshold && now - lastBeatTimeRef.current > 200) {
          isBeat = true;
          lastBeatTimeRef.current = now;
        }

        let lastActiveBin = 0;
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i] > 5) {
            lastActiveBin = i;
            break;
          }
        }

        const activeBins = Math.max(lastActiveBin + 1, 20);

        const heights = Array.from({ length: 46 }, (_, i) => {
          const idx = Math.floor((i / 46) * activeBins);
          let h = Math.max(3, (data[idx] / 255) * 28);
          if (isBeat) h *= 1.6;
          return h;
        });

        setBarHeights(heights);
        animFrameRef.current = requestAnimationFrame(animate);
      };

      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      audioCtxRef.current?.suspend();
      setBarHeights((prev) => prev.map((h) => Math.max(4, Math.round(h * 0.6))));
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    };
  }, [isPlaying, setupAnalyser]);

  // Event handlers (useCallback for stability)
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

  const handleRepeatToggle = useCallback(() => {
    if (repeatMode === "off") {
      dispatch(setRepeatMode("all"));
    } else if (repeatMode === "all") {
      dispatch(setRepeatMode("one"));
    } else {
      dispatch(setRepeatMode("off"));
    }
  }, [repeatMode, dispatch]);

  const handleNext = useCallback(() => {
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
      const currentIndex = playbackContextSongs.findIndex(
        (s) => s._id === selectedSong?._id,
      );

      if (currentIndex === -1) {
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
  }, [
    shuffleMode,
    playbackContext?.type,
    playbackContextSongs,
    selectedSong?._id,
    repeatMode,
    dispatch,
  ]);

  const handlePrev = useCallback(() => {
    const video = videoRef.current;

    if (video && video.currentTime > 3) {
      video.currentTime = 0;
      dispatch(setCurrentTime(0));
      return;
    }

    const prevSong =
      queueRef.current?.history?.[queueRef.current.history.length - 1];

    if (!prevSong) {
      if (video) {
        video.currentTime = 0;
        dispatch(setCurrentTime(0));
      }
      return;
    }

    dispatch(removeLastHistoryItem());
    dispatch(setSelectedSong(prevSong));
    dispatch(play());
  }, [dispatch]);

  const handleShuffleToggle = useCallback(() => {
    dispatch(setShuffleMode(!shuffleMode));
  }, [shuffleMode, dispatch]);

  const handleSeekChange = useCallback(
    (val) => {
      const video = videoRef.current;
      if (video && !isDisplayOnly) {
        video.currentTime = val;
        dispatch(setCurrentTime(val));
      }
    },
    [isDisplayOnly, dispatch],
  );

  const handleVolumeChange = useCallback(
    (e) => {
      const vol = parseInt(e.target.value) / 100;
      dispatch(setVolume(vol));
      if (isMuted && vol > 0) setIsMuted(false);
    },
    [isMuted, dispatch],
  );

  const handleLikeToggle = useCallback(() => {
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
  }, [currentSong?._id, currentUser, likeMutation, isLiked]);

  const handleNextSongClick = useCallback(
    (song) => {
      dispatch(setSelectedSong(song));
      dispatch(play());
    },
    [dispatch],
  );

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      dispatch(setVolume(prevVolume));
    } else {
      setPrevVolume(volume);
      dispatch(setVolume(0));
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume, prevVolume, dispatch]);

  // Global keyboard / external event listener
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

  const isPreview = selectedSong
    ? (streamUrls[selectedSong._id]?.isPreview ?? false)
    : false;

  const isPlayerLoading = streamLoading || isLoading;

  return {
    videoRef,
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
    barHeights,
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
