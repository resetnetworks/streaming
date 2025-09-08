// src/components/user/PaymentMethodModal.jsx
import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { SiRazorpay } from 'react-icons/si';
import { FaPaypal } from 'react-icons/fa6';

const PaymentMethodModal = ({ 
  open, 
  onClose, 
  onSelectMethod, 
  item, 
  itemType 
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
      description: 'Secure PayPal payment',
      icon: <FaPaypal className="w-6 h-6 text-blue-300" />,
      color: 'from-indigo-900 to-indigo-800',
      border: 'border-indigo-700',
      hover: 'hover:from-indigo-800 hover:to-indigo-700'
    }
  ];

  if (!open && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
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
            <div className="p-2 bg-blue-900 rounded-lg">
              <FaCreditCard className="w-5 h-5 text-blue-300" />
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
          {/* Item Info */}
          <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              {itemType === 'song' ? 'Song Purchase' : 'Album Purchase'}
            </p>
            <p className="text-lg font-medium mt-1 truncate">{item?.title}</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              ₹{item?.price}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {paymentMethods.map((method) => (
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
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
          <FaLock className="w-4 h-4" />
          <span>All transactions are secure and encrypted</span>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors duration-300 font-medium"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;