// src/components/artist/referrals/ReferralStatsCards.jsx
import React from "react";
import {
  LuUsers,
  LuClock,
  LuCircleCheck,
  LuTrendingUp,
  LuDollarSign,
} from "react-icons/lu";

// Reusable 3D sunken well style (matches Analytics & Revenue Dashboards)
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

const ReferralStatsCards = ({ stats = {}, isLoading = false }) => {
  const totalInvited = stats.totalInvited ?? 0;
  const inProgressCount = stats.inProgressCount ?? 0;
  const qualifiedCount = stats.qualifiedCount ?? 0;
  const rewardedCount = stats.rewardedCount ?? 0;
  const unrewardedQualifiedCount = stats.unrewardedQualifiedCount ?? 0;

  // Progress towards next 3-referral milestone ($10)
  const milestoneProgress = unrewardedQualifiedCount % 3;
  const progressPercent = Math.min(100, Math.round((milestoneProgress / 3) * 100));
  const earnedDollars = Math.floor(rewardedCount / 3) * 10;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent"
          >
            <div
              className="h-28 rounded-[15px] p-4 flex flex-col justify-between animate-pulse"
              style={sunkenCardStyle}
            >
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-6 w-12 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {/* 1. Total Invited */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
        <div
          className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
          style={sunkenCardStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Invited
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuUsers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
            {totalInvited}
          </div>
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
        <div
          className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
          style={sunkenCardStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
            {inProgressCount}
          </div>
        </div>
      </div>

      {/* 3. Qualified Referrals */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
        <div
          className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
          style={sunkenCardStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Qualified
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuCircleCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-1.5">
            {qualifiedCount}
          </div>
        </div>
      </div>

      {/* 4. Next $10 Reward Tracker */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
        <div
          className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
          style={sunkenCardStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Next $10 Reward
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuTrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span>{milestoneProgress}</span>
              <span className="text-sm font-semibold text-slate-500">/ 3</span>
            </div>
            {/* Subtle Progress Bar */}
            <div className="w-full bg-[#050811] rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-[#0459FE] to-[#38bdf8] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Total Rewarded */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md col-span-2 sm:col-span-1">
        <div
          className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
          style={sunkenCardStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Earned
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
              <LuDollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
            ${earnedDollars}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralStatsCards;
