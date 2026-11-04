// src/utils/analytics/eventQueue.js
import { DEFAULT_CONFIG, STORAGE_KEYS } from "./constants.js";
import { identity } from "./identity.js";

/**
 * Manages buffering, batching, scheduled flushing, offline persistence,
 * and unload beacon dispatch for analytics events.
 */
export class EventQueue {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queue = [];
    this.timer = null;
    this.isFlushing = false;
    this.retryAttempt = 0;
    this.retryTimer = null;
    this._listenersAttached = false;
  }

  /**
   * Resolves the full URL for the analytics ingestion endpoint.
   */
  getEndpointUrl() {
    if (this.config.endpoint) return this.config.endpoint;

    const envApi =
      (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
      "http://localhost:4000/api";

    // Standardize URL to /v1/analytics/events
    const cleanBase = envApi.replace(/\/+$/, "");
    return cleanBase.endsWith("/v1")
      ? `${cleanBase}/analytics/events`
      : `${cleanBase}/v1/analytics/events`;
  }

  /**
   * Initializes queue, attaches lifecycle listeners, and checks for offline events.
   */
  init() {
    this.recoverOfflineQueue();
    this.attachLifecycleListeners();
    this.startTimer();
  }

  /**
   * Pushes a sanitized event to the buffer.
   * Flushes immediately if buffer reaches batchSize (10).
   */
  enqueue(event) {
    if (!event) return;

    this.queue.push(event);

    if (this.config.debug) {
      console.log(`[AnalyticsQueue] Queued event: ${event.eventName}. Queue length: ${this.queue.length}`);
    }

    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    } else {
      this.startTimer();
    }
  }

  /**
   * Starts or ensures the 5-second recurring flush timer is active.
   */
  startTimer() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.config.flushIntervalMs);
  }

  /**
   * Clears the recurring flush timer.
   */
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Attach window and document lifecycle listeners for beacon flush & online recovery.
   */
  attachLifecycleListeners() {
    if (this._listenersAttached || typeof window === "undefined") return;

    // Flush remaining buffer when tab becomes hidden or unloaded
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        this.flushBeacon();
      }
    };

    const handlePageHide = () => {
      this.flushBeacon();
    };

    const handleOnline = () => {
      if (this.config.debug) {
        console.log("[AnalyticsQueue] Network restored. Recovering offline queue...");
      }
      this.retryAttempt = 0;
      this.recoverOfflineQueue();
      this.flush();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("online", handleOnline);

    this._listenersAttached = true;
  }

  /**
   * Synchronously flushes events using navigator.sendBeacon (ideal for tab close / pagehide).
   */
  flushBeacon() {
    if (this.queue.length === 0) return;

    const eventsToSend = this.queue.splice(0, this.config.maxBatchSize);
    const url = this.getEndpointUrl();
    const payload = JSON.stringify({ events: eventsToSend });

    let sent = false;
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      try {
        const blob = new Blob([payload], { type: "application/json" });
        sent = navigator.sendBeacon(url, blob);
      } catch (err) {
        sent = false;
      }
    }

    // Fallback if sendBeacon fails or is unavailable
    if (!sent && typeof fetch === "function") {
      try {
        fetch(url, {
          method: "POST",
          headers: this.buildHeaders(),
          body: payload,
          keepalive: true,
        }).catch(() => {});
        sent = true;
      } catch {}
    }

    if (!sent) {
      // If unable to send during page unload, preserve into offline storage
      this.saveToOfflineQueue(eventsToSend);
    }
  }

  /**
   * Builds headers for HTTP dispatch.
   */
  buildHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "x-anonymous-id": identity.getAnonymousId(),
      "x-session-id": identity.getSessionId(),
    };

    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch {}

    return headers;
  }

  /**
   * Asynchronously flushes batches to the ingestion endpoint with retry on failure.
   */
  async flush() {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.clearTimer();
    this.isFlushing = true;

    const batch = this.queue.splice(0, this.config.maxBatchSize);

    try {
      const url = this.getEndpointUrl();
      const headers = this.buildHeaders();

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ events: batch }),
      });

      if (!response.ok && response.status >= 500) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // Success
      this.retryAttempt = 0;
      if (this.config.debug) {
        console.log(`[AnalyticsQueue] Successfully ingested ${batch.length} events.`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn(`[AnalyticsQueue] Ingestion failed: ${error.message}. Scheduling retry.`);
      }
      this.handleFailedBatch(batch);
    } finally {
      this.isFlushing = false;

      // If more events arrived during flush, schedule next flush
      if (this.queue.length > 0) {
        if (this.queue.length >= this.config.batchSize) {
          this.flush();
        } else {
          this.startTimer();
        }
      }
    }
  }

  /**
   * Handles network failure: stores batch to offline storage and backs off.
   */
  handleFailedBatch(batch) {
    this.saveToOfflineQueue(batch);

    if (this.retryAttempt < this.config.maxRetries) {
      this.retryAttempt += 1;
      const delay = Math.min(
        this.config.initialRetryDelayMs * Math.pow(2, this.retryAttempt - 1),
        this.config.maxRetryDelayMs
      );

      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null;
        this.recoverOfflineQueue();
        this.flush();
      }, delay);
    }
  }

  /**
   * Persists events to localStorage when offline or when network requests fail.
   */
  saveToOfflineQueue(events = []) {
    if (!events.length || typeof window === "undefined") return;

    try {
      const existing = this.readOfflineQueue();
      const combined = [...existing, ...events];

      // Enforce max offline storage size (drop oldest if exceeded)
      const trimmed = combined.slice(-this.config.maxOfflineQueueSize);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(trimmed));
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  /**
   * Reads stored offline events.
   */
  readOfflineQueue() {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Recovers events from localStorage back into the in-memory queue.
   */
  recoverOfflineQueue() {
    if (typeof window === "undefined") return;

    try {
      const offlineEvents = this.readOfflineQueue();
      if (offlineEvents && offlineEvents.length > 0) {
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
        // Prepend recovered events so chronological order is maintained
        this.queue.unshift(...offlineEvents);
        if (this.config.debug) {
          console.log(`[AnalyticsQueue] Recovered ${offlineEvents.length} events from offline storage.`);
        }
      }
    } catch {}
  }

  /**
   * Clears all in-memory and offline queues.
   */
  clear() {
    this.queue = [];
    this.clearTimer();
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
      }
    } catch {}
  }
}
