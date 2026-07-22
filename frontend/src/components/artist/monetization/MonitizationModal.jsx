import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMonetizationStatus, useSetupMonetization } from "../../../hooks/api/useMonetization";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const ALLOWED_CYCLES = ["1m", "3m", "6m"];

const MonetizationModal = ({
  isOpen,
  onClose,
  onComplete,
  isMandatory = false,
}) => {
  const {
    data: setupStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch,
  } = useMonetizationStatus();

  const {
    mutate: setupMonetization,
    isPending: setupLoading,
    isSuccess: setupSuccess,
    error: setupError,
    data: operationResult,
  } = useSetupMonetization();

  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [cycle, setCycle] = useState("1m");

  useEffect(() => {
    if (isOpen) {
      setSubscriptionPrice("");
      setCycle("1m");
    }
  }, [isOpen]);

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

    setupMonetization({
      subscriptionPrice: price,
      cycle,
    });
  };

  const getCycleDisplayName = (cycleCode) => {
    const cycleNames = {
      "1m": "Monthly",
      "3m": "3 Months",
      "6m": "6 Months",
    };
    return cycleNames[cycleCode] || cycleCode;
  };

  // Loading state
  const renderLoading = () => (
    <div className="p-6 flex flex-col items-center justify-center">
      <p className="text-gray-400 text-sm font-sans">Checking status...</p>
    </div>
  );

  // Error state
  const renderError = () => (
    <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
      <div className="flex items-start text-red-400 text-xs">
        <FaTimes className="mt-0.5 mr-2.5 flex-shrink-0" />
        <div>
          <span className="font-semibold tracking-wider uppercase font-['Jura']">Error Loading Status</span>
          <p className="text-gray-400 mt-1 font-sans leading-relaxed">{statusError}</p>
          <button
            onClick={() => refetch()}
            className="mt-2.5 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-[10px] font-semibold uppercase tracking-wider font-['Jura']"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // Reason based message
  const renderReasonMessage = () => {
    if (!setupStatus?.reason) return null;

    const messages = {
      NO_ARTIST_PROFILE: "Artist profile not found. Please create artist profile first.",
      NOT_FOUND: "Artist not found in database.",
      FETCH_ERROR: "Error fetching status.",
    };

    const message = messages[setupStatus.reason] || "Unable to setup monetization.";

    return (
      <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-lg">
        <div className="flex items-start text-yellow-400 text-xs">
          <FaExclamationTriangle className="mt-0.5 mr-2.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold tracking-wider uppercase font-['Jura'] mb-0.5">Warning</h3>
            <p className="text-gray-300 font-sans leading-relaxed">{message}</p>
          </div>
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
              duration: 0.3,
            }}
            className="subscription-wrapper md:w-[26rem] w-[90vw] max-w-md transition-all duration-300 shadow-2xl relative"
          >
            <div
              className="relative subscription-card w-full text-left rounded-xl p-6 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle background gradient overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
              </div>

              {/* Close Button */}
              {!isMandatory && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg transition-colors p-1.5 rounded-lg hover:bg-gray-800/50 z-[1000] cursor-pointer"
                  disabled={setupLoading || statusLoading}
                >
                  <FaTimes />
                </button>
              )}

              {/* Header */}
              <div className={`pb-3.5 border-b border-white/10 relative z-10 flex flex-col mb-4 ${isMandatory ? "items-center text-center w-full" : "items-start"}`}>
                <h2 className="text-lg font-bold text-white tracking-wide uppercase font-['Jura']">
                  {isMandatory ? "Unlock Dashboard" : "Monetization"}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                  {isMandatory
                    ? "Set your fan subscription price to activate your dashboard"
                    : "Configure subscription options to start earning"}
                </p>
              </div>

              {/* Content wrapper */}
              <div className="space-y-4 relative z-10">
                {/* Mandatory Warning */}
                {isMandatory && (
                  <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg text-center">
                    <p className="text-[#4DB3FF] font-semibold text-[10px] uppercase font-['Jura'] tracking-wider mb-0.5">
                      Set Your Fan Pricing
                    </p>
                    <p className="text-gray-300 text-[11px] font-sans leading-normal">
                      Unlock your dashboard by specifying what <strong className="text-white">your fans/listeners</strong> will pay to subscribe to your music. <strong className="text-[#4DB3FF]">All subscription earnings go directly to you.</strong>
                    </p>
                  </div>
                )}

                {/* Main Instruction Paragraph */}
                <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
                  Choose a subscription price that best reflects the value you offer your listeners. Since pricing cannot currently be changed once published, please select a price carefully.
                  <span className="text-[10px] text-gray-500 mt-1 block leading-normal">
                    We are currently building features to allow you to update pricing in the future.
                  </span>
                </div>

                {/* Loading State */}
                {statusLoading && renderLoading()}

                {/* Error State */}
                {!statusLoading && statusError && renderError()}

                {/* Reason Message */}
                {!statusLoading &&
                  setupStatus?.reason &&
                  !setupStatus?.isMonetizationComplete &&
                  renderReasonMessage()}

                {/* Compact side-by-side Setup Form */}
                {!statusLoading && !setupStatus?.isMonetizationComplete && (
                  <div className="space-y-3.5">
                    {/* Inputs Row */}
                    <div className="grid grid-cols-12 gap-3">
                      {/* Price Input (col-span-7) */}
                      <div className="col-span-7 space-y-1.5 text-left">
                        <label className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase font-['Jura']">
                          Price <span className="text-[#4DB3FF]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={subscriptionPrice}
                            onChange={(e) => setSubscriptionPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-2.5 bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] rounded-lg pr-12 text-white font-mono text-sm outline-none transition-all"
                            min="0"
                            step="0.01"
                            disabled={setupLoading}
                            required
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-[10px]">
                            USD
                          </div>
                        </div>
                      </div>

                      {/* Cycle Select (col-span-5) */}
                      <div className="col-span-5 space-y-1.5 text-left">
                        <label className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase font-['Jura']">
                          Cycle <span className="text-[#4DB3FF]">*</span>
                        </label>
                        <select
                          value={cycle}
                          onChange={(e) => setCycle(e.target.value)}
                          className="w-full p-2.5 bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] rounded-lg text-white font-['Jura'] text-xs outline-none transition-all uppercase tracking-wider h-[38px]"
                          disabled={setupLoading}
                          required
                        >
                          {ALLOWED_CYCLES.map((cycleOption) => (
                            <option
                              key={cycleOption}
                              value={cycleOption}
                              className="bg-[#020216] text-white"
                            >
                              {getCycleDisplayName(cycleOption)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Compact Receive Output Inline Preview */}
                    {subscriptionPrice && parseFloat(subscriptionPrice) > 0 && (
                      <div className="p-2.5 bg-gradient-to-r from-[#0F3272]/20 to-[#3380FF]/5 border border-[#4DB3FF]/15 rounded-lg flex justify-between items-center text-[11px] font-['Jura']">
                        <span className="text-gray-400 uppercase tracking-wider">Est. Net Payout</span>
                        <span className="text-[#4DB3FF] font-bold font-mono">
                          ${(parseFloat(subscriptionPrice) * 0.85).toFixed(2)} USD / {getCycleDisplayName(cycle)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Setup Success Message */}
                {setupSuccess && (
                  <div className="p-3 bg-green-950/10 border border-green-500/10 rounded-lg text-xs">
                    <span className="font-semibold text-green-400 block tracking-wider uppercase font-['Jura']">
                      Setup Completed
                    </span>
                    {operationResult?.operationId && (
                      <span className="text-[10px] text-green-500 font-mono mt-1 block">
                        ID: {operationResult.operationId}
                      </span>
                    )}
                    <p className="text-gray-400 mt-1 font-sans leading-relaxed">
                      {isMandatory
                        ? "Dashboard access granted. Redirecting..."
                        : "Setup complete. Closing..."}
                    </p>
                  </div>
                )}

                {/* Setup Error Message */}
                {setupError && (
                  <div className="p-3 bg-red-950/10 border border-red-500/10 rounded-lg text-xs">
                    <span className="font-semibold text-red-400 block tracking-wider uppercase font-['Jura']">Error Setting Up</span>
                    <p className="text-gray-400 mt-1 font-sans leading-relaxed">{setupError}</p>
                  </div>
                )}

                {/* Footer Actions */}
                {!statusLoading && !setupStatus?.isMonetizationComplete && (
                  <div className={`flex gap-3 border-t border-white/10 pt-3.5 mt-4 ${isMandatory ? "justify-center" : "justify-end"}`}>
                    {!isMandatory && (
                      <button
                        onClick={handleClose}
                        className="px-5 py-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider font-['Jura'] cursor-pointer"
                        disabled={setupLoading}
                      >
                        Cancel
                      </button>
                    )}
                    <div className="button-wrapper cursor-pointer">
                      <button
                        onClick={handleSubmit}
                        disabled={setupLoading || !subscriptionPrice || statusLoading}
                        className="custom-button !h-9 px-5 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] hover:from-[#153e8a] hover:to-[#408eff] disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider font-['Jura']"
                      >
                        {setupLoading ? "Processing..." : (isMandatory ? "Complete Setup" : "Setup")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonetizationModal;
