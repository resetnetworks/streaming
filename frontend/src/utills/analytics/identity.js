// src/utils/analytics/identity.js
import { generateUUID } from "./uuid.js";
import { STORAGE_KEYS, DEFAULT_CONFIG } from "./constants.js";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Checks if a string is a valid 24-character hex MongoDB ObjectId.
 */
export function isValidObjectId(id) {
  return typeof id === "string" && OBJECT_ID_REGEX.test(id.trim());
}

/**
 * Safe cookie read helper.
 */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Safe cookie set helper (1 year expiration for anonymousId).
 */
function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

class IdentityManager {
  constructor() {
    this._userId = null;
    this._anonymousId = null;
    this._sessionId = null;
    this._sessionTimeoutMs = DEFAULT_CONFIG.sessionInactivityTimeoutMs;
  }

  /**
   * Returns a persistent anonymous ID for the current browser/device.
   * Cached in memory, backed by localStorage and cookie.
   */
  getAnonymousId() {
    if (this._anonymousId) return this._anonymousId;

    try {
      if (typeof window !== "undefined") {
        let stored = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID);
        if (!stored) {
          stored = getCookie(STORAGE_KEYS.ANONYMOUS_ID);
        }

        if (stored && typeof stored === "string" && stored.trim().length > 0) {
          this._anonymousId = stored.trim();
          return this._anonymousId;
        }

        const generated = `anon_${generateUUID().replace(/-/g, "")}`;
        this._anonymousId = generated;
        localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, generated);
        setCookie(STORAGE_KEYS.ANONYMOUS_ID, generated, 365);
        return this._anonymousId;
      }
    } catch {
      // In private mode or restricted contexts
    }

    if (!this._anonymousId) {
      this._anonymousId = `anon_${generateUUID().replace(/-/g, "")}`;
    }
    return this._anonymousId;
  }

  /**
   * Returns the current session ID. Rotates if inactive > 30 minutes.
   */
  getSessionId() {
    const now = Date.now();

    try {
      if (typeof window !== "undefined") {
        const storedSession = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
        const lastActiveStr = sessionStorage.getItem(STORAGE_KEYS.SESSION_LAST_ACTIVE);
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

        const isExpired = !lastActive || now - lastActive > this._sessionTimeoutMs;

        if (storedSession && !isExpired) {
          this._sessionId = storedSession;
          sessionStorage.setItem(STORAGE_KEYS.SESSION_LAST_ACTIVE, String(now));
          return this._sessionId;
        }

        // Generate new session ID
        const newSessionId = `sess_${now}_${generateUUID().slice(0, 8)}`;
        this._sessionId = newSessionId;
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
        sessionStorage.setItem(STORAGE_KEYS.SESSION_LAST_ACTIVE, String(now));
        return this._sessionId;
      }
    } catch {
      // Private mode fallback
    }

    if (!this._sessionId) {
      this._sessionId = `sess_${now}_${generateUUID().slice(0, 8)}`;
    }
    return this._sessionId;
  }

  /**
   * Touch session to keep it alive during active playback or interaction
   */
  touchSession() {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_LAST_ACTIVE, String(Date.now()));
      }
    } catch {}
  }

  /**
   * Returns the currently authenticated user's ObjectId or null.
   */
  getUserId() {
    if (this._userId) return this._userId;

    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (stored && isValidObjectId(stored)) {
          this._userId = stored;
          return this._userId;
        }

        // Check if Redux persist auth or user object exists in localStorage
        const rawUser = localStorage.getItem("user") || localStorage.getItem("userData");
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            const id = parsed?._id || parsed?.id;
            if (isValidObjectId(id)) {
              this._userId = id;
              return this._userId;
            }
          } catch {}
        }
      }
    } catch {}

    return null;
  }

  /**
   * Sets or updates authenticated userId.
   * Ensures only valid MongoDB ObjectId strings are accepted.
   */
  setUserId(userId) {
    if (userId && isValidObjectId(String(userId))) {
      this._userId = String(userId).trim();
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER_ID, this._userId);
        }
      } catch {}
    } else {
      this.clearUser();
    }
  }

  /**
   * Clears authenticated userId (e.g. on logout).
   */
  clearUser() {
    this._userId = null;
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
      }
    } catch {}
  }

  /**
   * Resets all identity state (e.g. full privacy wipe or logout).
   */
  reset() {
    this.clearUser();
    this._sessionId = null;
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_LAST_ACTIVE);
      }
    } catch {}
  }

  /**
   * Snapshot of current identity context.
   */
  getIdentity() {
    return {
      anonymousId: this.getAnonymousId(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
    };
  }
}

export const identity = new IdentityManager();
