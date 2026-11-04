// src/utills/analytics/hooks/useRouteAnalytics.js
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "../analyticsClient.js";
import { EVENT_TYPES } from "../constants.js";

/**
 * Parses pathname to determine page type and associated entity ID/slug.
 *
 * @param {string} pathname
 * @returns {{ eventName: string|null, entities: Object, properties: Object }}
 */
export function matchRouteToEvent(pathname = "") {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // 1. Landing Page (Root)
  if (cleanPath === "/" || cleanPath === "") {
    return {
      eventName: EVENT_TYPES.LANDING_PAGE_VIEWED,
      entities: {},
      properties: { path: "/" },
    };
  }

  // 2. Home Page
  if (cleanPath === "/home") {
    return {
      eventName: EVENT_TYPES.HOME_PAGE_VIEWED,
      entities: {},
      properties: { path: "/home" },
    };
  }

  // 3. Artist Page (/artist/:artistId)
  const artistMatch = cleanPath.match(/^\/artist\/([^/]+)/);
  if (artistMatch) {
    const rawId = artistMatch[1];
    return {
      eventName: EVENT_TYPES.ARTIST_VIEWED,
      entities: { artistId: rawId },
      properties: { path: cleanPath, rawArtistId: rawId },
    };
  }

  // 4. Album Page (/album/:albumId)
  const albumMatch = cleanPath.match(/^\/album\/([^/]+)/);
  if (albumMatch) {
    const rawId = albumMatch[1];
    return {
      eventName: EVENT_TYPES.ALBUM_VIEWED,
      entities: { albumId: rawId },
      properties: { path: cleanPath, rawAlbumId: rawId },
    };
  }

  // 5. Song Page (/song/:songId)
  const songMatch = cleanPath.match(/^\/song\/([^/]+)/);
  if (songMatch) {
    const rawId = songMatch[1];
    return {
      eventName: EVENT_TYPES.SONG_VIEWED,
      entities: { songId: rawId },
      properties: { path: cleanPath, rawSongId: rawId },
    };
  }

  return { eventName: null, entities: {}, properties: {} };
}

/**
 * Global hook that automatically listens to route changes and fires
 * landing, home, artist, album, and song view analytics events.
 */
export function useRouteAnalytics() {
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;

    // Prevent duplicate dispatches on same route
    if (lastPathRef.current === currentPath) {
      return;
    }
    lastPathRef.current = currentPath;

    const { eventName, entities, properties } = matchRouteToEvent(currentPath);

    if (eventName) {
      analytics.track(eventName, {
        path: currentPath,
        search: location.search,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        ...properties,
      }, entities);
    }
  }, [location.pathname, location.search]);
}

/**
 * Invisible helper component to mount inside BrowserRouter.
 */
export function RouteAnalyticsListener() {
  useRouteAnalytics();
  return null;
}
