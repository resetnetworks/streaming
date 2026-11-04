// src/components/artist/home/AnalyticsErrorState.jsx
import React from "react";
import { LuCircleAlert, LuRefreshCw } from "react-icons/lu";

export const AnalyticsErrorState = ({
  message = "Failed to load analytics data",
  onRetry,
}) => {
  return (
    <div className="w-full rounded-2xl p-[1px] bg-gradient-to-r from-red-500/30 via-red-500/10 to-transparent my-4">
      <div className="rounded-2xl bg-[#0f172a]/90 backdrop-blur-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-red-400">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <LuCircleAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium">Unable to load data</h4>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <LuRefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalyticsErrorState;
