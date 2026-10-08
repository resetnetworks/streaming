// src/components/artist/referrals/ReferralStatsCards.jsx
import React from "react";
import {
  MdPeopleAlt,
  MdHourglassTop,
  MdCheckCircle,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 font-jura">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#0A0A23]/40 border border-white/10 animate-pulse h-32"
          >
            <div className="h-4 w-20 bg-white/10 rounded mb-3" />
            <div className="h-8 w-14 bg-white/10 rounded mb-2" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 font-jura">
      {/* 1. Total Invited */}
      <div className="relative p-5 rounded-2xl bg-[#0A0A23]/40 backdrop-blur-lg border border-white/10 shadow-xl hover:border-white/20 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 rounded-xl text-[#4DB3FF]">
          <MdPeopleAlt className="w-5 h-5" />
        </div>
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
          Total Invited
        </div>
        <div className="text-3xl font-bold text-white tracking-tight my-1">
          {totalInvited}
        </div>
        <div className="text-xs text-gray-400">
          Artists joined with code
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="relative p-5 rounded-2xl bg-[#0A0A23]/40 backdrop-blur-lg border border-white/10 shadow-xl hover:border-white/20 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 rounded-xl text-[#4DB3FF]">
          <MdHourglassTop className="w-5 h-5" />
        </div>
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
          In Progress
        </div>
        <div className="text-3xl font-bold text-white tracking-tight my-1">
          {inProgressCount}
        </div>
        <div className="text-xs text-gray-400">
          Awaiting approval or music
        </div>
      </div>

      {/* 3. Qualified Referrals */}
      <div className="relative p-5 rounded-2xl bg-[#0A0A23]/40 backdrop-blur-lg border border-white/10 shadow-xl hover:border-white/20 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <MdCheckCircle className="w-5 h-5" />
        </div>
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
          Qualified Referrals
        </div>
        <div className="text-3xl font-bold text-emerald-400 tracking-tight my-1">
          {qualifiedCount}
        </div>
        <div className="text-xs text-gray-400">
          Completed all 3 stages
        </div>
      </div>

      {/* 4. Next $10 Reward Tracker */}
      <div className="relative p-5 rounded-2xl bg-[#0A0A23]/60 backdrop-blur-lg border border-[#4DB3FF]/30 shadow-xl hover:border-[#4DB3FF]/50 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 rounded-xl text-[#4DB3FF]">
          <MdTrendingUp className="w-5 h-5" />
        </div>
        <div className="text-[#4DB3FF] text-xs font-semibold uppercase tracking-wider mb-1">
          Next $10 Reward
        </div>
        <div className="text-3xl font-bold text-white tracking-tight my-1 flex items-baseline gap-1">
          <span>{milestoneProgress}</span>
          <span className="text-lg font-normal text-gray-400">/ 3</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-black/50 rounded-full h-2 mt-2 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-gray-400 mt-1.5 flex justify-between font-mono">
          <span>{3 - milestoneProgress} more to earn $10</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* 5. Total Rewarded */}
      <div className="relative p-5 rounded-2xl bg-[#0A0A23]/40 backdrop-blur-lg border border-white/10 shadow-xl hover:border-white/20 transition-all">
        <div className="absolute top-4 right-4 p-2.5 bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 rounded-xl text-[#4DB3FF]">
          <FaAward className="w-5 h-5" />
        </div>
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
          Total Rewarded
        </div>
        <div className="text-3xl font-bold text-white tracking-tight my-1">
          {rewardedCount}
        </div>
        <div className="text-xs text-gray-400">
          ${Math.floor(rewardedCount / 3) * 10} USD earned so far
        </div>
      </div>
    </div>
  );
};

export default ReferralStatsCards;
