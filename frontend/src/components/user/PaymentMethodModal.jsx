// src/components/user/PaymentMethodModal.jsx
import React, { useState, useEffect } from 'react';
import { FaMusic, FaLock } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { SiRazorpay } from 'react-icons/si';
import { FaPaypal } from 'react-icons/fa6';

const PaymentMethodModal = ({
  open,
  onClose,
  onSelectMethod,
  item,
  itemType,
  currencyData = null, // ✅ Add currency data prop
  getPaymentDisplayInfo = null // ✅ Add helper function prop
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

  // ✅ Helper function to get currency symbol with null safety
  const getCurrencySymbol = (currency) => {
    if (!currency) return '$'; // Default fallback
    
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr',
      'NZD': 'NZ$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
      'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R'
    };
    return symbols[currency] || currency;
  };

  // ✅ PayPal supported currencies list (PayPal doesn't support INR)
  const paypalSupportedCurrencies = [
    'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'EUR', 'HKD', 
    'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 
    'PHP', 'PLN', 'GBP', 'SGD', 'SEK', 'CHF', 'THB', 'USD'
  ];

  // ✅ Razorpay supports 130+ currencies including all major ones
  const razorpaySupportedCurrencies = [
    // Major currencies
    'USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK',
    'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'BRL', 'ZAR',
    // Additional currencies supported by Razorpay
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AWG', 'AZN',
    'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB',
    'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CDF', 'CLF', 'CLP', 'COP',
    'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DOP', 'DZD', 'EGP',
    'ERN', 'ETB', 'FJD', 'FKP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD',
    'GNF', 'GTQ', 'GYD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS',
    'IMP', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'KES', 'KGS',
    'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP',
    'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK',
    'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MZN', 'NAD', 'NGN',
    'NIO', 'NPR', 'OMR', 'PAB', 'PEN', 'PGK', 'PKR', 'PYG', 'QAR',
    'RON', 'RSD', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SHP', 'SLE',
    'SLL', 'SOS', 'SRD', 'STD', 'STN', 'SVC', 'SYP', 'SZL', 'TJS',
    'TMT', 'TND', 'TOP', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX',
    'UYU', 'UZS', 'VED', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD',
    'XDR', 'XOF', 'XPF', 'YER', 'ZMW', 'ZWL'
  ];

  // ✅ Get payment display information with null safety
  const getDisplayInfo = () => {
    // Use helper function if available
    if (getPaymentDisplayInfo) {
      return getPaymentDisplayInfo();
    }

    // Fallback logic with null safety
    if (currencyData && currencyData.currency) {
      return {
        amount: currencyData.amount || 0,
        currency: currencyData.currency,
        symbol: currencyData.symbol || getCurrencySymbol(currencyData.currency),
        displayPrice: `${currencyData.symbol || getCurrencySymbol(currencyData.currency)}${currencyData.amount || 0}`,
        isBaseCurrency: currencyData.isBaseCurrency || false
      };
    }
    
    if (item?.basePrice && item.basePrice.currency) {
      const symbol = getCurrencySymbol(item.basePrice.currency);
      return {
        amount: item.basePrice.amount || 0,
        currency: item.basePrice.currency,
        symbol,
        displayPrice: `${symbol}${item.basePrice.amount || 0}`,
        isBaseCurrency: true
      };
    }
    
    // Final fallback with safe defaults
    return {
      amount: item?.price || 0,
      currency: 'USD',
      symbol: '$',
      displayPrice: `$${item?.price || 0}`,
      isBaseCurrency: true
    };
  };

  // ✅ Get filtered payment methods based on currency with comprehensive support
  const getAvailablePaymentMethods = (selectedCurrency) => {
    if (!selectedCurrency) return []; // Return empty if no currency

    const allMethods = [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'UPI, Cards, Net Banking & Wallets',
        icon: <SiRazorpay className="w-7 h-7 text-blue-400" />,
        color: 'from-blue-900 to-blue-800',
        border: 'border-blue-700',
        hover: 'hover:from-blue-800 hover:to-blue-700',
        supportedCurrencies: razorpaySupportedCurrencies
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Secure PayPal payment',
        icon: <FaPaypal className="w-6 h-6 text-blue-300" />,
        color: 'from-indigo-900 to-indigo-800',
        border: 'border-indigo-700',
        hover: 'hover:from-indigo-800 hover:to-indigo-700',
        supportedCurrencies: paypalSupportedCurrencies
      }
    ];

    // Filter methods based on selected currency
    return allMethods.filter(method => {
      return method.supportedCurrencies.includes(selectedCurrency);
    });
  };

  if (!open && !isVisible) return null;
  
  if (open && !item) return null;

  const displayInfo = getDisplayInfo();
  const availablePaymentMethods = getAvailablePaymentMethods(displayInfo?.currency);

  return (
    <>
      <div className={`fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-700 transition-transform duration-300 ${open ? 'scale-100' : 'scale-95'}`}>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <img src={`${window.location.origin}/icon.png`} alt="resetmusic logo icon" className="w-6 h-6" />
              </div>
              Select Payment Method
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <MdClose className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Item Info with Currency */}
          <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaMusic className="w-4 h-4 text-blue-400" />
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                {itemType === 'album' ? 'Album Purchase' : 'Single Purchase'}
              </p>
            </div>
            
            <p className="text-lg font-medium text-white truncate">
              {item?.title || 'Unknown Item'}
            </p>
            
            <p className="text-sm text-gray-300 mt-1">
              {item?.artist?.name || 'Various Artists'}
            </p>
            
            {/* ✅ Enhanced Price Display with Currency Info and null safety */}
            <div className="mt-4">
              <p className="text-3xl font-bold text-blue-400 mb-2">
                {displayInfo?.displayPrice || '$0'}
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  {displayInfo?.currency || 'USD'}
                </span>
                
                {displayInfo?.isBaseCurrency && (
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                    Base Price
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                One-time purchase • Lifetime access
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Choose Payment Method:
            </h3>
            
            {availablePaymentMethods.length > 0 ? (
              availablePaymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onSelectMethod(method.id)}
                  className={`w-full p-4 rounded-xl border ${method.border} bg-gradient-to-r ${method.color} ${method.hover} text-white transition-all duration-300 flex items-center gap-4 shadow-lg group`}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-30 rounded-lg">
                    {method.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-lg">{method.name}</div>
                    <div className="text-xs text-gray-300 mt-1">{method.description}</div>
                  </div>
                  <div className="text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
                    →
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-400 mb-2">No payment methods available</p>
                <p className="text-xs text-gray-500">
                  Selected currency ({displayInfo?.currency || 'Unknown'}) is not supported by available payment gateways
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  Select Different Currency
                </button>
              </div>
            )}

            {/* ✅ Currency Support Information */}
            {displayInfo?.currency === 'INR' && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400">💡</span>
                  <span className="text-xs font-semibold text-blue-400">Currency Info:</span>
                </div>
                <p className="text-xs text-blue-200">
                  PayPal doesn't support INR payments. Razorpay supports all major currencies including INR with great exchange rates.
                </p>
              </div>
            )}

            {displayInfo?.currency && !paypalSupportedCurrencies.includes(displayInfo.currency) && displayInfo.currency !== 'INR' && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">✅</span>
                  <span className="text-xs font-semibold text-green-400">Razorpay Support:</span>
                </div>
                <p className="text-xs text-green-200">
                  Razorpay supports {displayInfo.currency} and 130+ other currencies. PayPal has limited currency support.
                </p>
              </div>
            )}
          </div>

          {/* Security & Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-700/30">
            <div className="flex items-center gap-2 mb-3">
              <FaLock className="w-4 h-4 text-green-400" />
              <h4 className="text-sm font-semibold text-green-400">Secure & Trusted:</h4>
            </div>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 256-bit SSL encryption</li>
              <li>• PCI DSS compliant</li>
              <li>• Instant download access</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 rounded-xl transition-all duration-300 font-medium"
          >
            Cancel Purchase
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentMethodModal;
