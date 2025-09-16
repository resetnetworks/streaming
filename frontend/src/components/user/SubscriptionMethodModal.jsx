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

  // Helper function with proper null checks
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

  // Safe toLowerCase function
  const safeToLowerCase = (text) => {
    if (!text || typeof text !== 'string') {
      return 'month';
    }
    return text.toLowerCase();
  };

  // Handle payment method selection
  const handleMethodSelect = (methodId) => {
    if (methodId === 'paypal') {
      // Check if artist has PayPal plans
      const paypalPlans = artist?.subscriptionPlans?.[0]?.paypalPlans || [];
      
      if (paypalPlans.length > 1) {
        // Show currency selection modal
        setShowPayPalCurrency(true);
      } else if (paypalPlans.length === 1) {
        // Directly use the single PayPal plan
        onSelectMethod('paypal', { paypalPlan: paypalPlans[0] });
      } else {
        // No PayPal plans available
        alert('PayPal subscription is not available for this artist.');
      }
    } else {
      // For other methods (Razorpay, etc.)
      onSelectMethod(methodId);
    }
  };

  // Handle PayPal currency selection
  const handlePayPalCurrencySelect = (selectedPlan) => {
    setShowPayPalCurrency(false);
    onSelectMethod('paypal', { paypalPlan: selectedPlan });
  };

  // Handle back from PayPal currency modal
  const handlePayPalBack = () => {
    setShowPayPalCurrency(false);
  };

  // Handle close PayPal currency modal
  const handlePayPalCurrencyClose = () => {
    setShowPayPalCurrency(false);
  };

  // Don't render modal if required props are missing
  if (!open && !isVisible) return null;
  
  if (open && (!artist || !cycle || subscriptionPrice === undefined)) {
    return null;
  }

  const cycleDisplayText = getCycleDisplayText(cycle);

  return (
    <>
      <div className={`fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-300 ${open && !showPayPalCurrency ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-700 transition-transform duration-300 ${open && !showPayPalCurrency ? 'scale-100' : 'scale-95'}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <img src={`${window.location.origin}/icon.png`} alt="resetmusic logo icon" />
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

          {/* Content */}
          <div className="space-y-4">
            {/* Subscription Info */}
            <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaUser className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-gray-400 uppercase tracking-wider">
                  Artist Subscription
                </p>
              </div>
              <div className='flex justify-center mt-1'>
              <p className="text-lg font-medium truncate">{artist?.name || 'Unknown Artist'}</p>
              
              <div className="flex items-center justify-center gap-4 ml-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>{cycleDisplayText}</span>
                </div>
              </div>
              </div>
              
              <p className="text-2xl font-bold text-blue-400 mt-3">
                ${subscriptionPrice || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Recurring every {safeToLowerCase(cycleDisplayText)}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`w-full p-4 rounded-xl border ${method.border} bg-gradient-to-r ${method.color} ${method.hover} text-white transition-all duration-300 flex items-center gap-4 shadow-lg group`}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-30 rounded-lg">
                    {method.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-lg">{method.name}</div>
                    <div className="text-xs text-gray-300 mt-1">{method.description}</div>
                    {method.id === 'paypal' && artist?.subscriptionPlans?.[0]?.paypalPlans?.length > 1 && (
                      <div className="text-xs text-yellow-300 mt-1">
                        {artist.subscriptionPlans[0].paypalPlans.length} currencies available
                      </div>
                    )}
                  </div>
                  <div className="text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
                    →
                  </div>
                </button>
              ))}
            </div>

            {/* Subscription Benefits */}
            <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">Subscription Benefits:</h4>
              <ul className="text-xs text-blue-200 space-y-1">
                <li>• Access to all exclusive content</li>
                <li>• High-quality audio streaming</li>
                <li>• Early access to new releases</li>
                <li>• Cancel anytime</li>
              </ul>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
            <FaLock className="w-4 h-4" />
            <span>All subscriptions are secure and encrypted</span>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors duration-300 font-medium"
          >
            Cancel Subscription
          </button>
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
