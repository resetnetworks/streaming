// src/components/user/SubscriptionMethodModal.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaCalendarAlt } from 'react-icons/fa';
import { MdClose, MdSubscriptions } from 'react-icons/md';
import { SiRazorpay } from 'react-icons/si';
import { FaPaypal } from 'react-icons/fa6';
import PayPalCurrencySelectionModal from './PayPalCurrencySelectionModal';

const SubscriptionMethodModal = ({
  open,
  onClose,
  onSelectMethod,
  artist,
  cycle,
  subscriptionPrice
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPayPalCurrency, setShowPayPalCurrency] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'UPI, Cards, Net Banking & Wallets',
      icon: <SiRazorpay className="w-7 h-7 text-blue-400" />,
      color: 'from-blue-900 to-blue-800',
      border: 'border-blue-700',
      hover: 'hover:from-blue-800 hover:to-blue-700'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Secure PayPal subscription',
      icon: <FaPaypal className="w-6 h-6 text-blue-300" />,
      color: 'from-indigo-900 to-indigo-800',
      border: 'border-indigo-700',
      hover: 'hover:from-indigo-800 hover:to-indigo-700'
    }
  ];

  const getCycleDisplayText = (cycle) => {
    if (!cycle || typeof cycle !== 'string') return '1 Month';
    const cycleMap = {
      '1m': '1 Month',
      '3m': '3 Months',
      '6m': '6 Months',
      '12m': '12 Months'
    };
    return cycleMap[cycle] || cycle;
  };

  const safeToLowerCase = (text) => {
    if (!text || typeof text !== 'string') return 'month';
    return text.toLowerCase();
  };

  const handleMethodSelect = (methodId) => {
    if (methodId === 'paypal') {
      const paypalPlans = artist?.subscriptionPlans?.[0]?.paypalPlans || [];
      if (paypalPlans.length > 1) {
        setShowPayPalCurrency(true);
      } else if (paypalPlans.length === 1) {
        onSelectMethod('paypal', { paypalPlan: paypalPlans[0] });
      } else {
        alert('PayPal subscription is not available for this artist.');
      }
    } else {
      onSelectMethod(methodId);
    }
  };

  const handlePayPalCurrencySelect = (selectedPlan) => {
    setShowPayPalCurrency(false);
    onSelectMethod('paypal', { paypalPlan: selectedPlan });
  };

  const handlePayPalBack = () => setShowPayPalCurrency(false);
  const handlePayPalCurrencyClose = () => setShowPayPalCurrency(false);

  if (!open && !isVisible) return null;
  if (open && (!artist || !cycle || subscriptionPrice === undefined)) return null;

  const cycleDisplayText = getCycleDisplayText(cycle);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-300 ${
          open && !showPayPalCurrency ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={onClose}
        />

        {/* Modal Content — scrollable on small screens */}
        <div
          className={`relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl 
            w-full mx-4 border border-gray-700 
            transition-transform duration-300 
            ${open && !showPayPalCurrency ? 'scale-100' : 'scale-95'}
            max-w-md
            max-h-[90vh] overflow-y-auto
            flex flex-col
          `}
        >
          {/* Inner padding wrapper */}
          <div className="p-4 sm:p-6 flex flex-col gap-4">

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gray-800 rounded-lg shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <img
                    src={`${window.location.origin}/icon.png`}
                    alt="resetmusic logo icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                Select Payment Method
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors shrink-0"
              >
                <MdClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </button>
            </div>

            {/* Subscription Info */}
            <div className="text-center p-3 sm:p-4 bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FaUser className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Artist Subscription
                </p>
              </div>
              <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                <p className="text-base sm:text-lg font-medium truncate max-w-[180px] sm:max-w-none">
                  {artist?.name || 'Unknown Artist'}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>{cycleDisplayText}</span>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-2">
                ${subscriptionPrice || 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Recurring every {safeToLowerCase(cycleDisplayText)}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2 sm:space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`w-full p-3 sm:p-4 rounded-xl border ${method.border} bg-gradient-to-r ${method.color} ${method.hover} 
                    text-white transition-all duration-300 flex items-center gap-3 sm:gap-4 shadow-lg group`}
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black bg-opacity-30 rounded-lg shrink-0">
                    {method.icon}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-base sm:text-lg">{method.name}</div>
                    <div className="text-xs text-gray-300 mt-0.5">{method.description}</div>
                    {method.id === 'paypal' &&
                      artist?.subscriptionPlans?.[0]?.paypalPlans?.length > 1 && (
                        <div className="text-xs text-yellow-300 mt-0.5">
                          {artist.subscriptionPlans[0].paypalPlans.length} currencies available
                        </div>
                      )}
                  </div>
                  <div className="text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1 shrink-0">
                    →
                  </div>
                </button>
              ))}
            </div>

            {/* Subscription Benefits */}
            <div className="p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
              <h4 className="text-xs sm:text-sm font-semibold text-blue-300 mb-1.5">
                Subscription Benefits:
              </h4>
              <ul className="text-xs text-blue-200 space-y-0.5 sm:space-y-1">
                <li>• Access to all exclusive content</li>
                <li>• High-quality audio streaming</li>
                <li>• Early access to new releases</li>
                <li>• Cancel anytime</li>
              </ul>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-700 text-xs sm:text-sm text-gray-400">
              <FaLock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>All subscriptions are secure and encrypted</span>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors duration-300 font-medium text-sm sm:text-base"
            >
              Cancel Subscription
            </button>

          </div>
        </div>
      </div>

      {/* PayPal Currency Selection Modal */}
      <PayPalCurrencySelectionModal
        open={showPayPalCurrency}
        onClose={handlePayPalCurrencyClose}
        onBack={handlePayPalBack}
        onSelectCurrency={handlePayPalCurrencySelect}
        artist={artist}
        cycle={cycle}
        paypalPlans={artist?.subscriptionPlans?.[0]?.paypalPlans || []}
      />
    </>
  );
};

export default SubscriptionMethodModal;