// ✅ ENHANCED MonetizationModal.jsx - Complete Debug Logging
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setupMonetization, resetMonetization } from '../../../features/monetization/monetizationSlice';
import { FaCreditCard, FaCheckCircle, FaClock, FaMoneyBillWave, FaSync, FaTimes } from 'react-icons/fa';

const ALLOWED_CYCLES = ["1m", "3m", "6m", "12m"];

const MonetizationModal = ({ isOpen, onClose, onComplete }) => {
  const dispatch = useDispatch();
  const {
    setupLoading,
    setupError,
    setupSuccess,
    operationResult,
  } = useSelector(state => state.monetization);

  const [subscriptionPrice, setSubscriptionPrice] = useState('');
  const [cycle, setCycle] = useState('1m');

  // ✅ DEBUG: Track modal lifecycle
  useEffect(() => {
    console.log('🎵 [MODAL] isOpen changed:', isOpen);
    console.log('🎵 [MODAL] Current Redux state:', { setupLoading, setupError, setupSuccess });
    console.log('🎵 [MODAL] localStorage user:', localStorage.getItem('user'));
    
    if (isOpen) {
      console.log('🎵 [MODAL] Modal opened - resetting state');
      setSubscriptionPrice('');
      setCycle('1m');
      dispatch(resetMonetization());
    }
  }, [isOpen, dispatch, setupLoading, setupError, setupSuccess]);

  // ✅ Auto close on success with logging
  useEffect(() => {
    console.log('🎵 [MODAL] setupSuccess changed:', setupSuccess);
    if (setupSuccess && onComplete) {
      console.log('🎵 [MODAL] Auto-closing modal in 1.5s');
      setTimeout(() => {
        console.log('🎵 [MODAL] Closing modal & calling onComplete');
        onClose();
        onComplete();
      }, 1500);
    }
  }, [setupSuccess, onClose, onComplete]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const price = parseFloat(subscriptionPrice);
    console.log('🎵 [MODAL] handleSubmit called:', { subscriptionPrice, price, cycle });
    
    if (!subscriptionPrice || price <= 0) {
      console.log('🎵 [MODAL] Invalid price:', subscriptionPrice);
      alert('Please enter a valid subscription price');
      return;
    }

    console.log('🎵 [MODAL] Dispatching setupMonetization with:', { 
      subscriptionPrice: price, 
      cycle 
    });
    console.log('🎵 [MODAL] Token before dispatch:', localStorage.getItem('token'));
    
    dispatch(setupMonetization({ 
      subscriptionPrice: price,
      cycle 
    }));
  };

  const getCycleDisplayName = (cycle) => {
    const cycleNames = {
      '1m': '1 Month', '3m': '3 Months', 
      '6m': '6 Months', '12m': '1 Year'
    };
    return cycleNames[cycle] || cycle;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaCreditCard className="text-blue-600" />
              Setup Monetization
            </h2>
            <p className="text-gray-600 mt-1">Start earning from your music</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-xl" 
            disabled={setupLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" />
              Subscription Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={subscriptionPrice}
                onChange={(e) => {
                  console.log('🎵 [MODAL] Price input changed:', e.target.value);
                  setSubscriptionPrice(e.target.value);
                }}
                placeholder="e.g., 9.99"
                className="w-full p-3 border border-gray-300 rounded-md pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0" step="0.01"
                disabled={setupLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">USD</div>
            </div>
          </div>

          {/* Cycle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Billing Cycle <span className="text-red-500">*</span>
            </label>
            <select
              value={cycle}
              onChange={(e) => {
                console.log('🎵 [MODAL] Cycle changed:', e.target.value);
                setCycle(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={setupLoading}
            >
              {ALLOWED_CYCLES.map(cycleOption => (
                <option key={cycleOption} value={cycleOption}>
                  {getCycleDisplayName(cycleOption)}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          {setupSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <FaCheckCircle className="mr-2" />
                <span className="font-medium">Monetization Setup Successful!</span>
              </div>
              {operationResult?.operationId && (
                <div className="mt-2 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {operationResult.operationId}
                  </code>
                </div>
              )}
              <p className="text-green-600 mt-2 text-sm">Closing in 1.5 seconds...</p>
            </div>
          )}

          {setupError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <FaTimes className="mr-2" />
                <span className="font-medium">Error: {setupError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {subscriptionPrice || '0'} USD · {getCycleDisplayName(cycle)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                console.log('🎵 [MODAL] Cancel clicked');
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={setupLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={setupLoading || !subscriptionPrice}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 disabled:opacity-50 flex items-center"
            >
              {setupLoading ? (
                <>
                  <FaSync className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  Setup Monetization
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetizationModal;
