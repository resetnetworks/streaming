// src/utils/analytics/__tests__/analytics.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateUUID } from "../uuid.js";
import { identity, isValidObjectId } from "../identity.js";
import { sanitizeEventPayload } from "../sanitizer.js";
import { EventQueue } from "../eventQueue.js";
import { AnalyticsClient } from "../analyticsClient.js";
import defaultAnalytics, { analytics as namedAnalytics } from "../index.js";
import { EVENT_TYPES, STORAGE_KEYS } from "../constants.js";

describe("Day 1: Analytics Client SDK & Ingestion Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    identity.reset();
    identity._anonymousId = null;
    identity._sessionId = null;
    identity._userId = null;
    vi.restoreAllMocks();
  });

  describe("1. UUID Generator", () => {
    it("generates valid RFC 4122 v4 UUIDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const id1 = generateUUID();
      const id2 = generateUUID();

      expect(id1).toMatch(uuidRegex);
      expect(id2).toMatch(uuidRegex);
      expect(id1).not.toBe(id2);
    });
  });

  describe("2. Identity Management", () => {
    it("generates and persists anonymousId in storage", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
      const anonId = identity.getAnonymousId();

      expect(anonId).toMatch(/^anon_[0-9a-f]{32}$/);
      expect(localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID)).toBe(anonId);
      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.ANONYMOUS_ID, anonId);

      // Subsequent call returns cached identity without re-generating
      const secondCall = identity.getAnonymousId();
      expect(secondCall).toBe(anonId);
    });

    it("creates and refreshes sessionId", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
      const sessionId = identity.getSessionId();

      expect(sessionId).toMatch(/^sess_\d+_[0-9a-f]{8}$/);
      expect(sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)).toBe(sessionId);
      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.SESSION_ID, sessionId);
    });

    it("strictly accepts only valid 24-char hex MongoDB ObjectIds for userId", () => {
      const validObjectId = "65f000000000000000000001";
      expect(isValidObjectId(validObjectId)).toBe(true);
      expect(isValidObjectId("not-a-valid-id")).toBe(false);
      expect(isValidObjectId("12345")).toBe(false);
      expect(isValidObjectId(null)).toBe(false);

      identity.setUserId(validObjectId);
      expect(identity.getUserId()).toBe(validObjectId);
      expect(localStorage.getItem(STORAGE_KEYS.USER_ID)).toBe(validObjectId);

      // Non-valid ObjectId should be rejected and cleared
      identity.setUserId("invalid-id-xyz");
      expect(identity.getUserId()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.USER_ID)).toBeNull();
    });
  });

  describe("3. Event Payload Sanitization", () => {
    it("rejects unknown event names", () => {
      const result = sanitizeEventPayload("random_unregistered_event");
      expect(result).toBeNull();
    });

    it("sanitizes valid event and enriches with context and identity", () => {
      const validSongId = "65f000000000000000000001";
      const payload = sanitizeEventPayload(
        EVENT_TYPES.PLAYBACK_STARTED,
        { duration: 180, quality: "high" },
        { songId: validSongId, artistId: "non-hex-slug-artist" }
      );

      expect(payload).not.toBeNull();
      expect(payload.eventName).toBe(EVENT_TYPES.PLAYBACK_STARTED);
      expect(payload.eventId).toBeDefined();
      expect(payload.occurredAt).toBeDefined();
      expect(payload.anonymousId).toBeDefined();
      expect(payload.sessionId).toBeDefined();
      expect(payload.songId).toBe(validSongId);
      // Non-hex artist id should be preserved as slug in properties to avoid backend rejection
      expect(payload.artistId).toBeUndefined();
      expect(payload.properties.artistSlug).toBe("non-hex-slug-artist");
      expect(payload.context.platform).toBe("web");
    });
  });

  describe("4. EventQueue Buffer & Batch Aggregation", () => {
    it("buffers events and flushes immediately when batchSize (10) is reached", async () => {
      const queue = new EventQueue({ batchSize: 10, endpoint: "http://localhost:4000/api/v1/analytics/events" });
      const flushSpy = vi.spyOn(queue, "flush").mockImplementation(() => Promise.resolve());

      // Enqueue 9 events
      for (let i = 0; i < 9; i++) {
        queue.enqueue({ eventName: EVENT_TYPES.HOME_PAGE_VIEWED });
      }
      expect(queue.queue.length).toBe(9);
      expect(flushSpy).not.toHaveBeenCalled();

      // 10th event triggers flush
      queue.enqueue({ eventName: EVENT_TYPES.HOME_PAGE_VIEWED });
      expect(flushSpy).toHaveBeenCalledTimes(1);
    });

    it("flushes via 5-second timer when queue has fewer than 10 events", () => {
      vi.useFakeTimers();

      const queue = new EventQueue({ batchSize: 10, flushIntervalMs: 5000 });
      const flushSpy = vi.spyOn(queue, "flush").mockImplementation(() => Promise.resolve());

      queue.enqueue({ eventName: EVENT_TYPES.HOME_PAGE_VIEWED });
      expect(queue.queue.length).toBe(1);
      expect(flushSpy).not.toHaveBeenCalled();

      // Fast-forward 4999 ms
      vi.advanceTimersByTime(4999);
      expect(flushSpy).not.toHaveBeenCalled();

      // Reach 5000 ms
      vi.advanceTimersByTime(1);
      expect(flushSpy).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe("5. Offline Storage & Network Retry Recovery", () => {
    it("saves failed batch to offline queue in localStorage and recovers it", async () => {
      const queue = new EventQueue({ batchSize: 10, maxRetries: 1 });
      const testEvents = [
        { eventId: "test-1", eventName: EVENT_TYPES.SONG_LIKED },
        { eventId: "test-2", eventName: EVENT_TYPES.ARTIST_FOLLOWED },
      ];

      // Simulate failure handling
      queue.handleFailedBatch(testEvents);

      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      expect(stored).toBe(JSON.stringify(testEvents));

      // Now recover offline queue
      queue.recoverOfflineQueue();

      expect(queue.queue.length).toBe(2);
      expect(queue.queue[0].eventId).toBe("test-1");
      expect(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)).toBeNull();
    });
  });

  describe("6. sendBeacon Flush on Tab Close", () => {
    it("uses navigator.sendBeacon with json blob when flushBeacon is called", () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const queue = new EventQueue({ endpoint: "http://localhost:4000/api/v1/analytics/events" });
      queue.queue = [{ eventName: EVENT_TYPES.PLAYBACK_COMPLETED, eventId: "beacon-1" }];

      queue.flushBeacon();

      expect(sendBeaconMock).toHaveBeenCalled();
      const callArgs = sendBeaconMock.mock.calls[0];
      expect(callArgs[0]).toBe("http://localhost:4000/api/v1/analytics/events");
      expect(callArgs[1]).toBeInstanceOf(Blob);
      expect(queue.queue.length).toBe(0);
    });
  });

  describe("7. Unified AnalyticsClient Facade", () => {
    it("tracks events smoothly through the singleton facade", () => {
      const client = new AnalyticsClient({ batchSize: 10 });
      const enqueueSpy = vi.spyOn(client.queue, "enqueue");

      const tracked = client.track(EVENT_TYPES.SEARCH_PERFORMED, { query: "Arijit Singh", resultsCount: 15 });
      expect(tracked).not.toBeNull();
      expect(tracked.eventName).toBe(EVENT_TYPES.SEARCH_PERFORMED);
      expect(tracked.properties.query).toBe("Arijit Singh");
      expect(enqueueSpy).toHaveBeenCalledWith(tracked);

      // Verify barrel export default
      expect(defaultAnalytics).toBeDefined();
      expect(defaultAnalytics).toBe(namedAnalytics);
    });
  });
});
