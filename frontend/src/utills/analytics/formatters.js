// src/utills/analytics/formatters.js

/**
 * Formats large numeric values into clean compact strings.
 * Examples: 0 -> "0", 850 -> "850", 1200 -> "1.2K", 45800 -> "45.8K", 1500000 -> "1.5M", 2500000000 -> "2.5B"
 *
 * @param {number|string} value
 * @param {number} decimals
 * @returns {string}
 */
export const formatCompactNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "0";
  }

  const num = Number(value);
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(decimals).replace(/\.0$/, "");
    return `${formatted}B`;
  }
  if (abs >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(decimals).replace(/\.0$/, "");
    return `${formatted}M`;
  }
  if (abs >= 1_000) {
    const formatted = (num / 1_000).toFixed(decimals).replace(/\.0$/, "");
    return `${formatted}K`;
  }

  return num.toLocaleString();
};

/**
 * Formats a percentage number with a % suffix.
 * Examples: 64.2 -> "64.2%", 0 -> "0%", 100 -> "100%"
 *
 * @param {number|string} rate
 * @param {number} decimals
 * @returns {string}
 */
export const formatPercentage = (rate, decimals = 1) => {
  if (rate === null || rate === undefined || isNaN(Number(rate))) {
    return "0%";
  }
  const num = Number(rate);
  const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(decimals);
  return `${formatted}%`;
};

/**
 * Formats cents into formatted USD currency string.
 * Examples: 2450 -> "$24.50", "$24.50" -> "$24.50", 0 -> "$0.00"
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (typeof value === "string" && value.startsWith("$")) {
    return value;
  }
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "$0.00";
  }
  const cents = Number(value);
  return `$${(cents / 100).toFixed(2)}`;
};

/**
 * Formats a decimal currency amount (standard currency units, not cents) into clean localized currency string.
 * Examples: 17.55 -> "$17.55", 19.55 -> "$19.55", 0 -> "$0.00"
 *
 * @param {number|string} amount
 * @param {string} [currency="USD"]
 * @returns {string}
 */
export const formatDollarAmount = (amount, currency = "USD") => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "$0.00";
  }
  const numericAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formats date string (YYYY-MM-DD) into readable chart/label string (e.g. "Oct 26").
 *
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDateLabel = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
};
