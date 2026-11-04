// src/utils/analytics/index.js

import { analytics, AnalyticsClient } from "./analyticsClient.js";

export { analytics, AnalyticsClient };
export { EventQueue } from "./eventQueue.js";
export { identity, isValidObjectId } from "./identity.js";
export { generateUUID } from "./uuid.js";
export { sanitizeEventPayload } from "./sanitizer.js";
export {
  EVENT_TYPES,
  EVENT_CATEGORIES,
  ALLOWED_EVENT_NAMES,
  DEFAULT_CONFIG,
  STORAGE_KEYS,
} from "./constants.js";
export { usePlayerAnalytics } from "./hooks/usePlayerAnalytics.js";
export { useRouteAnalytics, RouteAnalyticsListener } from "./hooks/useRouteAnalytics.js";
export { useSearchAnalytics } from "./hooks/useSearchAnalytics.js";

export default analytics;
