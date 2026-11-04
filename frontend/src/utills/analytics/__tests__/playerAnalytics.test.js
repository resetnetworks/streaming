// src/utills/analytics/__tests__/playerAnalytics.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayerAnalytics } from "../hooks/usePlayerAnalytics.js";
import { analytics } from "../analyticsClient.js";
import { EVENT_TYPES } from "../constants.js";

describe("Day 2: Audio Player Instrumentation (usePlayerAnalytics)", () => {
  let trackSpy;

  const mockSongA = {
    _id: "65f000000000000000000001",
    title: "Chaleya",
    duration: 200,
    artistId: "65f0000000000000000000a1",
    albumId: "65f0000000000000000000b1",
  };

  const mockSongB = {
    _id: "65f000000000000000000002",
    title: "Tum Hi Ho",
    duration: 260,
    artistId: "65f0000000000000000000a2",
    albumId: "65f0000000000000000000b2",
  };

  beforeEach(() => {
    vi.useFakeTimers();
    trackSpy = vi.spyOn(analytics, "track").mockReturnValue({ success: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("1. triggers playback_started once when playback begins", () => {
    const { rerender } = renderHook(
      (props) => usePlayerAnalytics(props),
      {
        initialProps: {
          currentSong: mockSongA,
          isPlaying: false,
          currentTime: 0,
          duration: 200,
          isPreview: false,
        },
      }
    );

    // Initial state: not playing, no events fired
    expect(trackSpy).not.toHaveBeenCalled();

    // Start playing
    act(() => {
      rerender({
        currentSong: mockSongA,
        isPlaying: true,
        currentTime: 1,
        duration: 200,
        isPreview: false,
      });
    });

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith(
      EVENT_TYPES.PLAYBACK_STARTED,
      expect.objectContaining({
        duration: 200,
        title: "Chaleya",
        isPreview: false,
      }),
      expect.objectContaining({
        songId: "65f000000000000000000001",
        artistId: "65f0000000000000000000a1",
        albumId: "65f0000000000000000000b1",
      })
    );

    // Pause and resume should NOT re-trigger playback_started
    act(() => {
      rerender({ currentSong: mockSongA, isPlaying: false, currentTime: 5, duration: 200, isPreview: false });
    });
    act(() => {
      rerender({ currentSong: mockSongA, isPlaying: true, currentTime: 6, duration: 200, isPreview: false });
    });

    const startedEvents = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_STARTED);
    expect(startedEvents.length).toBe(1);
  });

  it("2. triggers preview_started when isPreview is true", () => {
    renderHook(() =>
      usePlayerAnalytics({
        currentSong: mockSongA,
        isPlaying: true,
        currentTime: 0,
        duration: 30,
        isPreview: true,
      })
    );

    expect(trackSpy).toHaveBeenCalledWith(
      EVENT_TYPES.PLAYBACK_STARTED,
      expect.anything(),
      expect.anything()
    );
    expect(trackSpy).toHaveBeenCalledWith(
      EVENT_TYPES.PREVIEW_STARTED,
      expect.objectContaining({
        duration: 30,
        title: "Chaleya",
      }),
      expect.anything()
    );
  });

  it("3. Anti-Scrubbing: Scrubbing to 2:45 does NOT trigger playback_30s without 30s elapsed listening", () => {
    const { rerender } = renderHook(
      (props) => usePlayerAnalytics(props),
      {
        initialProps: {
          currentSong: mockSongA,
          isPlaying: true,
          currentTime: 0,
          duration: 200,
          isPreview: false,
        },
      }
    );

    // User scrubs immediately from 0 to 165s (2m 45s) after 1 second of real listening
    act(() => {
      vi.advanceTimersByTime(1000); // 1 real second
      rerender({
        currentSong: mockSongA,
        isPlaying: true,
        currentTime: 165, // playhead jumped to 2:45
        duration: 200,
        isPreview: false,
      });
    });

    // playback_30s MUST NOT fire because real accumulated listening time is only ~1 second!
    const thirtySecCalls = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_30S);
    expect(thirtySecCalls.length).toBe(0);

    // Simulate real continuous listening for 30 seconds
    for (let sec = 1; sec <= 30; sec++) {
      act(() => {
        vi.advanceTimersByTime(1000);
        rerender({
          currentSong: mockSongA,
          isPlaying: true,
          currentTime: 165 + sec,
          duration: 200,
          isPreview: false,
        });
      });
    }

    // Now playback_30s MUST fire because real accumulated listening reached 30s
    const thirtySecCallsAfter = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_30S);
    expect(thirtySecCallsAfter.length).toBe(1);
    expect(thirtySecCallsAfter[0][1].accumulatedTime).toBeGreaterThanOrEqual(30);

    // Further listening should NOT trigger playback_30s again
    act(() => {
      vi.advanceTimersByTime(5000);
      rerender({
        currentSong: mockSongA,
        isPlaying: true,
        currentTime: 198,
        duration: 200,
        isPreview: false,
      });
    });

    const thirtySecCallsFinal = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_30S);
    expect(thirtySecCallsFinal.length).toBe(1);
  });

  it("4. Pause and Resume: preserves accumulated listening time accurately", () => {
    let hookResult;
    const { rerender } = renderHook(
      (props) => {
        hookResult = usePlayerAnalytics(props);
        return hookResult;
      },
      {
        initialProps: {
          currentSong: mockSongA,
          isPlaying: true,
          currentTime: 0,
          duration: 200,
        },
      }
    );

    // Listen for 15 seconds
    for (let i = 1; i <= 15; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
        rerender({ currentSong: mockSongA, isPlaying: true, currentTime: i, duration: 200 });
      });
    }

    const midListening = hookResult.getAccumulatedListeningTime();
    expect(midListening).toBeGreaterThanOrEqual(14.5);
    expect(midListening).toBeLessThanOrEqual(15.5);

    // Pause
    act(() => {
      rerender({ currentSong: mockSongA, isPlaying: false, currentTime: 15, duration: 200 });
    });

    // Advance 10 minutes while paused
    act(() => {
      vi.advanceTimersByTime(600000);
    });

    // Time must NOT advance during pause
    expect(hookResult.getAccumulatedListeningTime()).toBe(midListening);

    // Resume listening for 15 more seconds -> total ~30s
    for (let i = 1; i <= 16; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
        rerender({ currentSong: mockSongA, isPlaying: true, currentTime: 15 + i, duration: 200 });
      });
    }

    // playback_30s should fire now that total accumulated listening crossed 30s
    const thirtySecCalls = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_30S);
    expect(thirtySecCalls.length).toBe(1);
  });

  it("5. triggers playback_50_percent when playhead passes half duration and listening threshold met", () => {
    const { rerender } = renderHook(
      (props) => usePlayerAnalytics(props),
      {
        initialProps: {
          currentSong: mockSongA,
          isPlaying: true,
          currentTime: 0,
          duration: 60, // 60s track, 50% is 30s
        },
      }
    );

    // Play continuously to 30 seconds
    for (let i = 1; i <= 31; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
        rerender({ currentSong: mockSongA, isPlaying: true, currentTime: i, duration: 60 });
      });
    }

    const fiftyPercentCalls = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_50_PERCENT);
    expect(fiftyPercentCalls.length).toBe(1);
  });

  it("6. triggers playback_completed when notifySongEnded is invoked", () => {
    let hookResult;
    renderHook(() => {
      hookResult = usePlayerAnalytics({
        currentSong: mockSongA,
        isPlaying: true,
        currentTime: 200,
        duration: 200,
      });
      return hookResult;
    });

    act(() => {
      hookResult.notifySongEnded();
    });

    expect(trackSpy).toHaveBeenCalledWith(
      EVENT_TYPES.PLAYBACK_COMPLETED,
      expect.objectContaining({
        duration: 200,
        completionRate: 100,
      }),
      expect.objectContaining({
        songId: "65f000000000000000000001",
      })
    );
  });

  it("7. Rapid Song Skipping: fires playback_skipped on song change without duplicate completion events", () => {
    const { rerender } = renderHook(
      (props) => usePlayerAnalytics(props),
      {
        initialProps: {
          currentSong: mockSongA,
          isPlaying: true,
          currentTime: 0,
          duration: 200,
        },
      }
    );

    // Listen to Song A for 8 seconds
    for (let i = 1; i <= 8; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
        rerender({ currentSong: mockSongA, isPlaying: true, currentTime: i, duration: 200 });
      });
    }

    // User skips to Song B!
    act(() => {
      rerender({
        currentSong: mockSongB,
        isPlaying: true,
        currentTime: 0,
        duration: 260,
      });
    });

    // Song A must have fired playback_skipped with ~8 seconds listened
    const skippedCalls = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_SKIPPED);
    expect(skippedCalls.length).toBe(1);
    expect(skippedCalls[0][1].timeListened).toBeGreaterThanOrEqual(7);
    expect(skippedCalls[0][1].timeListened).toBeLessThanOrEqual(9);
    expect(skippedCalls[0][2].songId).toBe(mockSongA._id);

    // Song B must have started
    const startedCalls = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_STARTED);
    expect(startedCalls.length).toBe(2);
    expect(startedCalls[1][2].songId).toBe(mockSongB._id);

    // Rapid skip again: Song B -> null
    act(() => {
      vi.advanceTimersByTime(2000);
      rerender({
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
    });

    const skippedCallsAfter = trackSpy.mock.calls.filter((c) => c[0] === EVENT_TYPES.PLAYBACK_SKIPPED);
    expect(skippedCallsAfter.length).toBe(2);
    expect(skippedCallsAfter[1][2].songId).toBe(mockSongB._id);
  });
});
