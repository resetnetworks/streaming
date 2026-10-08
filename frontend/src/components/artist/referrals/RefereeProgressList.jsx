// src/components/artist/referrals/RefereeProgressList.jsx
import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCalendarToday,
  MdAccessTime,
  MdMoreHoriz,
  MdSearch,
  MdPersonOutline,
  MdClose,
} from "react-icons/md";

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

// ─── Clean Check & Pending Nodes ─────────────────────────────────────────────
const CheckNode = () => (
  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm relative z-10">
    <svg
      className="w-3 h-3 text-[#02050e]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </div>
);

const PendingNode = ({ isCurrent = false }) => (
  <div
    className={`w-5 h-5 rounded-full ${
      isCurrent
        ? "border border-[#4DB3FF]/60 bg-[#0A0A23]"
        : "border border-white/20 bg-[#0A0A23]"
    } flex items-center justify-center shrink-0 relative z-10`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        isCurrent ? "bg-[#4DB3FF]" : "bg-white/30"
      }`}
    />
  </div>
);

// ─── Seamless Stepper (Clean Labels Only, No Dates) ───────────────────────────
const StepperTimeline = ({ isStage1, isStage2, isStage3 }) => {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[300px] mx-auto select-none">
      {/* ── Line 1: Node 1 to Node 2 (left: 16.666% to 50%) ── */}
      <div className="absolute top-[9px] left-[16.666%] w-[33.333%] h-[2px] -z-0">
        {isStage2 ? (
          <div className="h-full bg-emerald-500" />
        ) : (
          <div className="h-full bg-white/10" />
        )}
      </div>

      {/* ── Line 2: Node 2 to Node 3 (left: 50% to 83.333%) ── */}
      <div className="absolute top-[9px] left-[50%] w-[33.333%] h-[2px] -z-0">
        {isStage3 ? (
          <div className="h-full bg-emerald-500" />
        ) : isStage2 ? (
          <div className="h-full border-t-2 border-dashed border-[#4DB3FF]/60" />
        ) : (
          <div className="h-full bg-white/10" />
        )}
      </div>

      {/* ── 3 Nodes Grid ── */}
      <div className="grid grid-cols-3 relative z-10">
        {/* Node 1 */}
        <div className="flex flex-col items-center text-center">
          <CheckNode />
          <span className="text-[11px] font-medium mt-1 leading-tight whitespace-nowrap text-emerald-400">
            Applied
          </span>
        </div>

        {/* Node 2 */}
        <div className="flex flex-col items-center text-center">
          {isStage2 ? <CheckNode /> : <PendingNode isCurrent={true} />}
          <span
            className={`text-[11px] font-medium mt-1 leading-tight whitespace-nowrap ${
              isStage2 ? "text-emerald-400" : "text-gray-400"
            }`}
          >
            Approved
          </span>
        </div>

        {/* Node 3 */}
        <div className="flex flex-col items-center text-center">
          {isStage3 ? <CheckNode /> : <PendingNode isCurrent={false} />}
          <span
            className={`text-[11px] font-medium mt-1 leading-tight whitespace-nowrap ${
              isStage3 ? "text-emerald-400" : "text-gray-400"
            }`}
          >
            First Upload
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
      <div className="p-6 rounded-2xl bg-[#0A0A23]/40 border border-white/10 animate-pulse space-y-4">
        <div className="h-6 w-40 bg-white/10 rounded" />
        <div className="h-16 bg-white/5 rounded-xl" />
        <div className="h-16 bg-white/5 rounded-xl" />
        <div className="h-16 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0A0A23]/40 backdrop-blur-lg border border-white/10 shadow-xl overflow-hidden font-jura">
      {/* Table Top Controls Header */}
      <div className="p-5 md:p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
            Invited Artists Progress
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            Track real-time progress of referees towards your next reward.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 relative">
            {[
              { key: "all", label: "All" },
              { key: "in_progress", label: "In Progress" },
              { key: "qualified", label: "Qualified" },
            ].map((tab) => {
              const isActive = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRefereeFilterPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] rounded-lg shadow-md -z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search referee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#4DB3FF] transition-colors w-40 sm:w-48 font-jura"
            />
            <MdSearch className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Responsive Table View */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[1050px] w-full">
          {/* Table Column Headers */}
          <div className="grid grid-cols-[21%_14%_28%_14%_15%_8%] items-center px-6 py-3.5 border-b border-white/5 text-xs font-semibold text-gray-400 tracking-wider select-none bg-white/[0.02]">
            <div>ARTIST</div>
            <div>INVITE DATE</div>
            <div className="text-center">PROGRESS</div>
            <div>CURRENT STATUS</div>
            <div>REWARD STATUS</div>
            <div className="text-right pr-2">ACTIONS</div>
          </div>

          {/* Referral Rows */}
          <AnimatePresence mode="wait">
            {filteredReferrals.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-12 text-center flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 flex items-center justify-center text-[#4DB3FF] mb-3">
                  <MdPersonOutline className="w-7 h-7" />
                </div>
                <h4 className="text-white font-semibold text-base mb-1">
                  {referrals.length === 0 ? "No Referrals Yet" : "No Matching Referees"}
                </h4>
                <p className="text-gray-400 text-xs max-w-sm">
                  {referrals.length === 0
                    ? "Share your referral link or code above with other music creators. When they join and publish music, you'll see them here!"
                    : "Try adjusting your search or status filter to see other referees."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={filterStatus}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-white/5"
              >
                {filteredReferrals.map((ref) => {
                  const isStage1Complete = Boolean(ref.stage1_applied?.completed ?? true);
                  const isStage2Complete = Boolean(ref.stage2_artistApproved?.completed);
                  const isStage3Complete = Boolean(ref.stage3_contentUploaded?.completed);
                  const isRejected = ref.status === "rejected";

                  const artistName = ref.refereeName || "Artist Applicant";

                  const isQualified = isStage3Complete || ref.status === "qualified";
                  const isPendingApproval = !isStage2Complete && !isRejected;

                  return (
                    <div
                      key={ref.id || ref._id}
                      className="grid grid-cols-[21%_14%_28%_14%_15%_8%] items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Column 1: Artist */}
                      <div className="flex items-center gap-3 pr-2 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#0F3272]/50 border border-[#3380FF]/30 flex items-center justify-center text-[#4DB3FF] font-bold text-sm shadow-sm shrink-0">
                          {artistName[0]?.toUpperCase() || "A"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-semibold text-sm truncate leading-tight">
                            {artistName}
                          </h4>
                        </div>
                      </div>

                      {/* Column 2: Invite Date */}
                      <div className="flex items-center gap-2.5">
                        <MdCalendarToday className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-white text-xs font-medium block leading-tight">
                          {formatDate(ref.createdAt)}
                        </span>
                      </div>

                      {/* Column 3: Progress Stepper */}
                      <div>
                        <StepperTimeline
                          isStage1={isStage1Complete}
                          isStage2={isStage2Complete}
                          isStage3={isStage3Complete}
                        />
                      </div>

                      {/* Column 4: Current Status */}
                      <div>
                        {isQualified ? (
                          <span className="text-emerald-400 font-semibold text-xs">
                            Qualified
                          </span>
                        ) : isPendingApproval ? (
                          <div className="inline-flex items-center gap-1.5 text-gray-300 font-medium text-xs">
                            <MdAccessTime className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>Pending Approval</span>
                          </div>
                        ) : isRejected ? (
                          <span className="text-red-400 font-semibold text-xs">
                            Declined
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-[#4DB3FF] font-semibold text-xs">
                            <MdAccessTime className="w-3.5 h-3.5 text-[#4DB3FF]" />
                            <span>In Progress</span>
                          </div>
                        )}
                      </div>

                      {/* Column 5: Reward Status */}
                      <div>
                        {isQualified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Milestone Met
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">
                            Not Eligible
                          </span>
                        )}
                      </div>

                      {/* Column 6: Actions */}
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReferee(ref);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReferee(ref);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Options"
                        >
                          <MdMoreHoriz className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Modal (Portaled to document.body for true full-screen viewport center) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedReferee && (
              <motion.div
                key="referral-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSelectedReferee(null)}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              >
                <motion.div
                  key="referral-modal-dialog"
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md bg-[#0A0A23] border border-white/10 rounded-2xl p-6 shadow-2xl relative font-jura"
                >
                  <button
                    onClick={() => setSelectedReferee(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-full bg-[#0F3272]/50 border border-[#3380FF]/30 flex items-center justify-center text-[#4DB3FF] font-bold text-lg">
                      {(selectedReferee.refereeName || "A")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {selectedReferee.refereeName || "Artist Applicant"}
                      </h3>
                      {(selectedReferee.refereeEmail || selectedReferee.email) && (
                        <p className="text-gray-400 text-xs font-mono">
                          {selectedReferee.refereeEmail || selectedReferee.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/[0.03] rounded-xl p-4 border border-white/5 mb-5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Invite Date</span>
                      <span className="text-white font-mono">{formatDate(selectedReferee.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-[#4DB3FF] font-semibold capitalize">
                        {selectedReferee.status || "In Progress"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Referral Code</span>
                      <span className="text-[#4DB3FF] font-mono">{selectedReferee.referralCode || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reward Eligibility</span>
                      <span className="text-white">
                        {selectedReferee.status === "qualified" ? "Eligible for Cash Reward" : "Pending all 3 steps"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReferee(null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default RefereeProgressList;
