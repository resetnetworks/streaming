// src/components/artist/referrals/ReferralComponent.jsx
import React from "react";
import ReferralCodeCard from "./ReferralCodeCard";
import ReferralStatsCards from "./ReferralStatsCards";
import RefereeProgressList from "./RefereeProgressList";
import { useMyReferrals } from "../../../hooks/api/useReferrals";

// Reusable 3D sunken well style (matches CardStat & Revenue)
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

const ReferralComponent = () => {
  const { data: referralsData, isLoading } = useMyReferrals();

  const stats = referralsData?.stats || {};
  const referralsList = referralsData?.referrals || [];

  return (
    <div className="p-4 md:p-6 w-full space-y-6 animate-dashboard-fade-in font-jura">
      {/* 1. Referral Code & Share Link Card */}
      <ReferralCodeCard />

      {/* 2. Top-Level Metrics (3D Sunken Well Aesthetic) */}
      <ReferralStatsCards stats={stats} isLoading={isLoading} />

      {/* 3. Referee Progress Table */}
      <RefereeProgressList referrals={referralsList} isLoading={isLoading} />

      {/* 4. Minimal 3-Step Milestone Summary (Clean, No Verbose Paragraphs) */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="rounded-2xl p-4 sm:p-5" style={sunkenCardStyle}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Earning Rule
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0459FE]/20 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Share Link</span>
              </span>
              <span className="text-slate-600">➔</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0459FE]/20 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Artist Approved</span>
              </span>
              <span className="text-slate-600">➔</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>First Track Upload = $10</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralComponent;
