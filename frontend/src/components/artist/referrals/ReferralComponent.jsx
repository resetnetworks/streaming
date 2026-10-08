// src/components/artist/referrals/ReferralComponent.jsx
import React from "react";
import ReferralCodeCard from "./ReferralCodeCard";
import ReferralStatsCards from "./ReferralStatsCards";
import RefereeProgressList from "./RefereeProgressList";
import { useMyReferrals } from "../../../hooks/api/useReferrals";
import {
  MdGroupAdd,
  MdVerifiedUser,
  MdLibraryMusic,
  MdMonetizationOn,
} from "react-icons/md";

const ReferralComponent = () => {
  const {
    data: referralsData,
    isLoading,
  } = useMyReferrals();

  const stats = referralsData?.stats || {};
  const referralsList = referralsData?.referrals || [];

  return (
    <div className="p-4 md:p-6 w-full space-y-6 md:space-y-8 font-jura">
      {/* Stage 3: My Referral Code & Link Card */}
      <ReferralCodeCard />

      {/* Stage 4A: Top-Level Metrics / Stats Cards */}
      <ReferralStatsCards stats={stats} isLoading={isLoading} />

      {/* Stage 4B: Referee Progress Table / Stepper List */}
      <RefereeProgressList referrals={referralsList} isLoading={isLoading} />

      {/* How it Works / 3-Milestone Guide */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/60 to-black border border-gray-800/80">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
          <span>How It Works & Earning Milestones</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Step 1 */}
          <div className="relative flex flex-col p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 font-bold text-sm">
              <MdGroupAdd className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-medium text-blue-400 mb-1">Step 1</span>
            <h4 className="text-white font-semibold text-sm mb-1">Invite Artists</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Share your personal referral link or code with fellow musicians, producers, and artists.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 font-bold text-sm">
              <MdVerifiedUser className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-medium text-purple-400 mb-1">Step 2</span>
            <h4 className="text-white font-semibold text-sm mb-1">Profile Approval</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Referee submits their application with your code and gets approved by our curatorial team.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 font-bold text-sm">
              <MdLibraryMusic className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-medium text-indigo-400 mb-1">Step 3</span>
            <h4 className="text-white font-semibold text-sm mb-1">First Music Upload</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Referee uploads their first original song or album. The referral becomes fully <strong>Qualified</strong>.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative flex flex-col p-4 rounded-xl bg-slate-900/40 border border-emerald-500/30">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 font-bold text-sm">
              <MdMonetizationOn className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-medium text-emerald-400 mb-1">Reward</span>
            <h4 className="text-white font-semibold text-sm mb-1">Earn $10 Every 3</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              For every 3 qualified artist referrals, you automatically earn a <strong>$10 USD</strong> reward balance credited to you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralComponent;
