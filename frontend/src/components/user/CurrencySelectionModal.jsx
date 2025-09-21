// src/components/user/CurrencySelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose, MdAlbum } from 'react-icons/md';
import { FaMusic, FaGlobeAmericas } from 'react-icons/fa';
import { BiWorld } from 'react-icons/bi';

const CurrencySelectionModal = ({
  open,
  onClose,
  onSelectCurrency,
  item, // Generic item (album/song)
  itemType, // 'album' or 'song'
  title // Optional custom title
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

  // Get available currencies for the item
  const getAvailableCurrencies = () => {
    if (!item?.basePrice || !item?.convertedPrices) return [];
    
    return [
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

  // Get display content based on itemType
  const getDisplayContent = () => {
    const baseContent = {
      icon: itemType === 'album' ? MdAlbum : FaMusic,
      iconColor: itemType === 'album' ? 'text-blue-400' : 'text-green-400',
      purchaseType: itemType === 'album' ? 'Album Purchase' : 'Song Purchase',
      itemTitle: item?.title || `Unknown ${itemType}`,
      itemSubtitle: itemType === 'album' 
        ? (item?.artist?.name || 'Various Artists') 
        : (item?.album?.title || item?.artist?.name || 'Unknown Artist'),
      benefits: itemType === 'album' 
        ? [
            'Lifetime access to album',
            'High-quality audio download',
            'Secure payment processing',
            'Support the artist directly'
          ]
        : [
            'Lifetime access to song',
            'High-quality audio download',
            'Secure payment processing', 
            'Support the artist directly'
          ]
    };

    return {
      ...baseContent,
      modalTitle: title || `Select Currency - ${baseContent.purchaseType}`
    };
  };

  // Don't render if not open
  if (!open && !isVisible) return null;
  
  // Safety checks
  if (open && !item) {
    return null;
  }

  const availableCurrencies = getAvailableCurrencies();
  const displayContent = getDisplayContent();
  const IconComponent = displayContent.icon;

  // Show message if no converted prices available
  if (!availableCurrencies.length) {
    return (
      <>
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <IconComponent className={`w-6 h-6 ${displayContent.iconColor}`} />
                Currency Selection
              </h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                <MdClose className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">No currency options available for this {itemType}.</p>
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
            <h2 className="text-xl font-bold flex items-center gap-3">
              <IconComponent className={`w-6 h-6 ${displayContent.iconColor}`} />
              Select Currency
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <MdClose className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Item Info */}
          <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconComponent className={`w-4 h-4 ${displayContent.iconColor}`} />
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                {displayContent.purchaseType}
              </p>
            </div>
            <p className="text-lg font-medium text-white truncate">{displayContent.itemTitle}</p>
            <p className="text-sm text-gray-300 mt-1">{displayContent.itemSubtitle}</p>
            <p className="text-xs text-gray-500 mt-1">
              Choose your preferred currency for purchase
            </p>
          </div>

          {/* Currency Selection Grid */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
              <FaGlobeAmericas className="w-4 h-4" />
              Available Currencies ({availableCurrencies.length})
            </h3>
            
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {availableCurrencies.map((currencyOption, index) => {
                const currency = currencyOption.currency;
                const amount = currencyOption.amount;
                const symbol = getCurrencySymbol(currency);
                const currencyName = getCurrencyName(currency);
                const gradient = getCurrencyGradient(index);

                return (
                  <button
                    key={`${currency}-${index}`}
                    onClick={() => onSelectCurrency(currencyOption)}
                    className={`w-full p-4 rounded-xl border border-gray-600 bg-gradient-to-r ${gradient} hover:scale-[1.02] text-white transition-all duration-300 flex items-center justify-between shadow-lg group hover:shadow-xl relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center sm:w-12 sm:h-12 h-10 w-10 bg-black bg-opacity-30 rounded-lg border border-white border-opacity-20">
                        <span className="md:text-xl text-lg font-bold">{symbol}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold md:text-lg text-base">{currency}</div>
                        <div className="text-xs text-gray-200 mt-1">{currencyName}</div>
                        {currencyOption.isBaseCurrency && (
                          <div className="text-xs text-yellow-300 mt-1">Base Price</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="md:text-2xl text-xl font-bold">
                        {symbol}{amount % 1 === 0 ? amount : amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-200">
                        one-time purchase
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

          {/* Purchase Benefits */}
          <div className={`mt-4 p-4 bg-gradient-to-r ${itemType === 'album' ? 'from-blue-900/30 to-indigo-900/30 border-blue-700/50' : 'from-green-900/30 to-emerald-900/30 border-green-700/50'} rounded-lg border backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-3">
              <IconComponent className={`w-5 h-5 ${itemType === 'album' ? 'text-blue-300' : 'text-green-300'}`} />
              <h4 className={`text-sm font-semibold ${itemType === 'album' ? 'text-blue-300' : 'text-green-300'}`}>Purchase Benefits:</h4>
            </div>
            <ul className={`text-xs ${itemType === 'album' ? 'text-blue-200' : 'text-green-200'} space-y-2`}>
              {displayContent.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className={`w-1 h-1 ${itemType === 'album' ? 'bg-blue-400' : 'bg-green-400'} rounded-full`}></span>
                  {benefit}
                </li>
              ))}
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

export default CurrencySelectionModal;
