// hooks/usePlayer.js
import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Hls from "hls.js";
import { useSongStreamUrl } from "./api/useStreamUrl";
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
  const currentUser = useSelector((state) => state.auth.user);

  const { data: streamData, isLoading: streamLoading, error: streamError } = useSongStreamUrl(
    selectedSong?._id,
    { enabled: !!selectedSong?._id }
  );
  const repeatMode = useSelector((state) => state.player.repeatMode);
  const shuffleMode = useSelector((state) => state.player.shuffleMode);
  const likeMutation = useLikeSong();
  const { data } = useLikedSongs(20);

  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isBuffering, setIsBuffering] = useState(false);

  const repeatModeRef = useRef(repeatMode);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const queueRef = useRef(queue);
  const isDraggingRef = useRef(false);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  const currentSong = displaySong;
  const contextSongs = playbackContextSongs.length > 0 ? playbackContextSongs : songs;
  const nextSongs = queue.upcoming;

  const likedSongs = data?.pages?.flatMap((page) => page.songs) || [];
  const isLiked = currentSong
    ? likedSongs.some((song) => song._id === currentSong._id)
    : false;

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
  }, [currentSong?._id, playbackContext.type, playbackContextSongs, queue.upcoming.length, dispatch]);

  // Main player initialisation effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedSong || !streamData?.url) return;

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

        const streamUrl = streamData?.url;
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

          hls.on(Hls.Events.MEDIA_ATTACHED, () => { hls.loadSource(mediaUrl); });

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
          if (!isDraggingRef.current && !isNaN(video.currentTime)) {
            dispatch(setCurrentTime(video.currentTime));
          }
        };

        video.onwaiting = () => { setIsBuffering(true); };
        video.onplaying = () => {
          setIsBuffering(false);
          setIsLoading(false);
          dispatch(play());
        };
        video.oncanplaythrough = () => { setIsBuffering(false); };

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
          if (playbackContext?.type !== "all" && playbackContextSongs.length > 0) {
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
              video.currentTime = 0;
              dispatch(setCurrentTime(0));
              dispatch(pause());
            }
            return;
          }
          video.currentTime = 0;
          dispatch(setCurrentTime(0));
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
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
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
  }, [selectedSong, streamData]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const getRandomSongFromContext = () => {
    if (!contextSongs || contextSongs.length === 0) return null;
    const filtered = contextSongs.filter((song) => song._id !== selectedSong?._id);
    if (filtered.length === 0) return contextSongs[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
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

  const handleRepeatToggle = useCallback(() => {
    if (repeatMode === "off") dispatch(setRepeatMode("all"));
    else if (repeatMode === "all") dispatch(setRepeatMode("one"));
    else dispatch(setRepeatMode("off"));
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
        const existingIds = new Set(queueRef.current?.upcoming?.map((s) => s._id) || []);
        remainingSongs
          .filter((song) => !existingIds.has(song._id))
          .forEach((song) => dispatch(addToQueue(song)));
        dispatch(play());
        return;
      }
      const nextIndex = currentIndex + 1;
      if (nextIndex >= playbackContextSongs.length) {
        const firstSong = playbackContextSongs[0];
        dispatch(setSelectedSong(firstSong));
        if (repeatMode === "all") dispatch(play());
        else dispatch(pause());
        return;
      }
      dispatch(setSelectedSong(playbackContextSongs[nextIndex]));
      dispatch(play());
      return;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      dispatch(setCurrentTime(0));
    }
    dispatch(pause());
  }, [shuffleMode, playbackContext?.type, playbackContextSongs, selectedSong?._id, repeatMode, dispatch]);

  const handlePrev = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime > 3) {
      video.currentTime = 0;
      dispatch(setCurrentTime(0));
      return;
    }
    const prevSong = queueRef.current?.history?.[queueRef.current.history.length - 1];
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

  const handleSeekStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleSeeking = useCallback((val) => {
    if (!isDisplayOnly) {
      dispatch(setCurrentTime(val)); // only UI update
    }
  }, [isDisplayOnly, dispatch]);

  const handleSeekCommit = useCallback((val) => {
    const video = videoRef.current;
    if (video && !isDisplayOnly) {
      video.currentTime = val;
      dispatch(setCurrentTime(val));
    }
    isDraggingRef.current = false;
  }, [isDisplayOnly, dispatch]);

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
        toast.success(isLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
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
    [dispatch]
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

  useEffect(() => {
    const handler = (e) => {
      const action = e.detail?.action;
      const video = videoRef.current;
      if (action === "pause") {
        if (video) { video.pause(); dispatch(pause()); }
      } else if (action === "play") {
        if (video) { video.play().catch(() => {}); dispatch(play()); }
      } else {
        handleTogglePlay();
      }
    };
    window.addEventListener("toggle-playback", handler);
    return () => window.removeEventListener("toggle-playback", handler);
  }, [handleTogglePlay, dispatch]);

  const isPreview = selectedSong
    ? (streamData?.isPreview ?? false)
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
    handleTogglePlay,
    handleToggleMute,
    handleNext,
    handlePrev,
    handleSeekStart,
    handleSeeking,
    handleSeekCommit,
    handleLikeToggle,
    handleVolumeChange,
    handleNextSongClick,
    handleRepeatToggle,
    handleShuffleToggle,
  };
};