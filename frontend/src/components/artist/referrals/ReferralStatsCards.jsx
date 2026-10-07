// src/components/artist/referrals/ReferralStatsCards.jsx
import React from "react";
import {
  MdPeopleAlt,
  MdHourglassTop,
  MdCheckCircle,
  MdMonetizationOn,
  MdTrendingUp
} from "react-icons/md";
import { FaAward } from "react-icons/fa";

const ReferralStatsCards = ({ stats = {}, isLoading = false }) => {
  const totalInvited = stats.totalInvited ?? 0;
  const inProgressCount = stats.inProgressCount ?? 0;
  const qualifiedCount = stats.qualifiedCount ?? 0;
  const rewardedCount = stats.rewardedCount ?? 0;
  const unrewardedQualifiedCount = stats.unrewardedQualifiedCount ?? 0;

  // Progress towards next 3-referral milestone ($10)
  const milestoneProgress = unrewardedQualifiedCount % 3;
  const progressPercent = Math.min(100, Math.round((milestoneProgress / 3) * 100));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 animate-pulse h-32"
          >
            <div className="h-4 w-20 bg-gray-800 rounded mb-3" />
            <div className="h-8 w-14 bg-gray-800/80 rounded mb-2" />
            <div className="h-3 w-28 bg-gray-800/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Invited */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-900/90 to-black border border-gray-800/90 shadow-lg hover:border-gray-700 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
          <MdPeopleAlt className="w-5 h-5" />
        </div>
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          Total Invited
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight my-1">
          {totalInvited}
        </div>
        <div className="text-xs text-slate-500">
          Artists joined with code
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-900/90 to-black border border-gray-800/90 shadow-lg hover:border-amber-500/30 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
          <MdHourglassTop className="w-5 h-5" />
        </div>
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          In Progress
        </div>
        <div className="text-3xl font-extrabold text-amber-400 tracking-tight my-1">
          {inProgressCount}
        </div>
        <div className="text-xs text-slate-500">
          Awaiting approval or music
        </div>
      </div>

      {/* 3. Qualified Referrals */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-900/90 to-black border border-gray-800/90 shadow-lg hover:border-emerald-500/30 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <MdCheckCircle className="w-5 h-5" />
        </div>
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          Qualified Referrals
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 tracking-tight my-1">
          {qualifiedCount}
        </div>
        <div className="text-xs text-slate-500">
          Completed all 3 stages
        </div>
      </div>

      {/* 4. Next $10 Reward Tracker */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-gray-900/90 to-black border border-blue-500/30 shadow-lg">
        <div className="absolute top-4 right-4 p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300">
          <MdTrendingUp className="w-5 h-5" />
        </div>
        <div className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">
          Next $10 Reward
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight my-1 flex items-baseline gap-1">
          <span>{milestoneProgress}</span>
          <span className="text-lg font-normal text-slate-400">/ 3</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700/60">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-blue-300/80 mt-1.5 flex justify-between">
          <span>{3 - milestoneProgress} more to earn $10</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* 5. Total Rewarded */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-900/90 to-black border border-gray-800/90 shadow-lg hover:border-purple-500/30 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
          <FaAward className="w-5 h-5" />
        </div>
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          Total Rewarded
        </div>
        <div className="text-3xl font-extrabold text-purple-300 tracking-tight my-1">
          {rewardedCount}
        </div>
        <div className="text-xs text-purple-400/80 font-medium">
          ${Math.floor(rewardedCount / 3) * 10} USD earned so far
        </div>
      </div>
    </div>
  );
};

export default ReferralStatsCards;
