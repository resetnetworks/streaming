// src/components/user/PayPalCurrencySelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { FaPaypal, FaGlobeAmericas } from 'react-icons/fa';
import { MdClose, MdArrowBack } from 'react-icons/md';
import { BiWorld } from 'react-icons/bi';

const PayPalCurrencySelectionModal = ({
  open,
  onClose,
  onSelectCurrency,
  onBack,
  artist,
  cycle,
  paypalPlans = []
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NZD': 'NZ$',
      'MXN': '$',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NOK': 'kr',
      'TRY': '₺',
      'RUB': '₽',
      'BRL': 'R$',
      'ZAR': 'R'
    };
    return symbols[currency] || currency;
  };

  // Helper function to get currency name
  const getCurrencyName = (currency) => {
    const names = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'INR': 'Indian Rupee',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'CHF': 'Swiss Franc',
      'CNY': 'Chinese Yuan',
      'SEK': 'Swedish Krona',
      'NZD': 'New Zealand Dollar',
      'MXN': 'Mexican Peso',
      'SGD': 'Singapore Dollar',
      'HKD': 'Hong Kong Dollar',
      'NOK': 'Norwegian Krone',
      'TRY': 'Turkish Lira',
      'RUB': 'Russian Ruble',
      'BRL': 'Brazilian Real',
      'ZAR': 'South African Rand'
    };
    return names[currency] || currency;
  };

  // Helper function to get cycle display text
  const getCycleDisplayText = (cycle) => {
    if (!cycle || typeof cycle !== 'string') {
      return '1 Month';
    }
    
    const cycleMap = {
      '1m': '1 Month',
      '3m': '3 Months', 
      '6m': '6 Months',
      '12m': '12 Months'
    };
    return cycleMap[cycle] || cycle;
  };

  // ✅ NEW: Get current subscription plan for the selected cycle
  const getCurrentSubscriptionPlan = () => {
    if (!artist?.subscriptionPlans || !cycle) return null;
    return artist.subscriptionPlans.find(plan => plan.cycle === cycle);
  };

  // ✅ NEW: Get converted prices from API data
  const getApiConvertedPrices = () => {
    const currentPlan = getCurrentSubscriptionPlan();
    if (!currentPlan) return [];

    const { basePrice, convertedPrices = [] } = currentPlan;
    
    // Combine base price and converted prices
    const allPrices = [
      {
        currency: basePrice?.currency || 'USD',
        amount: basePrice?.amount || 100,
        isBaseCurrency: true
      },
      ...convertedPrices.map(price => ({
        currency: price.currency,
        amount: price.amount,
        isBaseCurrency: false
      }))
    ];

    return allPrices;
  };

  // ✅ NEW: Filter PayPal plans based on available converted prices
  const getAvailablePayPalPlans = () => {
    const convertedPrices = getApiConvertedPrices();
    
    return paypalPlans
      .map(paypalPlan => {
        // Find matching converted price for this PayPal plan currency
        const matchingPrice = convertedPrices.find(
          price => price.currency === paypalPlan.currency
        );

        if (!matchingPrice) return null;

        // Return enhanced PayPal plan with actual converted amount
        return {
          ...paypalPlan,
          amount: matchingPrice.amount,
          isBaseCurrency: matchingPrice.isBaseCurrency
        };
      })
      .filter(Boolean); // Remove null entries
  };

  // Get gradient colors for currencies
  const getCurrencyGradient = (index) => {
    const gradients = [
      'from-blue-600 to-blue-800',
      'from-green-600 to-green-800',
      'from-purple-600 to-purple-800',
      'from-orange-600 to-orange-800',
      'from-pink-600 to-pink-800',
      'from-indigo-600 to-indigo-800',
      'from-red-600 to-red-800',
      'from-teal-600 to-teal-800',
      'from-cyan-600 to-cyan-800',
      'from-amber-600 to-amber-800'
    ];
    return gradients[index % gradients.length];
  };

  // Don't render if not open
  if (!open && !isVisible) return null;
  
  // Safety checks
  if (open && (!artist || !cycle)) {
    return null;
  }

  const cycleDisplayText = getCycleDisplayText(cycle);
  const availablePayPalPlans = getAvailablePayPalPlans();

  // ✅ NEW: Show message if no converted prices available
  if (!availablePayPalPlans.length) {
    return (
      <>
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <MdArrowBack className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaPaypal className="w-6 h-6 text-blue-400" />
                  Currency Selection
                </h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                <MdClose className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">No currency options available for PayPal at this time.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-700 transition-transform duration-300 ${open ? 'scale-100' : 'scale-95'} max-h-[90vh] overflow-y-auto custom-scrollbar`}>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <FaPaypal className="w-6 h-6 text-blue-400" />
                Select Currency
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <MdClose className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Artist Info */}
          <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BiWorld className="w-4 h-4 text-blue-400" />
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                PayPal Subscription - {cycleDisplayText}
              </p>
            </div>
            <p className="text-lg font-medium text-white">{artist?.name || 'Unknown Artist'}</p>
            <p className="text-xs text-gray-500 mt-1">
              Choose your preferred currency for PayPal checkout
            </p>
          </div>

          {/* Currency Selection Grid */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
              <FaGlobeAmericas className="w-4 h-4" />
              Available Currencies ({availablePayPalPlans.length})
            </h3>
            
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {availablePayPalPlans.map((plan, index) => {
                const currency = plan.currency;
                const amount = plan.amount;
                const symbol = getCurrencySymbol(currency);
                const currencyName = getCurrencyName(currency);
                const gradient = getCurrencyGradient(index);

                return (
                  <button
                    key={`${currency}-${index}`}
                    onClick={() => onSelectCurrency(plan)}
                    className={`w-full p-4 rounded-xl border border-gray-600 bg-gradient-to-r ${gradient} hover:scale-[1.02] text-white transition-all duration-300 flex items-center justify-between shadow-lg group hover:shadow-xl relative overflow-hidden`}
                  >
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center sm:w-12 sm:h-12 h-10 w-10 bg-black bg-opacity-30 rounded-lg border border-white border-opacity-20">
                        <span className="md:text-xl text-lg font-bold">{symbol}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold md:text-lg text-base">{currency}</div>
                        <div className="text-xs text-gray-200 mt-1">{currencyName}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="md:text-2xl text-xl font-bold">
                        {symbol}{amount % 1 === 0 ? amount : amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-200">
                        per {cycle === '1m' ? 'month' : cycleDisplayText.toLowerCase()}
                      </div>
                    </div>
                    
                    <div className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                      →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PayPal Info */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaPaypal className="w-5 h-5 text-blue-300" />
              <h4 className="text-sm font-semibold text-blue-300">PayPal Benefits:</h4>
            </div>
            <ul className="text-xs text-blue-200 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Secure international payments
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Buyer protection included
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Real-time currency conversion
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Cancel subscription anytime
              </li>
            </ul>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 rounded-xl transition-all duration-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default PayPalCurrencySelectionModal;
