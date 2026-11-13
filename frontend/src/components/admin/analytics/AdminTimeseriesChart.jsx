// src/components/admin/analytics/AdminTimeseriesChart.jsx
import React, { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";
import { formatDateLabel, formatCompactNumber } from "../../../utills/analytics/formatters";

const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

const MotionDiv = motion.div;

export const AdminTimeseriesChart = ({
  timeseries = [],
  range = "30d",
  isLoading = false,
}) => {
  const [chartMode, setChartMode] = useState("plays"); // "plays" | "revenue" | "traffic"

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

  const { series, colors, yaxisFormatter } = useMemo(() => {
    const s = [];
    const c = [];
    let formatter = (val) => formatCompactNumber(val);

    if (chartMode === "plays") {
      s.push({
        name: "Total Streams",
        data: timeseries.map((pt) => pt.plays || 0),
      });
      c.push("#0459FE");

      s.push({
        name: "Qualified Plays",
        data: timeseries.map((pt) => pt.qualifiedPlays || 0),
      });
      c.push("#38bdf8");
    } else if (chartMode === "revenue") {
      s.push({
        name: "Gross Revenue ($)",
        data: timeseries.map((pt) => Number(((pt.revenueCents || 0) / 100).toFixed(2))),
      });
      c.push("#10B981");

      formatter = (val) => `$${Number(val).toFixed(2)}`;
    } else if (chartMode === "traffic") {
      s.push({
        name: "Home Page Views",
        data: timeseries.map((pt) => pt.homeViews || 0),
      });
      c.push("#38bdf8");

      s.push({
        name: "Landing Page Views",
        data: timeseries.map((pt) => pt.landingViews || 0),
      });
      c.push("#818cf8");

      s.push({
        name: "Signups",
        data: timeseries.map((pt) => pt.signups || 0),
      });
      c.push("#10b981");
    }

    return { series: s, colors: c, yaxisFormatter: formatter };
  }, [timeseries, chartMode]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        background: "transparent",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 600,
        },
      },
      colors,
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 2.5,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 95, 100],
        },
      },
      grid: {
        borderColor: "rgba(255, 255, 255, 0.05)",
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: "#94a3b8",
            fontSize: "11px",
            fontFamily: "'Jura', sans-serif",
          },
          rotate: -45,
          rotateAlways: false,
          hideOverlappingLabels: true,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#94a3b8",
            fontSize: "11px",
            fontFamily: "'Jura', sans-serif",
          },
          formatter: yaxisFormatter,
        },
      },
      tooltip: {
        theme: "dark",
        style: {
          fontSize: "12px",
          fontFamily: "'Jura', sans-serif",
        },
        y: {
          formatter: (val) =>
            chartMode === "revenue"
              ? `$${Number(val).toFixed(2)}`
              : formatCompactNumber(val),
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        labels: { colors: "#cbd5e1" },
        markers: { radius: 12 },
      },
    }),
    [categories, colors, chartMode, yaxisFormatter]
  );

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md w-full">
      <div className="rounded-2xl p-4 sm:p-5 flex flex-col" style={innerPanel3dStyle}>
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Platform Activity Trends
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous day-by-day volume across the streaming ecosystem
            </p>
          </div>

          {/* Mode Tabs */}
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
              { id: "plays", label: "Streams & Plays" },
              { id: "revenue", label: "Revenue" },
              { id: "traffic", label: "Traffic & Signups" },
            ].map((tab) => {
              const isActive = chartMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChartMode(tab.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <MotionDiv
                      layoutId="activeAdminChartTab"
                      className="absolute inset-0 bg-[#0459FE] rounded-lg shadow-sm shadow-[#0459FE]/40"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-[320px] sm:h-[360px] relative">
          {isLoading && timeseries.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-[#38bdf8]" />
            </div>
          ) : (
            <Chart
              options={chartOptions}
              series={series}
              type="area"
              height="100%"
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTimeseriesChart;

