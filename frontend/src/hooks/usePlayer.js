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
  const likeMutation = useLikeSong();
  const { data } = useLikedSongs(20);
  const currentUser = useSelector((state) => state.auth.user);

  // Local state
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Refs
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

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
      if (!songInContext) {
        dispatch(clearPlaybackContext());
      }
    }
  }, [currentSong?._id, playbackContext.type, playbackContextSongs, dispatch]);

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

        video.onended = () => {
          if (queueRef.current.upcoming.length > 0) {
            handleNext();
            return;
          }

          // ✅ album finished
          if (
            playbackContext?.type === "album" &&
            playbackContextSongs.length > 0
          ) {
            const firstSong = playbackContextSongs[0];
            const nextSongs = playbackContextSongs.slice(1);

            dispatch(setSelectedSong(firstSong));

            // refill queue
            nextSongs.forEach((song) => {
              dispatch(addToQueue(song));
            });

            dispatch(pause());
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
      if (hls) hls.destroy();
      const video = videoRef.current;
      if (video) {
        video.ontimeupdate = null;
        video.onended = null;
        video.onloadedmetadata = null;
      }
    };
  }, [selectedSong, streamUrls]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
        await video.play();
        dispatch(play());
      }
    } catch (err) {
      setPlaybackError(err.message);
    }
  }, [isPlaying, isDisplayOnly, defaultSong, selectedSong, dispatch]);

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

    // 1️⃣ Queue has songs
    if (queueNext) {
      dispatch(setSelectedSong(queueNext));
      dispatch(removeFirstQueueItem());
      dispatch(play());
      return;
    }

    // 2️⃣ Album / playlist context
    if (playbackContext?.type !== "all" && playbackContextSongs?.length > 0) {
      const currentIndex = playbackContextSongs.findIndex(
        (s) => s._id === selectedSong?._id,
      );

      const nextIndex = currentIndex + 1;

      // Album finished → restart
      if (nextIndex >= playbackContextSongs.length) {
        const firstSong = playbackContextSongs[0];
        dispatch(setSelectedSong(firstSong));
        dispatch(play());
        return;
      }

      const nextSong = playbackContextSongs[nextIndex];
      dispatch(setSelectedSong(nextSong));
      dispatch(play());
      return;
    }

    // 3️⃣ No queue and no context
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
    selectedSong,

    // Handlers
    handleTogglePlay,
    handleToggleMute,
    handleNext,
    handlePrev,
    handleSeekChange,
    handleLikeToggle,
    handleVolumeChange,
    handleNextSongClick,
  };
};
