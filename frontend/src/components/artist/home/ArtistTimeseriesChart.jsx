import React, { useState, useMemo, useEffect } from "react";
import Chart from "react-apexcharts";
import { FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";
import { formatDateLabel, formatCompactNumber } from "../../../utills/analytics/formatters";

// Inner 3D panel style matching Map, Subscriptions, and Conversion Funnel
const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

export const ArtistTimeseriesChart = ({
  timeseries = [],
  range = "30d",
  isLoading = false,
}) => {
  const [chartMode, setChartMode] = useState("plays"); // "plays" | "retention" | "views" | "growth"
  const [showStreams, setShowStreams] = useState(true);
  const [showQualified, setShowQualified] = useState(true);
  const [activeInfo, setActiveInfo] = useState(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!activeInfo) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".info-tooltip-btn")) {
        setActiveInfo(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeInfo]);

  const categories = useMemo(() => {
    if (timeseries && timeseries.length > 0) {
      return timeseries.map((pt) => formatDateLabel(pt.date));
    }
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const now = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      result.push(formatDateLabel(d.toISOString().split("T")[0]));
    }
    return result;
  }, [timeseries, range]);

  const dataPoints = useMemo(() => {
    if (timeseries && timeseries.length > 0) {
      return timeseries;
    }
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    return Array.from({ length: days }, () => ({
      plays: 0,
      qualifiedPlays: 0,
      completions: 0,
      skips: 0,
      profileViews: 0,
      songViews: 0,
      followers: 0,
      likes: 0,
    }));
  }, [timeseries, range]);

  const { series, colors } = useMemo(() => {
    const s = [];
    const c = [];

    if (chartMode === "plays") {
      const activeStreams = showStreams || (!showStreams && !showQualified);
      const activeQualified = showQualified;

      if (activeStreams) {
        s.push({
          name: "Streams",
          data: dataPoints.map((pt) => pt.plays || 0),
        });
        c.push("#0459FE");
      }

      if (activeQualified) {
        s.push({
          name: "Qualified Plays",
          data: dataPoints.map((pt) => pt.qualifiedPlays || 0),
        });
        c.push("#60a5fa");
      }
    } else if (chartMode === "retention") {
      s.push({
        name: "Completions",
        data: dataPoints.map((pt) => pt.completions || 0),
      });
      c.push("#10b981");

      s.push({
        name: "Skips",
        data: dataPoints.map((pt) => pt.skips || 0),
      });
      c.push("#f59e0b");
    } else if (chartMode === "views") {
      s.push({
        name: "Profile Views",
        data: dataPoints.map((pt) => pt.profileViews || 0),
      });
      c.push("#38bdf8");

      s.push({
        name: "Track Views",
        data: dataPoints.map((pt) => pt.songViews || 0),
      });
      c.push("#a855f7");
    } else if (chartMode === "growth") {
      s.push({
        name: "New Followers",
        data: dataPoints.map((pt) => pt.followers || 0),
      });
      c.push("#ec4899");

      s.push({
        name: "Likes",
        data: dataPoints.map((pt) => pt.likes || 0),
      });
      c.push("#f43f5e");
    }

    return { series: s, colors: c };
  }, [chartMode, showStreams, showQualified, dataPoints]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "area",
        height: 310,
        toolbar: { show: false },
        zoom: { enabled: false },
        selection: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 650,
          animateGradually: {
            enabled: true,
            delay: 140,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 450,
          },
        },
        background: "transparent",
        fontFamily: "inherit",
        dropShadow: {
          enabled: true,
          top: 3,
          left: 0,
          blur: 5,
          color: colors[0] || "#0459FE",
          opacity: 0.18,
        },
      },
      colors,
      stroke: {
        curve: "smooth",
        width: 2.5,
        lineCap: "round",
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.4,
          gradientToColors: undefined,
          inverseColors: false,
          opacityFrom: 0.45,
          opacityTo: 0.03,
          stops: [0, 85, 100],
        },
      },
      markers: {
        size: 0,
        strokeColors: "#0f172a",
        strokeWidth: 2,
        hover: {
          size: 5,
          sizeOffset: 3,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: "rgba(255, 255, 255, 0.05)",
        strokeDashArray: 4,
        padding: {
          top: 10,
          right: 15,
          bottom: 0,
          left: 10,
        },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
          rotate: -25,
          rotateAlways: false,
          hideOverlappingLabels: true,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
          formatter: (val) => formatCompactNumber(val),
        },
      },
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
        },
        y: {
          formatter: (val) => `${formatCompactNumber(val)}`,
        },
        marker: {
          show: true,
        },
      },
    };
  }, [categories, colors]);

  const handleToggleStreams = () => {
    if (showStreams && !showQualified) {
      setShowQualified(true);
      setShowStreams(false);
    } else {
      setShowStreams(!showStreams);
    }
  };

  const handleToggleQualified = () => {
    if (showQualified && !showStreams) {
      setShowStreams(true);
      setShowQualified(false);
    } else {
      setShowQualified(!showQualified);
    }
  };

  return (
    <div className="rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d] h-full flex flex-col w-full shadow-2xl">
      <div
        className="p-5 rounded-[10px] relative h-full flex flex-col justify-between"
        style={innerPanel3dStyle}
      >
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-white text-xl font-bold tracking-tight">Stream Activity</h2>
          </div>

          {/* Metric Mode Pill Selector (Sunken 3D Well Slot, Bold Typography, Smooth Sliding Tab Pill) */}
          <div
            className="flex items-center p-1 gap-1 rounded-[8px] self-start sm:self-auto relative"
            style={{
              background: "#060911",
              border: "1px solid rgba(0, 0, 0, 0.95)",
              boxShadow:
                "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {[
              { id: "plays", label: "Plays" },
              { id: "retention", label: "Retention" },
              { id: "views", label: "Views" },
              { id: "growth", label: "Growth" },
            ].map((m) => {
              const isActive = chartMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMode(m.id)}
                  className={`relative px-3.5 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeChartModePill"
                      className="absolute inset-0 bg-[#0459FE] rounded-[6px] shadow-sm shadow-[#0459FE]/40"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend / Filter Controls for Current Mode */}
        <div className="flex items-center justify-between gap-3 text-xs mb-2 transition-all duration-300 ease-in-out min-h-[28px]">
          {chartMode === "plays" && (
            <div className="flex items-center gap-4">
              {/* 1. Streams Checkbox (Sunken 3D Checkbox) */}
              <div className="flex items-center gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={showStreams}
                    onChange={handleToggleStreams}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded-[4px] flex items-center justify-center transition-all"
                    style={
                      showStreams
                        ? {
                            background: "#0459FE",
                            border: "1px solid #0459FE",
                            boxShadow: "0 0 8px rgba(4, 89, 254, 0.5)",
                          }
                        : {
                            background: "#060911",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.85)",
                          }
                    }
                  >
                    {showStreams && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                      showStreams ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Streams
                  </span>
                </label>

                {/* Info Tooltip */}
                <div
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setActiveInfo("streams")}
                  onMouseLeave={() => setActiveInfo(null)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInfo(activeInfo === "streams" ? null : "streams");
                    }}
                    className="info-tooltip-btn text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Streams Info"
                  >
                    <FiInfo className="w-3.5 h-3.5" />
                  </button>

                  {activeInfo === "streams" && (
                    <div className="absolute bottom-full left-0 mb-2 z-50 pointer-events-none w-56 animate-in fade-in duration-150">
                      <div className="bg-[#0b1322] border border-gray-700/80 rounded-lg px-3 py-2 shadow-2xl shadow-black/90 text-center text-gray-200 text-xs leading-snug backdrop-blur-md">
                        Total plays recorded whenever listeners start playing your tracks.
                      </div>
                      <div className="w-2 h-2 bg-[#0b1322] border-r border-b border-gray-700/80 transform rotate-45 -mt-1 ml-2" />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Qualified Plays Checkbox */}
              <div className="flex items-center gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={showQualified}
                    onChange={handleToggleQualified}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded-[4px] flex items-center justify-center transition-all"
                    style={
                      showQualified
                        ? {
                            background: "#0459FE",
                            border: "1px solid #0459FE",
                            boxShadow: "0 0 8px rgba(4, 89, 254, 0.5)",
                          }
                        : {
                            background: "#060911",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.85)",
                          }
                    }
                  >
                    {showQualified && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                      showQualified ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Qualified Plays
                  </span>
                </label>

                {/* Info Tooltip */}
                <div
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setActiveInfo("qualified")}
                  onMouseLeave={() => setActiveInfo(null)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInfo(activeInfo === "qualified" ? null : "qualified");
                    }}
                    className="info-tooltip-btn text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Qualified Plays Info"
                  >
                    <FiInfo className="w-3.5 h-3.5" />
                  </button>

                  {activeInfo === "qualified" && (
                    <div className="absolute bottom-full right-0 mb-2 z-50 pointer-events-none w-60 max-w-[calc(100vw-60px)] animate-in fade-in duration-150">
                      <div className="bg-[#0b1322] border border-gray-700/80 rounded-lg px-3 py-2 shadow-2xl shadow-black/90 text-center text-gray-200 text-xs leading-snug backdrop-blur-md">
                        Plays where listeners streamed for at least 30 seconds.
                      </div>
                      <div className="w-2 h-2 bg-[#0b1322] border-r border-b border-gray-700/80 transform rotate-45 -mt-1 ml-auto mr-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {chartMode === "retention" && (
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-200">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500 shadow-sm" />
                Completions
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-amber-500 shadow-sm" />
                Skips
              </span>
            </div>
          )}

          {chartMode === "views" && (
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-200">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-sky-400 shadow-sm" />
                Profile Views
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-purple-500 shadow-sm" />
                Track Page Views
              </span>
            </div>
          )}

          {chartMode === "growth" && (
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-200">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-pink-500 shadow-sm" />
                New Followers
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-rose-500 shadow-sm" />
                Likes Received
              </span>
            </div>
          )}
        </div>

        {/* Clean Chart Container */}
        <div className="w-full h-[310px] chart-pointer-cursor">
          <Chart
            options={chartOptions}
            series={series}
            type="area"
            height={310}
            width="100%"
          />
        </div>

        <style>{`
          .chart-pointer-cursor,
          .chart-pointer-cursor svg,
          .chart-pointer-cursor .apexcharts-canvas,
          .chart-pointer-cursor .apexcharts-canvas *,
          .chart-pointer-cursor .apexcharts-canvas svg,
          .chart-pointer-cursor path,
          .chart-pointer-cursor line {
            cursor: pointer !important;
          }

          /* Custom sleek ApexCharts tooltip matching dark theme */
          .chart-pointer-cursor .apexcharts-tooltip.apexcharts-theme-dark {
            background: rgba(15, 23, 42, 0.95) !important;
            backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
            border-radius: 10px !important;
            color: #f8fafc !important;
            padding: 4px !important;
          }
          .chart-pointer-cursor .apexcharts-tooltip-title {
            background: rgba(255, 255, 255, 0.05) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            color: #94a3b8 !important;
            padding: 6px 10px !important;
          }
          .chart-pointer-cursor .apexcharts-tooltip-series-group {
            padding: 4px 10px !important;
          }
          .chart-pointer-cursor .apexcharts-tooltip-text {
            font-size: 12px !important;
            font-weight: 500 !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ArtistTimeseriesChart;
