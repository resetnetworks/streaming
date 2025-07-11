import React from "react";

const UnsubscribeModal = ({
  artistName = "the artist",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-800 text-white rounded-xl p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Confirm Unsubscription</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to unsubscribe from{" "}
          <span className="text-blue-400 font-medium">{artistName}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white transition disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Unsubscribing..." : "Unsubscribe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModal;
