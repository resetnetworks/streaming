// src/utils/analytics/sanitizer.js
import { generateUUID } from "./uuid.js";
import { isValidObjectId, identity } from "./identity.js";
import { ALLOWED_EVENT_NAMES } from "./constants.js";

/**
 * Infer rough client device type from browser environment.
 */
function getClientDeviceType() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "desktop";
  }
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|iphone|ipod|android.*mobile|blackberry|windows phone/i.test(ua)) {
    return "mobile";
  }
  if (/ipad|tablet|android(?!.*mobile)/i.test(ua) || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024)) {
    return "tablet";
  }
  return "desktop";
}

/**
 * Sanitizes properties to prevent circular structures, deep nesting (>3 levels), and undefined values.
 */
function sanitizeProperties(props, depth = 0) {
  if (!props || typeof props !== "object" || depth >= 3) {
    return {};
  }

  const result = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || typeof value === "function" || typeof value === "symbol") {
      continue;
    }
    if (value === null || typeof value !== "object") {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.slice(0, 20).map((item) => (typeof item === "object" ? sanitizeProperties(item, depth + 1) : item));
    } else {
      result[key] = sanitizeProperties(value, depth + 1);
    }
  }
  return result;
}

/**
 * Validates and prepares an analytics event payload for ingestion.
 *
 * @param {string} eventName
 * @param {Object} properties
 * @param {Object} entities - Optional { songId, albumId, artistId }
 * @returns {Object|null} Sanitized event payload, or null if invalid
 */
export function sanitizeEventPayload(eventName, properties = {}, entities = {}) {
  if (!eventName || typeof eventName !== "string" || !ALLOWED_EVENT_NAMES.includes(eventName)) {
    console.warn(`[AnalyticsSDK] Skipped invalid eventName: "${eventName}"`);
    return null;
  }

  const currentIdentity = identity.getIdentity();

  // Entity ID sanitization: Backend strictly requires valid MongoDB ObjectIds.
  // If a slug or invalid format was passed, safely place it in properties instead of top-level entity fields.
  const sanitizedEntities = {};
  const enrichedProperties = { ...properties };

  const checkAndSetEntity = (field, slugField, val) => {
    if (!val) return;
    const strVal = String(val).trim();
    if (isValidObjectId(strVal)) {
      sanitizedEntities[field] = strVal;
    } else {
      // Preserve as slug or raw property so worker entity enricher can lookup by slug
      enrichedProperties[slugField] = strVal;
    }
  };

  checkAndSetEntity("songId", "songSlug", entities.songId || properties.songId);
  checkAndSetEntity("albumId", "albumSlug", entities.albumId || properties.albumId);
  checkAndSetEntity("artistId", "artistSlug", entities.artistId || properties.artistId);

  // Client context enrichment
  const context = {
    platform: "web",
    deviceType: getClientDeviceType(),
    locale: typeof navigator !== "undefined" ? navigator.language : "en-US",
    screen:
      typeof window !== "undefined" && window.screen
        ? `${window.screen.width}x${window.screen.height}`
        : "unknown",
    viewport:
      typeof window !== "undefined"
        ? `${window.innerWidth}x${window.innerHeight}`
        : "unknown",
    page: {
      url: typeof window !== "undefined" ? window.location.href : "",
      path: typeof window !== "undefined" ? window.location.pathname : "",
      title: typeof document !== "undefined" ? document.title : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
    },
  };

  return {
    eventId: generateUUID(),
    eventName,
    occurredAt: new Date().toISOString(),
    eventVersion: 1,
    anonymousId: currentIdentity.anonymousId,
    sessionId: currentIdentity.sessionId,
    ...(currentIdentity.userId ? { userId: currentIdentity.userId } : {}),
    ...sanitizedEntities,
    properties: sanitizeProperties(enrichedProperties),
    context,
  };
}
