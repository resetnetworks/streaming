// src/utills/analytics/hooks/usePlayerAnalytics.js
import { useEffect, useRef, useCallback } from "react";
import { analytics } from "../analyticsClient.js";
import { EVENT_TYPES } from "../constants.js";

/**
 * Safely extracts entity ID from string or populated object.
 */
function extractEntityId(entity) {
  if (!entity) return undefined;
  if (typeof entity === "string") return entity.trim();
  if (typeof entity === "object") return entity._id || entity.id || undefined;
  return undefined;
}

/**
 * Custom player analytics hook.
 * Accurately tracks playback milestones, accumulated listening time (anti-scrubbing fraud),
 * pause/resume accuracy, completions, and skips.
 *
 * @param {Object} options
 * @param {Object} options.currentSong - Current active song object
 * @param {boolean} options.isPlaying - Whether audio is actively playing
 * @param {number} options.currentTime - Current playhead position in seconds
 * @param {number} options.duration - Total track duration in seconds
 * @param {boolean} options.isPreview - Whether playing in preview mode
 * @param {Object} options.playbackContext - Playback source context (playlist, album, etc.)
 */
export function usePlayerAnalytics({
  currentSong,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  isPreview = false,
  playbackContext = {},
}) {
  const songId = currentSong?._id ? String(currentSong._id) : null;

  // Track state for the currently active song
  const activeSongRef = useRef(null);
  const songDataRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const lastCurrentTimeRef = useRef(0);
  const milestonesRef = useRef({
    started: false,
    preview: false,
    thirtySeconds: false,
    fiftyPercent: false,
    completed: false,
  });

  // Keep latest values accessible in timer and callbacks
  const latestPropsRef = useRef({
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isPreview,
    playbackContext,
  });

  useEffect(() => {
    latestPropsRef.current = {
      currentSong,
      isPlaying,
      currentTime,
      duration,
      isPreview,
      playbackContext,
    };
    lastCurrentTimeRef.current = currentTime;
  }, [currentSong, isPlaying, currentTime, duration, isPreview, playbackContext]);

  /**
   * Helper to fire playback_skipped for a song that was abandoned/skipped before natural completion.
   */
  const fireSkippedEvent = useCallback((songData, accumulatedTime, lastTime) => {
    if (!songData?.songId) return;

    analytics.track(
      EVENT_TYPES.PLAYBACK_SKIPPED,
      {
        duration: songData.duration || 0,
        timeListened: Math.round(accumulatedTime * 10) / 10,
        skippedAt: Math.round(lastTime * 10) / 10,
        percentCompleted:
          songData.duration > 0
            ? Math.min(100, Math.round((accumulatedTime / songData.duration) * 100))
            : 0,
        playbackContext: songData.playbackContext?.type || "unknown",
        title: songData.title,
      },
      {
        songId: songData.songId,
        artistId: songData.artistId,
        albumId: songData.albumId,
      }
    );
  }, []);

  /**
   * Manual notification when a song ends naturally (video.onended).
   */
  const notifySongEnded = useCallback(() => {
    const songData = songDataRef.current;
    if (!songData?.songId || milestonesRef.current.completed) return;

    milestonesRef.current.completed = true;

    analytics.track(
      EVENT_TYPES.PLAYBACK_COMPLETED,
      {
        duration: latestPropsRef.current.duration || songData.duration || 0,
        timeListened: Math.round(accumulatedTimeRef.current * 10) / 10,
        completionRate: 100,
        playbackContext: latestPropsRef.current.playbackContext?.type || "unknown",
        title: songData.title,
      },
      {
        songId: songData.songId,
        artistId: songData.artistId,
        albumId: songData.albumId,
      }
    );
  }, []);

  /**
   * Checks whether accumulated listening or playhead progress triggered milestones.
   */
  const checkMilestones = useCallback(() => {
    const songData = songDataRef.current;
    if (!songData?.songId || milestonesRef.current.completed) return;

    const accumulated = accumulatedTimeRef.current;
    const { currentTime: curTime, duration: dur, playbackContext: pContext } = latestPropsRef.current;
    const effectiveDuration = dur || songData.duration || 0;

    // Milestone 1: playback_30s (Qualified play)
    // Strictly requires real elapsed listening time >= 30 seconds
    if (!milestonesRef.current.thirtySeconds && accumulated >= 30) {
      milestonesRef.current.thirtySeconds = true;

      analytics.track(
        EVENT_TYPES.PLAYBACK_30S,
        {
          duration: effectiveDuration,
          accumulatedTime: Math.round(accumulated * 10) / 10,
          currentTime: Math.round(curTime * 10) / 10,
          playbackContext: pContext?.type || "unknown",
          title: songData.title,
        },
        {
          songId: songData.songId,
          artistId: songData.artistId,
          albumId: songData.albumId,
        }
      );
    }

    // Milestone 2: playback_50_percent
    // Requires playhead at >= 50% and minimum real listening time (anti-scrub fraud protection)
    const halfDuration = effectiveDuration * 0.5;
    const minRealTime = Math.min(10, effectiveDuration * 0.2);

    if (
      !milestonesRef.current.fiftyPercent &&
      effectiveDuration > 0 &&
      curTime >= halfDuration &&
      accumulated >= minRealTime
    ) {
      milestonesRef.current.fiftyPercent = true;

      analytics.track(
        EVENT_TYPES.PLAYBACK_50_PERCENT,
        {
          duration: effectiveDuration,
          currentTime: Math.round(curTime * 10) / 10,
          accumulatedTime: Math.round(accumulated * 10) / 10,
          playbackContext: pContext?.type || "unknown",
          title: songData.title,
        },
        {
          songId: songData.songId,
          artistId: songData.artistId,
          albumId: songData.albumId,
        }
      );
    }
  }, []);

  /**
   * 1. Song Transition Handler
   * Finalizes previous song (if skipped) and resets tracking state for new song.
   */
  useEffect(() => {
    if (
      activeSongRef.current &&
      activeSongRef.current !== songId &&
      songDataRef.current &&
      !milestonesRef.current.completed &&
      (milestonesRef.current.started || accumulatedTimeRef.current > 0)
    ) {
      fireSkippedEvent(
        songDataRef.current,
        accumulatedTimeRef.current,
        lastCurrentTimeRef.current
      );
    }

    if (songId) {
      activeSongRef.current = songId;
      accumulatedTimeRef.current = 0;
      lastCurrentTimeRef.current = currentTime || 0;
      milestonesRef.current = {
        started: false,
        preview: false,
        thirtySeconds: false,
        fiftyPercent: false,
        completed: false,
      };

      const resolvedArtistId =
        extractEntityId(currentSong.artistId || currentSong.artist) ||
        extractEntityId(playbackContext?.artistId || playbackContext?.artist) ||
        extractEntityId(currentSong.album?.artist) ||
        undefined;

      const resolvedAlbumId =
        extractEntityId(currentSong.albumId || currentSong.album) ||
        extractEntityId(playbackContext?.type === "album" ? playbackContext?.id : null) ||
        undefined;

      songDataRef.current = {
        songId,
        artistId: resolvedArtistId,
        albumId: resolvedAlbumId,
        title: currentSong.title || "Unknown Track",
        duration: currentSong.duration || 0,
        playbackContext,
      };
    } else {
      activeSongRef.current = null;
      songDataRef.current = null;
    }
  }, [songId, fireSkippedEvent]);

  /**
   * 2. Playback State & Started Event Trigger
   */
  useEffect(() => {
    if (!songId || !isPlaying) return;

    if (!milestonesRef.current.started) {
      milestonesRef.current.started = true;
      const songData = songDataRef.current;

      analytics.track(
        EVENT_TYPES.PLAYBACK_STARTED,
        {
          duration: duration || currentSong?.duration || 0,
          playbackContext: playbackContext?.type || "unknown",
          isPreview,
          title: songData?.title,
        },
        {
          songId,
          artistId: songData?.artistId,
          albumId: songData?.albumId,
        }
      );

      if (isPreview && !milestonesRef.current.preview) {
        milestonesRef.current.preview = true;
        analytics.track(
          EVENT_TYPES.PREVIEW_STARTED,
          {
            duration: duration || currentSong?.duration || 0,
            playbackContext: playbackContext?.type || "unknown",
            title: songData?.title,
          },
          {
            songId,
            artistId: songData?.artistId,
            albumId: songData?.albumId,
          }
        );
      }
    }
  }, [songId, isPlaying, duration, isPreview, playbackContext, currentSong]);

  /**
   * 3. Real Elapsed Listening Time Ticker
   * Runs while actively playing at 500ms intervals to accurately track real elapsed time.
   */
  useEffect(() => {
    if (!songId || !isPlaying) return;

    let lastTick = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTick;
      lastTick = now;

      // Filter out huge background-tab suspension jumps (>2s)
      if (deltaMs > 100 && deltaMs < 2000) {
        accumulatedTimeRef.current += deltaMs / 1000;
      } else {
        accumulatedTimeRef.current += 0.5;
      }

      checkMilestones();
    }, 500);

    return () => clearInterval(interval);
  }, [songId, isPlaying, checkMilestones]);

  /**
   * 4. Check milestones on currentTime change (scrub or audio progress)
   */
  useEffect(() => {
    if (isPlaying) {
      checkMilestones();
    }
  }, [currentTime, isPlaying, checkMilestones]);

  /**
   * 5. Cleanup on Unmount
   */
  useEffect(() => {
    return () => {
      if (
        activeSongRef.current &&
        songDataRef.current &&
        !milestonesRef.current.completed &&
        (milestonesRef.current.started || accumulatedTimeRef.current > 0)
      ) {
        fireSkippedEvent(
          songDataRef.current,
          accumulatedTimeRef.current,
          lastCurrentTimeRef.current
        );
      }
    };
  }, [fireSkippedEvent]);

  return {
    notifySongEnded,
    getAccumulatedListeningTime: () => accumulatedTimeRef.current,
    getMilestones: () => ({ ...milestonesRef.current }),
  };
}
