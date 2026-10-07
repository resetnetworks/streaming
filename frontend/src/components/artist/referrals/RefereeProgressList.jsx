// src/components/artist/referrals/RefereeProgressList.jsx
import React, { useState, useMemo } from "react";
import {
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdAccessTime,
  MdClose,
  MdSearch,
  MdMusicNote,
  MdPersonOutline
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

const StatusBadge = ({ status }) => {
  const normStatus = (status || "in_progress").toLowerCase();

  if (normStatus === "qualified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Qualified
      </span>
    );
  }

  if (normStatus === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      In Progress
    </span>
  );
};

const StageNode = ({ isCompleted, isPending, isRejected, label, detail, isLast = false }) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center">
          {isCompleted ? (
            <MdCheckCircle className="w-5 h-5 text-emerald-400" />
          ) : isRejected ? (
            <MdClose className="w-5 h-5 text-red-400" />
          ) : isPending ? (
            <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
          ) : (
            <MdRadioButtonUnchecked className="w-5 h-5 text-slate-600" />
          )}
        </div>
        <div className="text-center mt-1">
          <span
            className={`text-xs font-medium block whitespace-nowrap ${
              isCompleted
                ? "text-emerald-300"
                : isRejected
                ? "text-red-400"
                : isPending
                ? "text-amber-300 font-semibold"
                : "text-slate-500"
            }`}
          >
            {label}
          </span>
          {detail && (
            <span className="text-[10px] text-slate-500 block">
              {detail}
            </span>
          )}
        </div>
      </div>

      {!isLast && (
        <div
          className={`h-0.5 w-10 sm:w-16 md:w-20 mx-2 -mt-4 transition-colors ${
            isCompleted ? "bg-emerald-500/70" : "bg-slate-700"
          }`}
        />
      )}
    </div>
  );
};

const RefereeProgressList = ({ referrals = [], isLoading = false }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const name = (item.refereeName || "").toLowerCase();
      const code = (item.referralCode || "").toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch = !search || name.includes(q) || code.includes(q);

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
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 animate-pulse space-y-4">
        <div className="h-6 w-40 bg-gray-800 rounded" />
        <div className="h-16 bg-gray-800/40 rounded-xl" />
        <div className="h-16 bg-gray-800/40 rounded-xl" />
        <div className="h-16 bg-gray-800/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900/95 to-black border border-gray-800/90 shadow-2xl overflow-hidden">
      {/* Table Header / Filter Controls */}
      <div className="p-5 md:p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">
            Invited Artists Progress
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Track real-time progress of referees towards your next reward.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-slate-800">
            {["all", "in_progress", "qualified"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize cursor-pointer ${
                  filterStatus === st
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st === "in_progress" ? "In Progress" : st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search referee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/50 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors w-40 sm:w-48"
            />
            <MdSearch className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Referral Content */}
      {filteredReferrals.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <MdPersonOutline className="w-7 h-7" />
          </div>
          <h4 className="text-white font-semibold text-base mb-1">
            {referrals.length === 0 ? "No Referrals Yet" : "No Matching Referees"}
          </h4>
          <p className="text-slate-400 text-xs max-w-sm">
            {referrals.length === 0
              ? "Share your referral link or code above with other music creators. When they join and publish music, you'll see them here!"
              : "Try adjusting your search or status filter to see other referees."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800/80">
          {filteredReferrals.map((ref) => {
            const isStage1Complete = Boolean(ref.stage1_applied?.completed ?? true);
            const isStage2Complete = Boolean(ref.stage2_artistApproved?.completed);
            const isStage3Complete = Boolean(ref.stage3_contentUploaded?.completed);
            const isRejected = ref.status === "rejected";

            // Stage 2 state
            const isStage2Pending = !isStage2Complete && !isRejected;

            // Stage 3 state
            const isStage3Pending = isStage2Complete && !isStage3Complete && !isRejected;

            return (
              <div
                key={ref.id || ref._id}
                className="p-5 md:p-6 hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Referee Name & Date */}
                <div className="flex items-start gap-4 min-w-[220px]">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900/40 to-indigo-950/60 border border-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-base flex-shrink-0">
                    {(ref.refereeName || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm tracking-wide">
                        {ref.refereeName || "Artist Applicant"}
                      </h4>
                      <StatusBadge status={ref.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Invited {formatDate(ref.createdAt)}</span>
                      {ref.isRewarded && (
                        <span className="text-emerald-400 font-medium">
                          • Rewarded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: 3-Stage Visual Milestone Stepper */}
                <div className="flex items-center justify-center overflow-x-auto py-2">
                  {/* Stage 1 */}
                  <StageNode
                    isCompleted={isStage1Complete}
                    label="1. Applied"
                    detail={formatDate(ref.stage1_applied?.completedAt || ref.createdAt)}
                  />

                  {/* Stage 2 */}
                  <StageNode
                    isCompleted={isStage2Complete}
                    isPending={isStage2Pending}
                    isRejected={isRejected}
                    label="2. Approved"
                    detail={
                      isStage2Complete
                        ? formatDate(ref.stage2_artistApproved?.completedAt)
                        : isRejected
                        ? "Rejected"
                        : "Reviewing"
                    }
                  />

                  {/* Stage 3 */}
                  <StageNode
                    isCompleted={isStage3Complete}
                    isPending={isStage3Pending}
                    label="3. First Upload"
                    detail={
                      isStage3Complete
                        ? ref.stage3_contentUploaded?.contentType === "album"
                          ? "Album Uploaded"
                          : "Song Uploaded"
                        : isStage2Complete
                        ? "Awaiting Song"
                        : "Locked"
                    }
                    isLast={true}
                  />
                </div>

                {/* Right: Milestone Outcome Summary */}
                <div className="lg:text-right min-w-[140px] flex-shrink-0">
                  {isStage3Complete ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <MdCheckCircle className="w-4 h-4" />
                      Milestone Met
                    </span>
                  ) : isRejected ? (
                    <span className="text-xs text-red-400">
                      Application Declined
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400/90 font-medium">
                      <MdAccessTime className="w-4 h-4" />
                      {isStage2Complete ? "Pending Music" : "Pending Approval"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RefereeProgressList;
