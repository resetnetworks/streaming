// src/utils/analytics/uuid.js

/**
 * Generates an RFC 4122 version 4 compliant UUID.
 * Uses native crypto.randomUUID() when available with high-entropy fallback.
 *
 * @returns {string} 36-character UUID string (e.g. "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")
 */
export function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to crypto.getRandomValues fallback
    }
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version 4 bits: 0100
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant bits: 10xx
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Math.random fallback (e.g., SSR or older embedded webviews)
  let d = Date.now();
  let d2 = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
