// src/pages/admin/Dashboard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LuTrendingUp,
  LuUsers,
  LuRefreshCw,
} from "react-icons/lu";
import { useAdminDashboardAnalytics } from "../../hooks/api/useAdminAnalytics";
import AdminOverviewMetrics from "../../components/admin/analytics/AdminOverviewMetrics";
import AdminTimeseriesChart from "../../components/admin/analytics/AdminTimeseriesChart";
import AdminArtistsLeaderboard from "../../components/admin/analytics/AdminArtistsLeaderboard";
import AdminConversionInsights from "../../components/admin/analytics/AdminConversionInsights";
import AdminAudienceDirectory from "../../components/admin/analytics/AdminAudienceDirectory";

const MotionDiv = motion.div;

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("analytics"); // "analytics" | "audience"
  const [range, setRange] = useState("30d");
  const [artistSortBy, setArtistSortBy] = useState("plays");
  const [artistPage, setArtistPage] = useState(1);

  // Live analytics pipeline from backend
  const {
    overview,
    timeseries,
    artistsSummary,
    pagination,
    isLoading,
    isFetching,
    refetchAll,
  } = useAdminDashboardAnalytics({
    range,
    sortBy: artistSortBy,
    page: artistPage,
    limit: 20,
  });

  const handleSortChange = (newSort) => {
    setArtistSortBy(newSort);
    setArtistPage(1);
  };

  return (
    <div className="space-y-6 font-['Jura'] text-white animate-dashboard-fade-in">
      {/* ── Top Header & Tab Navigation ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Switcher */}
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
            { id: "analytics", label: "Platform Analytics", icon: LuTrendingUp },
            { id: "audience", label: "Audience Directory", icon: LuUsers },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <MotionDiv
                    layoutId="activeAdminDashboardTab"
                    className="absolute inset-0 bg-[#0459FE] rounded-lg shadow-sm shadow-[#0459FE]/40"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 32,
                    }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Analytics Range Controls & Refresh Button (only shown in analytics mode) */}
        {activeSection === "analytics" && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Range Pills */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{
                background: "#060911",
                border: "1px solid rgba(0, 0, 0, 0.95)",
                boxShadow:
                  "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              {["7d", "30d", "90d"].map((r) => {
                const isActive = range === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRange(r);
                      setArtistPage(1);
                    }}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {isActive && (
                      <MotionDiv
                        layoutId="activeAdminRangePill"
                        className="absolute inset-0 bg-[#0459FE] rounded-lg shadow-sm shadow-[#0459FE]/40"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}
                    <span className="relative z-10">{r.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Refresh Button */}
            <button
              type="button"
              onClick={refetchAll}
              disabled={isFetching}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
              style={{
                background: "#060911",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
              title="Refresh Analytics"
            >
              <LuRefreshCw
                className={`w-3.5 h-3.5 text-[#38bdf8] transition-transform ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              <span>{isFetching ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Tab Contents ────────────────────────────────────────── */}
      {activeSection === "analytics" ? (
        <div className="space-y-6">
          {/* SECTION 1: Platform Overview Cards */}
          <AdminOverviewMetrics overview={overview} isLoading={isLoading} />

          {/* SECTION 2: Platform Activity Timeseries Chart */}
          <AdminTimeseriesChart
            timeseries={timeseries}
            range={range}
            isLoading={isLoading}
          />

          {/* SECTION 3: Conversion Insights & Traffic Reach */}
          <AdminConversionInsights overview={overview} isLoading={isLoading} />

          {/* SECTION 4: Top Performing Artists Leaderboard */}
          <AdminArtistsLeaderboard
            artists={artistsSummary}
            pagination={pagination}
            sortBy={artistSortBy}
            onSortChange={handleSortChange}
            onPageChange={setArtistPage}
            isLoading={isLoading}
          />
        </div>
      ) : (
        /* SECTION: Audience Directory with CSV Export */
        <AdminAudienceDirectory />
      )}
    </div>
  );
};

export default Dashboard;
