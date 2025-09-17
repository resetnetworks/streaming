// src/components/user/Artist/PaymentErrorNotification.jsx
import React from "react";

const PaymentErrorNotification = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-900/90 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 text-red-300 max-w-sm">
      <p className="text-sm">
        {error.message || "Payment failed. Please try again."}
      </p>
      <button
        onClick={onDismiss}
        className="text-xs text-red-400 hover:text-red-300 mt-2"
      >
        Dismiss
      </button>
    </div>
  );
};

export default PaymentErrorNotification;
