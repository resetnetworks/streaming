// src/utils/analytics/analyticsClient.js
import { sanitizeEventPayload } from "./sanitizer.js";
import { EventQueue } from "./eventQueue.js";
import { identity } from "./identity.js";
import { EVENT_TYPES, DEFAULT_CONFIG } from "./constants.js";

/**
 * Analytics Client SDK
 * Unified entry point for client-side event tracking, buffering, identity, and transport.
 */
export class AnalyticsClient {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queue = new EventQueue(this.config);
    this.initialized = false;
  }

  /**
   * Initializes the analytics engine, lifecycle listeners, and offline recovery.
   */
  init(customConfig = {}) {
    if (this.initialized) {
      if (Object.keys(customConfig).length > 0) {
        this.config = { ...this.config, ...customConfig };
        this.queue.config = { ...this.queue.config, ...customConfig };
      }
      return this;
    }

    this.config = { ...this.config, ...customConfig };
    if (!this.queue) {
      this.queue = new EventQueue(this.config);
    } else {
      this.queue.config = { ...this.queue.config, ...this.config };
    }
    this.queue.init();
    this.initialized = true;

    if (this.config.debug) {
      console.log("[AnalyticsClient] Initialized with config:", this.config);
    }

    return this;
  }

  /**
   * Primary tracking method.
   *
   * @param {string} eventName - One of registered EVENT_TYPES
   * @param {Object} properties - Custom event properties
   * @param {Object} entities - Optional { songId, albumId, artistId }
   * @returns {Object|null} Sanitized event if queued, null if invalid
   */
  track(eventName, properties = {}, entities = {}) {
    if (!this.initialized) {
      this.init();
    }

    identity.touchSession();

    const sanitized = sanitizeEventPayload(eventName, properties, entities);
    if (!sanitized) {
      return null;
    }

    this.queue.enqueue(sanitized);
    return sanitized;
  }

  /**
   * Associates subsequent events with an authenticated user identity.
   *
   * @param {string} userId - 24-character hexadecimal MongoDB ObjectId
   * @param {Object} traits - Optional user traits (e.g. email, role)
   */
  identify(userId, traits = {}) {
    if (userId) {
      identity.setUserId(userId);
    }
    if (traits && Object.keys(traits).length > 0) {
      this.track(EVENT_TYPES.LOGIN_COMPLETED, traits);
    }
  }

  /**
   * Clears authenticated identity on user logout.
   */
  reset() {
    identity.reset();
  }

  /**
   * Manually flushes buffered events to backend.
   */
  async flush() {
    return this.queue.flush();
  }

  /**
   * Returns current user, anonymous, and session identities.
   */
  getIdentity() {
    return identity.getIdentity();
  }

  // --- Convenience helper methods ---

  trackPageView(pageType, properties = {}) {
    const eventName =
      pageType === "home"
        ? EVENT_TYPES.HOME_PAGE_VIEWED
        : pageType === "landing"
        ? EVENT_TYPES.LANDING_PAGE_VIEWED
        : pageType === "artist"
        ? EVENT_TYPES.ARTIST_VIEWED
        : pageType === "album"
        ? EVENT_TYPES.ALBUM_VIEWED
        : pageType === "song"
        ? EVENT_TYPES.SONG_VIEWED
        : EVENT_TYPES.HOME_PAGE_VIEWED;

    return this.track(eventName, properties);
  }

  trackSearch(query, resultsCount = 0, properties = {}) {
    return this.track(EVENT_TYPES.SEARCH_PERFORMED, {
      query: String(query || "").trim(),
      resultsCount: Number(resultsCount) || 0,
      ...properties,
    });
  }

  trackPlayback(playbackEvent, properties = {}, entities = {}) {
    return this.track(playbackEvent, properties, entities);
  }
}

// Global singleton instance
export const analytics = new AnalyticsClient();
