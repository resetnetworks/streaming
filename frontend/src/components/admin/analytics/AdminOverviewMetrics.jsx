// src/components/admin/analytics/AdminOverviewMetrics.jsx
import React from "react";
import {
  LuPlay,
  LuCheckCheck,
  LuDollarSign,
  LuUsers,
  LuUserCheck,
  LuMusic,
  LuUserPlus,
} from "react-icons/lu";
import { formatCompactNumber, formatPercentage } from "../../../utills/analytics/formatters";

// Reusable 3D sunken well style matching CardStat & Revenue
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

const MetricCard = ({ label, value, subtext, icon: Icon, color = "text-[#38bdf8]" }) => {
  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
      <div
        className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
        style={sunkenCardStyle}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-0.5">
          <div className={`text-2xl sm:text-3xl font-black tracking-tight text-white`}>
            {value}
          </div>
        </div>

        {subtext && (
          <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminOverviewMetrics = ({ overview, isLoading }) => {
  const playback = overview?.playback;
  const platformTotals = overview?.platformTotals;
  const monetization = overview?.monetization;
  const userGrowth = overview?.userGrowth;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5 w-full">
      <MetricCard
        label="Total Streams"
        value={isLoading ? "..." : formatCompactNumber(playback?.totalPlays ?? 0)}
        subtext={`${formatPercentage(playback?.completionRate ?? 0)} completed`}
        icon={LuPlay}
      />

      <MetricCard
        label="Qualified Plays"
        value={isLoading ? "..." : formatCompactNumber(playback?.qualifiedPlays ?? 0)}
        subtext="≥ 30s listen time"
        icon={LuCheckCheck}
      />

      <MetricCard
        label="Platform Revenue"
        value={isLoading ? "..." : monetization?.revenueFormatted || `$${((monetization?.revenueCents || 0) / 100).toFixed(2)}`}
        subtext={`${monetization?.purchasesCompleted ?? 0} purchases`}
        icon={LuDollarSign}
      />

      <MetricCard
        label="Total Users"
        value={isLoading ? "..." : formatCompactNumber(platformTotals?.users ?? 0)}
        subtext="Registered accounts"
        icon={LuUsers}
      />

      <MetricCard
        label="Total Artists"
        value={isLoading ? "..." : formatCompactNumber(platformTotals?.artists ?? 0)}
        subtext="Active creator profiles"
        icon={LuUserCheck}
      />

      <MetricCard
        label="Catalog Tracks"
        value={isLoading ? "..." : formatCompactNumber(platformTotals?.songs ?? 0)}
        subtext="Live in catalog"
        icon={LuMusic}
      />

      <MetricCard
        label="User Signups"
        value={isLoading ? "..." : formatCompactNumber(userGrowth?.signupsCompleted ?? 0)}
        subtext={`${userGrowth?.signupConversionRate ?? 0}% conv. rate`}
        icon={LuUserPlus}
      />
    </div>
  );
};

export default AdminOverviewMetrics;

