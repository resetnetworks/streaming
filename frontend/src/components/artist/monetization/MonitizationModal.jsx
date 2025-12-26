import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  setupMonetization,
  resetMonetization,
} from "../../../features/monetization/monetizationSlice";
import { getMyMonetizationSetupStatus } from "../../../features/monetization/monetizationSlice";
import {
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaSync,
  FaTimes,
  FaExclamationTriangle,
  FaUserCheck,
} from "react-icons/fa";

const ALLOWED_CYCLES = ["1m", "3m", "6m"];

const MonetizationModal = ({
  isOpen,
  onClose,
  onComplete,
  isMandatory = false,
}) => {
  const dispatch = useDispatch();
  const {
    setupLoading,
    setupError,
    setupSuccess,
    operationResult,
    setupStatus,
  } = useSelector((state) => state.monetization);

  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [cycle, setCycle] = useState("1m");

  useEffect(() => {
    if (isOpen) {
      dispatch(getMyMonetizationSetupStatus());
      setSubscriptionPrice("");
      setCycle("1m");
      dispatch(resetMonetization());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (setupStatus?.isMonetizationComplete && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }

    if (setupSuccess && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [setupStatus?.isMonetizationComplete, setupSuccess, onComplete]);

  const handleClose = () => {
    if (isMandatory && !setupStatus?.isMonetizationComplete && !setupSuccess) {
      return;
    }
    onClose();
  };

  const handleSubmit = () => {
    const price = parseFloat(subscriptionPrice);

    if (!subscriptionPrice || price <= 0) {
      alert("Please enter a valid subscription price");
      return;
    }

    dispatch(
      setupMonetization({
        subscriptionPrice: price,
        cycle,
      })
    );
  };

  const getCycleDisplayName = (cycle) => {
    const cycleNames = {
      "1m": "1 Month",
      "3m": "3 Months",
      "6m": "6 Months",
    };
    return cycleNames[cycle] || cycle;
  };


  // ✅ Loading state
  const renderLoading = () => (
    <div className="p-6 flex flex-col items-center justify-center">
      <FaSync className="animate-spin text-3xl text-blue-400 mb-4" />
      <p className="text-gray-300">Checking monetization status...</p>
    </div>
  );

  // ✅ Error state
  const renderError = () => (
    <div className="p-4 bg-gradient-to-r from-red-900/30 to-rose-900/20 border border-red-700/50 rounded-lg">
      <div className="flex items-center text-red-400">
        <FaTimes className="mr-3" />
        <div>
          <span className="font-medium">Error Loading Status</span>
          <p className="text-red-300 text-sm mt-1">{setupStatus?.error}</p>
          <button
            onClick={() => dispatch(getMyMonetizationSetupStatus())}
            className="mt-2 px-4 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Reason based message
  const renderReasonMessage = () => {
    if (!setupStatus?.reason) return null;

    const messages = {
      NO_ARTIST_PROFILE:
        "Artist profile not found. Please create artist profile first.",
      NOT_FOUND: "Artist not found in database.",
      FETCH_ERROR: "Error fetching monetization status.",
    };

    const message =
      messages[setupStatus.reason] || "Unable to setup monetization.";

    return (
      <div className="p-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-700/50 rounded-lg">
        <div className="flex items-center text-amber-400">
          <FaExclamationTriangle className="mr-3" />
          <span className="font-medium">{message}</span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaCreditCard className="text-blue-400" />
                  {isMandatory
                    ? "Required: Setup Monetization"
                    : "Setup Monetization"}
                </h2>
                <p className="text-gray-400 mt-1">
                  {isMandatory
                    ? "Complete monetization to unlock dashboard features"
                    : "Start earning from your music"}
                </p>
              </div>
              {!isMandatory && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white text-xl transition-colors"
                  disabled={setupLoading || setupStatus?.loading}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Mandatory Warning */}
              {isMandatory && (
                <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border border-yellow-700/50 rounded-lg backdrop-blur-sm">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-yellow-300 font-medium mb-1">
                        Required Action
                      </h3>
                      <p className="text-yellow-200/80 text-sm">
                        You must complete monetization setup to access all dashboard
                        features.
                        {setupStatus?.isMonetizationComplete
                          ? " Your monetization is already active."
                          : " This modal will remain open until setup is complete."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Loading State */}
              {setupStatus?.loading && renderLoading()}

              {/* ✅ Error State */}
              {!setupStatus?.loading && setupStatus?.error && renderError()}

              {/* ✅ Reason Message */}
              {!setupStatus?.loading &&
                setupStatus?.reason &&
                !setupStatus?.isMonetizationComplete &&
                renderReasonMessage()}

              {/* ✅ Setup Form - Only show if not already monetized and not loading */}
              {!setupStatus?.loading && !setupStatus?.isMonetizationComplete && (
                <>
                  {/* Price Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-400" />
                      Subscription Price <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={subscriptionPrice}
                        onChange={(e) => setSubscriptionPrice(e.target.value)}
                        placeholder="e.g., 9.99"
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                        min="0"
                        step="0.01"
                        disabled={setupLoading}
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        USD
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">
                      Enter the monthly subscription price for your fans
                    </p>
                  </div>

                  {/* Cycle Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FaClock className="text-blue-400" />
                      Billing Cycle <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={cycle}
                      onChange={(e) => setCycle(e.target.value)}
                      className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      disabled={setupLoading}
                      required
                    >
                      {ALLOWED_CYCLES.map((cycleOption) => (
                        <option
                          key={cycleOption}
                          value={cycleOption}
                          className="bg-gray-800"
                        >
                          {getCycleDisplayName(cycleOption)}
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-500 text-xs">
                      How often fans will be charged
                    </p>
                  </div>

                  {/* Preview Box */}
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Selected Plan</p>
                        <p className="text-white font-medium">
                          {subscriptionPrice || "0.00"} USD /{" "}
                          {getCycleDisplayName(cycle)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-sm">You'll Receive</p>
                        <p className="text-green-400 font-medium">
                          $
                          {subscriptionPrice
                            ? (parseFloat(subscriptionPrice) * 0.85).toFixed(2)
                            : "0.00"}{" "}
                          USD
                        </p>
                        <p className="text-gray-500 text-xs">
                          (85% after platform fee)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Setup Success Message */}
              {setupSuccess && (
                <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-700/50 rounded-lg">
                  <div className="flex items-center text-green-400">
                    <FaCheckCircle className="mr-3" />
                    <div>
                      <span className="font-medium">
                        Monetization Setup Successful!
                      </span>
                      {operationResult?.operationId && (
                        <div className="mt-2">
                          <code className="bg-gray-900/50 text-green-300 px-2 py-1 rounded text-xs">
                            ID: {operationResult.operationId}
                          </code>
                        </div>
                      )}
                      <p className="text-green-300 mt-2 text-sm">
                        {isMandatory
                          ? "Dashboard access granted. Redirecting..."
                          : "Setup complete. Closing..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Setup Error Message */}
              {setupError && (
                <div className="p-4 bg-gradient-to-r from-red-900/30 to-rose-900/20 border border-red-700/50 rounded-lg">
                  <div className="flex items-center text-red-400">
                    <FaTimes className="mr-3" />
                    <span className="font-medium">Error: {setupError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!setupStatus?.loading && !setupStatus?.isMonetizationComplete && (
              <div className="flex justify-center items-center p-2 border-t border-gray-700 bg-gray-900/50">
                <div className="flex space-x-3">
                  {!isMandatory && (
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      disabled={setupLoading}
                    >
                      Cancel
                    </button>
                  )}
                  <div className="button-wrapper mt-2 mb-2 cursor-pointer shadow-lg shadow-blue-500/20">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        setupLoading || !subscriptionPrice || setupStatus?.loading
                      }
                      className="custom-button w-full bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300"
                    >
                      {setupLoading ? (
                        <span className="flex items-center justify-center">
                          <FaSync className="animate-spin mr-2" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <FaCheckCircle className="mr-2" />
                          {isMandatory ? "Complete Setup" : "Setup Monetization"}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonetizationModal;