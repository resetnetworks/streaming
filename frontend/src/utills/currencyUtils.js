// src/utils/currencyUtils.js

/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @returns {string} - Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
    'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr',
    'NZD': 'NZ$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
    'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R'
  };
  return symbols[currency] || currency;
};

/**
 * Get available currencies for an item (song/album)
 * @param {Object} item - Item object with basePrice and convertedPrices
 * @returns {Array} - Array of available currencies
 */
export const getAvailableCurrencies = (item) => {
  if (!item?.basePrice || !item?.convertedPrices) return [];
  
  const currencies = [
    { 
      currency: item.basePrice.currency, 
      amount: item.basePrice.amount, 
      isBaseCurrency: true 
    },
    ...item.convertedPrices.map(price => ({
      currency: price.currency, 
      amount: price.amount, 
      isBaseCurrency: false
    }))
  ];
  
  return currencies;
};

/**
 * Format price with currency symbol
 * @param {number} amount - Price amount
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price string
 */
export const formatPriceWithSymbol = (amount, currency) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount}`;
};

/**
 * Check if item has multiple currency options
 * @param {Object} item - Item object with basePrice and convertedPrices
 * @returns {boolean} - True if multiple currencies available
 */
export const hasMultipleCurrencies = (item) => {
  return getAvailableCurrencies(item).length > 1;
};
