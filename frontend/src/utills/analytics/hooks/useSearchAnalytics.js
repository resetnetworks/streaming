// src/utills/analytics/hooks/useSearchAnalytics.js
import { useEffect, useRef, useCallback } from "react";
import { analytics } from "../analyticsClient.js";
import { EVENT_TYPES } from "../constants.js";

/**
 * Custom hook for debounced search tracking and result click interactions.
 *
 * @param {string} query - Current search input string
 * @param {Object} results - Current search results ({ songs: [], artists: [], albums: [] })
 * @param {Object} options - Options including debounce delay in ms (default 500ms)
 */
export function useSearchAnalytics(query = "", results = null, options = {}) {
  const { debounceMs = 500, minLength = 2 } = options;
  const lastTrackedQueryRef = useRef(null);
  const timerRef = useRef(null);

  // Debounced search trigger
  useEffect(() => {
    const trimmed = String(query || "").trim();

    // Clear any pending timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (trimmed.length < minLength) {
      return;
    }

    // Don't re-track the same query repeatedly
    if (lastTrackedQueryRef.current === trimmed) {
      return;
    }

    timerRef.current = setTimeout(() => {
      lastTrackedQueryRef.current = trimmed;

      const songsCount = results?.songs?.length || 0;
      const artistsCount = results?.artists?.length || 0;
      const albumsCount = results?.albums?.length || 0;
      const totalResults = songsCount + artistsCount + albumsCount;

      analytics.track(EVENT_TYPES.SEARCH_PERFORMED, {
        query: trimmed,
        queryLength: trimmed.length,
        resultsCount: totalResults,
        songsCount,
        artistsCount,
        albumsCount,
      });
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, results, debounceMs, minLength]);

  /**
   * Tracks when a user clicks any item within search results.
   */
  const trackResultClick = useCallback(
    ({ itemType, itemId, title = "", position = 0 }) => {
      if (!itemType || !itemId) return;

      const trimmedQuery = String(query || "").trim();

      analytics.track(
        EVENT_TYPES.SEARCH_RESULT_CLICKED,
        {
          query: trimmedQuery,
          itemType, // "song" | "artist" | "album"
          title,
          position,
        },
        {
          songId: itemType === "song" ? itemId : undefined,
          artistId: itemType === "artist" ? itemId : undefined,
          albumId: itemType === "album" ? itemId : undefined,
        }
      );
    },
    [query]
  );

  return {
    trackResultClick,
  };
}
