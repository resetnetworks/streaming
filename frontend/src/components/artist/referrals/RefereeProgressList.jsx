// src/components/artist/referrals/RefereeProgressList.jsx
import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch,
  LuCalendar,
  LuCheck,
  LuX,
  LuClock,
} from "react-icons/lu";

// Inner 3D panel style for main containers (matches Analytics & Revenue Dashboards)
const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

// Reusable 3D sunken well style (matches CardStat & Revenue)
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

const MotionDiv = motion.div;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Clean minimal nodes for stepper
const CheckNode = () => (
  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
    <LuCheck className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
  </div>
);

const PendingNode = ({ isCurrent = false }) => (
  <div
    className={`w-4 h-4 rounded-full ${
      isCurrent
        ? "border border-[#0459FE] bg-[#0459FE]/20"
        : "border border-white/10 bg-black/40"
    } flex items-center justify-center shrink-0`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        isCurrent ? "bg-[#38bdf8]" : "bg-white/20"
      }`}
    />
  </div>
);

// Minimal 3-Stage Progress Timeline
const StepperTimeline = ({ isStage2, isStage3 }) => {
  return (
    <div className="relative w-full max-w-[260px] mx-auto select-none">
      {/* Connector Line 1 */}
      <div className="absolute top-[8px] left-[16.666%] w-[33.333%] h-[2px]">
        {isStage2 ? (
          <div className="h-full bg-emerald-500/60" />
        ) : (
          <div className="h-full bg-white/10" />
        )}
      </div>

      {/* Connector Line 2 */}
      <div className="absolute top-[8px] left-[50%] w-[33.333%] h-[2px]">
        {isStage3 ? (
          <div className="h-full bg-emerald-500/60" />
        ) : (
          <div className="h-full bg-white/10" />
        )}
      </div>

      {/* 3 Step Nodes */}
      <div className="grid grid-cols-3 relative z-10">
        <div className="flex flex-col items-center text-center">
          <CheckNode />
          <span className="text-[10px] font-semibold mt-1 text-emerald-400 whitespace-nowrap">
            Applied
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          {isStage2 ? <CheckNode /> : <PendingNode isCurrent={true} />}
          <span
            className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
              isStage2 ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            Approved
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          {isStage3 ? <CheckNode /> : <PendingNode isCurrent={false} />}
          <span
            className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
              isStage3 ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            First Track
          </span>
        </div>
      </div>
    </div>
  );
};

const RefereeProgressList = ({ referrals = [], isLoading = false }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReferee, setSelectedReferee] = useState(null);

  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const name = (item.refereeName || "").toLowerCase();
      const email = (item.refereeEmail || item.email || "").toLowerCase();
      const code = (item.referralCode || "").toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch = !search || name.includes(q) || email.includes(q) || code.includes(q);

      const status = (item.status || "in_progress").toLowerCase();
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "qualified" && status === "qualified") ||
        (filterStatus === "in_progress" && status === "in_progress") ||
        (filterStatus === "rejected" && status === "rejected");

      return matchesSearch && matchesFilter;
    });
  }, [referrals, search, filterStatus]);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="h-48 rounded-2xl p-6 animate-pulse" style={innerPanel3dStyle} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={innerPanel3dStyle}
      >
        {/* Table Header & Controls (Clean, without extra subtitles) */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Referred Artists
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Pills with Smooth Framer Motion Slide Indicator */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto"
              style={{
                background: "#060911",
                border: "1px solid rgba(0, 0, 0, 0.95)",
                boxShadow:
                  "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              {[
                { key: "all", label: "ALL" },
                { key: "in_progress", label: "IN PROGRESS" },
                { key: "qualified", label: "QUALIFIED" },
              ].map((tab) => {
                const isActive = filterStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterStatus(tab.key)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {isActive && (
                      <MotionDiv
                        layoutId="activeRefereeFilterPill"
                        className="absolute inset-0 bg-[#0459FE] rounded-lg shadow-sm shadow-[#0459FE]/40"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Clean Search Input */}
            <div className="relative">
              <LuSearch className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search artist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#050811] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0459FE] transition-colors w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table View */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/30 border-b border-white/5">
                <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Artist</th>
                <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-center">Progress</th>
                <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-center">Reward</th>
                <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No referred artists found</p>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((ref) => {
                  const isStage2Complete = Boolean(ref.stage2_artistApproved?.completed);
                  const isStage3Complete = Boolean(ref.stage3_contentUploaded?.completed);
                  const isRejected = ref.status === "rejected";
                  const isQualified = isStage3Complete || ref.status === "qualified";
                  const artistName = ref.refereeName || "Artist Applicant";

                  return (
                    <tr
                      key={ref.id || ref._id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* 1. Artist */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0459FE]/15 border border-[#0459FE]/25 flex items-center justify-center text-[#38bdf8] font-bold text-xs shrink-0">
                            {artistName[0]?.toUpperCase() || "A"}
                          </div>
                          <span className="text-sm sm:text-base font-semibold text-white truncate max-w-[180px]">
                            {artistName}
                          </span>
                        </div>
                      </td>

                      {/* 2. Date */}
                      <td className="p-4 text-sm text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <LuCalendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatDate(ref.createdAt)}</span>
                        </div>
                      </td>

                      {/* 3. Stepper Progress */}
                      <td className="p-4">
                        <StepperTimeline
                          isStage2={isStage2Complete}
                          isStage3={isStage3Complete}
                        />
                      </td>

                      {/* 4. Current Status (Clean Plain Text Without Capsule) */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {isQualified ? (
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
                            Qualified
                          </span>
                        ) : isRejected ? (
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-400">
                            Declined
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#38bdf8]">
                            In Progress
                          </span>
                        )}
                      </td>

                      {/* 5. Reward Status (Clean Plain Text Without Capsule) */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {isQualified ? (
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
                            $10 Milestone Met
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* 6. Action */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedReferee(ref)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedReferee && (
              <div
                onClick={() => setSelectedReferee(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-dashboard-fade-in"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent w-full max-w-md shadow-2xl"
                >
                  <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={innerPanel3dStyle}
                  >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0459FE]/15 border border-[#0459FE]/25 flex items-center justify-center text-[#38bdf8] font-bold text-base">
                          {(selectedReferee.refereeName || "A")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {selectedReferee.refereeName || "Artist Applicant"}
                          </h3>
                          {(selectedReferee.refereeEmail || selectedReferee.email) && (
                            <p className="text-xs text-slate-400">
                              {selectedReferee.refereeEmail || selectedReferee.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReferee(null)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <LuX className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info Rows in Sunken Well Style */}
                    <div
                      className="p-4 rounded-xl space-y-3 mb-5 text-xs sm:text-sm"
                      style={sunkenCardStyle}
                    >
                      <div className="flex justify-between">
                        <span className="text-slate-400">Invite Date</span>
                        <span className="text-white font-medium">
                          {formatDate(selectedReferee.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Status</span>
                        <span className="text-[#38bdf8] font-bold capitalize">
                          {selectedReferee.status || "In Progress"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Referral Code</span>
                        <span className="text-white font-bold">
                          {selectedReferee.referralCode || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Milestone Progress</span>
                        <span className="text-white font-medium">
                          {selectedReferee.status === "qualified"
                            ? "Complete ($10 Qualified)"
                            : "Awaiting First Music Release"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReferee(null)}
                      className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default RefereeProgressList;
