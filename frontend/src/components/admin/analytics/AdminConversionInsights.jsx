// src/components/admin/analytics/AdminConversionInsights.jsx
import React from "react";
import {
  LuSearch,
  LuCompass,
  LuActivity,
  LuCircleCheck,
  LuRepeat,
  LuShoppingBag,
} from "react-icons/lu";
import { formatCompactNumber, formatPercentage } from "../../../utills/analytics/formatters";

const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

export const AdminConversionInsights = ({ overview, isLoading }) => {
  const traffic = overview?.traffic;
  const userGrowth = overview?.userGrowth;
  const monetization = overview?.monetization;
  const playback = overview?.playback;

  const searchCTR =
    traffic?.searchesPerformed > 0
      ? Number(((traffic.searchResultsClicked / traffic.searchesPerformed) * 100).toFixed(1))
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {/* 1. Traffic Reach */}
      <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="h-full rounded-[15px] p-4 flex flex-col justify-between" style={sunkenCardStyle}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Traffic Reach
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuCompass className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 my-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Home Page Views:</span>
              <span className="text-white font-bold">{formatCompactNumber(traffic?.homePageViews ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Landing Page Views:</span>
              <span className="text-white font-bold">{formatCompactNumber(traffic?.landingPageViews ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Unique Landing Visitors:</span>
              <span className="text-[#38bdf8] font-bold">{formatCompactNumber(traffic?.uniqueLandingVisitors ?? 0)}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Audience acquisition across web
          </div>
        </div>
      </div>

      {/* 2. Search Engagement */}
      <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="h-full rounded-[15px] p-4 flex flex-col justify-between" style={sunkenCardStyle}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Search Discovery
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuSearch className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 my-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Queries Searched:</span>
              <span className="text-white font-bold">{formatCompactNumber(traffic?.searchesPerformed ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Results Clicked:</span>
              <span className="text-white font-bold">{formatCompactNumber(traffic?.searchResultsClicked ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Search Click-Through:</span>
              <span className="text-[#38bdf8] font-bold">{searchCTR}% CTR</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Music & artist discovery rate
          </div>
        </div>
      </div>

      {/* 3. Stream Retention */}
      <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="h-full rounded-[15px] p-4 flex flex-col justify-between" style={sunkenCardStyle}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Listen Quality
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuActivity className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 my-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Completion Rate:</span>
              <span className="text-emerald-400 font-bold">{formatPercentage(playback?.completionRate ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Skip Rate:</span>
              <span className="text-rose-400 font-bold">{formatPercentage(playback?.skipRate ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Full Track Plays:</span>
              <span className="text-white font-bold">{formatCompactNumber(playback?.completions ?? 0)}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Playback engagement quality
          </div>
        </div>
      </div>

      {/* 4. Monetization Mix */}
      <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="h-full rounded-[15px] p-4 flex flex-col justify-between" style={sunkenCardStyle}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monetization Mix
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 my-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Digital Purchases:</span>
              <span className="text-white font-bold">{monetization?.purchasesCompleted ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Subscriptions Started:</span>
              <span className="text-emerald-400 font-bold">{monetization?.subscriptionsStarted ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Renewals:</span>
              <span className="text-[#38bdf8] font-bold">{monetization?.subscriptionsRenewed ?? 0}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Direct & recurring revenue
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConversionInsights;

