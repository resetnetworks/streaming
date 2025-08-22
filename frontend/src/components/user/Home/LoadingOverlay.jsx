import React from "react";

const LoadingOverlay = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Processing Payment</p>
          <p className="text-gray-300 text-sm mt-1">Please wait, do not close this window</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
