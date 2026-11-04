// src/components/artist/home/ArtistDashboardHeader.jsx
import React from "react";
import { LuCalendar, LuRefreshCw, LuSparkles } from "react-icons/lu";
import { formatDateLabel } from "../../../utills/analytics/formatters";

const RANGES = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
];

export const ArtistDashboardHeader = ({
  range = "30d",
  onRangeChange,
  dateRangeInfo = null,
  isRefreshing = false,
  onRefresh,
}) => {
  const formattedRangeText = React.useMemo(() => {
    if (!dateRangeInfo?.startDate || !dateRangeInfo?.endDate) return null;
    const start = formatDateLabel(dateRangeInfo.startDate);
    const end = formatDateLabel(dateRangeInfo.endDate);
    return `${start} — ${end}`;
  }, [dateRangeInfo]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Artist Analytics
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <LuSparkles className="w-3 h-3" /> Live
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Monitor streams, fan retention, audience growth, and monetization
        </p>
      </div>

      {/* Controls: Date range badge + Range toggles + Refresh */}
      <div className="flex items-center flex-wrap gap-2.5">
        {formattedRangeText && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
            <LuCalendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{formattedRangeText}</span>
          </div>
        )}

        {/* Range Toggle Pills */}
        <div className="flex items-center bg-[#0e1726] p-1 rounded-xl border border-white/10">
          {RANGES.map((r) => {
            const isActive = range === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRangeChange?.(r.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh analytics data"
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#0e1726] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
          >
            <LuRefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistDashboardHeader;
