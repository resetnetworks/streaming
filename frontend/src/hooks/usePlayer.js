// hooks/usePlayer.js
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Hls from "hls.js";
import { fetchStreamUrl } from "../features/stream/streamSlice";
import {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  clearPlaybackContext,
  setRandomDefaultFromSongs,
} from "../features/playback/playerSlice";
import { toggleLikeSong } from "../features/auth/authSlice";
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
import { selectLikedSongIds } from "../features/auth/authSelectors";

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
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const volume = useSelector((state) => state.player.volume);
  const streamUrls = useSelector((state) => state.stream.urls);
  const streamLoading = useSelector((state) => state.stream.loading);
  const streamError = useSelector((state) => state.stream.error);
  const likedSongIds = useSelector(selectLikedSongIds);

  // Local state
  const [playbackError, setPlaybackError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Refs
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // Computed values
  const currentSong = displaySong;
  const contextSongs = playbackContextSongs.length > 0 
    ? playbackContextSongs 
    : songs;
  
  const currentIndex = currentSong
    ? contextSongs.findIndex((s) => s._id === currentSong._id)
    : -1;

  const nextSongs = currentIndex !== -1
    ? contextSongs.slice(currentIndex + 1, currentIndex + 5)
    : contextSongs.slice(0, 4);

  const isLiked = currentSong ? likedSongIds.includes(currentSong._id) : false;

  // Effects
  useEffect(() => {
    if (!hasPersistentDefault && songs.length > 0) {
      dispatch(setRandomDefaultFromSongs(songs));
    }
  }, [hasPersistentDefault, songs.length, dispatch]);

  useEffect(() => {
    if (playbackContext.type !== 'all' && currentSong && playbackContextSongs.length > 0) {
      const songInContext = playbackContextSongs.some(song => song._id === currentSong._id);
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
            ? selectedSong.duration || 0
            : video.duration;
          dispatch(setDuration(safeDuration));
        };

        video.ontimeupdate = () => {
          if (!isNaN(video.currentTime)) {
            dispatch(setCurrentTime(video.currentTime));
            const remainingTime = (video.duration || 0) - video.currentTime;
            if (remainingTime <= 0.5 && video.duration > 1) {
              video.ontimeupdate = null;
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
  }, [selectedSong, streamUrls]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Event handlers
  const handleTogglePlay = async () => {
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
    if (!currentSong || contextSongs.length === 0) return;
    const nextIndex = (currentIndex + 1) % contextSongs.length;
    dispatch(setSelectedSong(contextSongs[nextIndex]));
    dispatch(play());
  };

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

  const handleNextSongClick = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  // Return everything needed by UI
  return {
    // Refs
    videoRef,
    
    // State
    currentSong,
    isPlaying,
    currentTime,
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
    handleVolumeChange,
    handleLikeToggle,
    handleNextSongClick,
  };
};