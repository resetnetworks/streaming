// src/utills/analytics/__tests__/discoveryAnalytics.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { matchRouteToEvent, useRouteAnalytics } from "../hooks/useRouteAnalytics.js";
import { useSearchAnalytics } from "../hooks/useSearchAnalytics.js";
import { analytics } from "../analyticsClient.js";
import { EVENT_TYPES } from "../constants.js";

// Mock react-router-dom useLocation
let mockPathname = "/";
let mockSearch = "";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({
    pathname: mockPathname,
    search: mockSearch,
  }),
}));

describe("Day 3: Discovery, Navigation & User Intent Analytics", () => {
  let trackSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPathname = "/";
    mockSearch = "";
    trackSpy = vi.spyOn(analytics, "track").mockReturnValue({ success: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("1. Route Matcher & Route Change Listeners", () => {
    it("correctly matches root path to landing_page_viewed", () => {
      const match = matchRouteToEvent("/");
      expect(match.eventName).toBe(EVENT_TYPES.LANDING_PAGE_VIEWED);
    });

    it("correctly matches /home to home_page_viewed", () => {
      const match = matchRouteToEvent("/home");
      expect(match.eventName).toBe(EVENT_TYPES.HOME_PAGE_VIEWED);
    });

    it("correctly extracts artistId for /artist/:id", () => {
      const validArtistId = "65f0000000000000000000a1";
      const match = matchRouteToEvent(`/artist/${validArtistId}`);
      expect(match.eventName).toBe(EVENT_TYPES.ARTIST_VIEWED);
      expect(match.entities.artistId).toBe(validArtistId);
    });

    it("correctly extracts albumId for /album/:id", () => {
      const validAlbumId = "65f0000000000000000000b1";
      const match = matchRouteToEvent(`/album/${validAlbumId}`);
      expect(match.eventName).toBe(EVENT_TYPES.ALBUM_VIEWED);
      expect(match.entities.albumId).toBe(validAlbumId);
    });

    it("correctly extracts songId for /song/:id", () => {
      const validSongId = "65f0000000000000000000c1";
      const match = matchRouteToEvent(`/song/${validSongId}`);
      expect(match.eventName).toBe(EVENT_TYPES.SONG_VIEWED);
      expect(match.entities.songId).toBe(validSongId);
    });

    it("useRouteAnalytics dispatches events on navigation and prevents duplicates on same route", () => {
      mockPathname = "/home";
      const { rerender } = renderHook(() => useRouteAnalytics());

      expect(trackSpy).toHaveBeenCalledTimes(1);
      expect(trackSpy).toHaveBeenCalledWith(
        EVENT_TYPES.HOME_PAGE_VIEWED,
        expect.objectContaining({ path: "/home" }),
        expect.anything()
      );

      // Re-render without route change should NOT duplicate event
      rerender();
      expect(trackSpy).toHaveBeenCalledTimes(1);

      // Navigate to artist page
      mockPathname = "/artist/65f0000000000000000000a1";
      rerender();

      expect(trackSpy).toHaveBeenCalledTimes(2);
      expect(trackSpy).toHaveBeenCalledWith(
        EVENT_TYPES.ARTIST_VIEWED,
        expect.objectContaining({ path: "/artist/65f0000000000000000000a1" }),
        expect.objectContaining({ artistId: "65f0000000000000000000a1" })
      );
    });
  });

  describe("2. Debounced Search Tracking & Debounce Control", () => {
    it("debounces rapid typing so only 1 event fires after user stops typing", () => {
      const { rerender } = renderHook(
        ({ query, results }) => useSearchAnalytics(query, results, { debounceMs: 500 }),
        {
          initialProps: { query: "", results: null },
        }
      );

      expect(trackSpy).not.toHaveBeenCalled();

      // Rapid typing: "c" -> "co" -> "col" -> "cold" -> "coldplay" within 200ms
      act(() => {
        rerender({ query: "c", results: null });
        vi.advanceTimersByTime(50);
        rerender({ query: "co", results: null });
        vi.advanceTimersByTime(50);
        rerender({ query: "col", results: null });
        vi.advanceTimersByTime(50);
        rerender({ query: "cold", results: null });
        vi.advanceTimersByTime(50);
        rerender({
          query: "coldplay",
          results: { songs: [{ _id: "s1" }], artists: [{ _id: "a1" }], albums: [] },
        });
      });

      // No event fired immediately before debounce window expires
      expect(trackSpy).not.toHaveBeenCalled();

      // Fast-forward 499ms
      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(trackSpy).not.toHaveBeenCalled();

      // Reach 500ms
      act(() => {
        vi.advanceTimersByTime(1);
      });

      // Exactly 1 search event should be fired for final settled query
      expect(trackSpy).toHaveBeenCalledTimes(1);
      expect(trackSpy).toHaveBeenCalledWith(
        EVENT_TYPES.SEARCH_PERFORMED,
        expect.objectContaining({
          query: "coldplay",
          resultsCount: 2,
          songsCount: 1,
          artistsCount: 1,
          albumsCount: 0,
        })
      );
    });

    it("ignores queries shorter than minLength (2 chars)", () => {
      renderHook(() => useSearchAnalytics("a", null, { debounceMs: 500, minLength: 2 }));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(trackSpy).not.toHaveBeenCalled();
    });

    it("tracks search result clicks with entity context", () => {
      let hookResult;
      renderHook(() => {
        hookResult = useSearchAnalytics("coldplay", null);
        return hookResult;
      });

      act(() => {
        hookResult.trackResultClick({
          itemType: "song",
          itemId: "65f000000000000000000001",
          title: "Yellow",
          position: 1,
        });
      });

      expect(trackSpy).toHaveBeenCalledWith(
        EVENT_TYPES.SEARCH_RESULT_CLICKED,
        expect.objectContaining({
          query: "coldplay",
          itemType: "song",
          title: "Yellow",
          position: 1,
        }),
        expect.objectContaining({
          songId: "65f000000000000000000001",
        })
      );
    });
  });

  describe("3. Payload Sanitization with Schema Safety", () => {
    it("safely accepts slug in artist route and avoids backend ObjectId validation error", () => {
      const match = matchRouteToEvent("/artist/arijit-singh-special-slug");
      expect(match.eventName).toBe(EVENT_TYPES.ARTIST_VIEWED);

      // In real analytics client tracking:
      analytics.track(match.eventName, match.properties, match.entities);

      expect(trackSpy).toHaveBeenCalledWith(
        EVENT_TYPES.ARTIST_VIEWED,
        expect.objectContaining({
          rawArtistId: "arijit-singh-special-slug",
        }),
        expect.objectContaining({
          artistId: "arijit-singh-special-slug",
        })
      );
    });
  });
});
