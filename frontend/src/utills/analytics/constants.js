// src/utils/analytics/constants.js

export const EVENT_CATEGORIES = Object.freeze({
  ACQUISITION: "acquisition",
  AUTHENTICATION: "authentication",
  DISCOVERY: "discovery",
  PLAYBACK: "playback",
  ENGAGEMENT: "engagement",
  MONETIZATION: "monetization",
});

export const EVENT_TYPES = Object.freeze({
  // Acquisition
  LANDING_PAGE_VIEWED: "landing_page_viewed",
  HOME_PAGE_VIEWED: "home_page_viewed",

  // Authentication
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_COMPLETED: "login_completed",

  // Discovery
  ARTIST_VIEWED: "artist_viewed",
  ALBUM_VIEWED: "album_viewed",
  SONG_VIEWED: "song_viewed",
  SEARCH_PERFORMED: "search_performed",
  SEARCH_RESULT_CLICKED: "search_result_clicked",

  // Playback
  PLAYBACK_STARTED: "playback_started",
  PLAYBACK_30S: "playback_30s",
  PLAYBACK_50_PERCENT: "playback_50_percent",
  PLAYBACK_COMPLETED: "playback_completed",
  PLAYBACK_SKIPPED: "playback_skipped",
  PREVIEW_STARTED: "preview_started",

  // Engagement
  SONG_LIKED: "song_liked",
  SONG_UNLIKED: "song_unliked",
  ARTIST_FOLLOWED: "artist_followed",
  ARTIST_UNFOLLOWED: "artist_unfollowed",
  PLAYLIST_CREATED: "playlist_created",
  SONG_ADDED_TO_PLAYLIST: "song_added_to_playlist",

  // Monetization & Subscription Funnel
  SUBSCRIPTION_CLICKED: "subscription_clicked",
  CHECKOUT_STARTED: "checkout_started",
  PAYMENT_INITIATED: "payment_initiated",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_FAILED: "payment_failed",
  PAYMENT_ABANDONED: "payment_abandoned",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_FAILED: "purchase_failed",
  COUPON_APPLIED: "coupon_applied",
});

export const ALLOWED_EVENT_NAMES = Object.freeze(Object.values(EVENT_TYPES));

export const DEFAULT_CONFIG = Object.freeze({
  batchSize: 10,
  flushIntervalMs: 5000, // 5 seconds
  maxBatchSize: 50, // backend MAX_BATCH_EVENT_SIZE
  maxOfflineQueueSize: 300,
  maxRetries: 3,
  initialRetryDelayMs: 1000,
  maxRetryDelayMs: 15000,
  sessionInactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
  debug: false,
});

export const STORAGE_KEYS = Object.freeze({
  ANONYMOUS_ID: "__analytics_anon_id__",
  SESSION_ID: "__analytics_session_id__",
  SESSION_LAST_ACTIVE: "__analytics_session_last_active__",
  OFFLINE_QUEUE: "__analytics_offline_queue__",
  USER_ID: "__analytics_user_id__",
});
