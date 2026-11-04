import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { formatCompactNumber } from "../../../utills/analytics/formatters";

// Inner 3D panel style for main cards
const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

// Reusable 3D sunken well style (recessed hole effect)
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

/**
 * ArtistSubscriptionFunnel Component
 *
 * Clean, premium 2-card section matching the exact aesthetic of the original dashboard:
 * - Card 1 (Left): Subscriptions (Donut chart spotlighting activated subscriptions & outcomes)
 * - Card 2 (Right): Conversion Funnel (Clean, unified progress bars with exact counts)
 */
export const ArtistSubscriptionFunnel = ({
  overview = null,
  balanceData = null,
  funnel = null,
  range = "30d",
}) => {
  const counts = funnel?.funnelCounts || {};

  // Real backend event counts, defaulting cleanly to 0
  const subscription_clicked = counts.subscription_clicked ?? 0;
  const checkout_started = counts.checkout_started ?? 0;
  const payment_initiated = counts.payment_initiated ?? 0;
  const payment_completed = counts.payment_completed ?? 0;
  const payment_failed = counts.payment_failed ?? 0;
  const payment_abandoned = counts.payment_abandoned ?? 0;
  const subscription_activated = counts.subscription_activated ?? 0;

  // Total outcomes in payment cycle
  const totalOutcomes =
    subscription_activated + payment_completed + payment_abandoned + payment_failed;

  // Donut chart config with subtle cohesive blue/slate palette (no rainbow colors)
  const { series, labels, colors } = useMemo(() => {
    return {
      series: [
        subscription_activated,
        payment_completed,
        payment_abandoned,
        payment_failed,
      ],
      labels: [
        "Activated Subscriptions",
        "Payment Completed",
        "Payment Abandoned",
        "Payment Failed",
      ],
      colors: ["#0459FE", "#38bdf8", "#818cf8", "#475569"],
    };
  }, [
    subscription_activated,
    payment_completed,
    payment_abandoned,
    payment_failed,
  ]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "donut",
        background: "transparent",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 850,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 450,
          },
        },
        dropShadow: {
          enabled: true,
          top: 4,
          left: 0,
          blur: 8,
          color: "#000000",
          opacity: 0.7,
        },
      },
      labels,
      colors,
      stroke: {
        show: true,
        width: 3.5,
        colors: ["#060911"],
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: "72%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "11px",
                fontFamily: "inherit",
                fontWeight: 700,
                color: "#94a3b8",
                offsetY: -6,
              },
              value: {
                show: true,
                fontSize: "26px",
                fontFamily: "monospace",
                fontWeight: 900,
                color: "#ffffff",
                offsetY: 6,
                formatter: () => formatCompactNumber(subscription_activated),
              },
              total: {
                show: true,
                label: "ACTIVATED",
                color: "#94a3b8",
                fontSize: "10px",
                fontWeight: 700,
                formatter: () => formatCompactNumber(subscription_activated),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
        },
        y: {
          formatter: (val) => `${val} fans`,
        },
      },
    };
  }, [labels, colors, subscription_activated, totalOutcomes]);

  // Bottom outcome breakdown cards for Card 1
  const outcomeCards = useMemo(() => {
    return [
      {
        id: "activated",
        label: "Activated",
        count: subscription_activated,
        sub: "Active Fans",
      },
      {
        id: "completed",
        label: "Completed",
        count: payment_completed,
        sub: "Successful Pay",
      },
      {
        id: "abandoned",
        label: "Abandoned",
        count: payment_abandoned,
        sub: "Left Checkout",
      },
      {
        id: "failed",
        label: "Failed",
        count: payment_failed,
        sub: "Declined",
      },
    ];
  }, [subscription_activated, payment_completed, payment_abandoned, payment_failed]);

  // Conversion Funnel Stages
  const maxFunnelCount = Math.max(
    subscription_clicked,
    checkout_started,
    payment_initiated,
    payment_completed,
    subscription_activated,
    1
  );

  const funnelStages = useMemo(() => {
    return [
      {
        id: "subscription_clicked",
        label: "Subscription Clicked",
        count: subscription_clicked,
        percentage: Math.round((subscription_clicked / maxFunnelCount) * 100),
      },
      {
        id: "checkout_started",
        label: "Checkout Started",
        count: checkout_started,
        percentage: Math.round((checkout_started / maxFunnelCount) * 100),
      },
      {
        id: "payment_initiated",
        label: "Payment Initiated",
        count: payment_initiated,
        percentage: Math.round((payment_initiated / maxFunnelCount) * 100),
      },
      {
        id: "payment_completed",
        label: "Payment Completed",
        count: payment_completed,
        percentage: Math.round((payment_completed / maxFunnelCount) * 100),
      },
      {
        id: "subscription_activated",
        label: "Subscription Activated",
        count: subscription_activated,
        percentage: Math.round((subscription_activated / maxFunnelCount) * 100),
      },
    ];
  }, [
    subscription_clicked,
    checkout_started,
    payment_initiated,
    payment_completed,
    subscription_activated,
    maxFunnelCount,
  ]);

  // Overall Conversion Rate
  const conversionRate = useMemo(() => {
    if (funnel?.conversionRates?.overallConversionRate) {
      return Number(funnel.conversionRates.overallConversionRate).toFixed(1);
    }
    return subscription_clicked > 0
      ? ((subscription_activated / subscription_clicked) * 100).toFixed(1)
      : "0.0";
  }, [funnel?.conversionRates?.overallConversionRate, subscription_activated, subscription_clicked]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4 items-stretch">
      {/* ======================================================== */}
      {/* CARD 1: Subscriptions Breakdown (Left Side Donut Chart)  */}
      {/* ======================================================== */}
      <div className="rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d] h-full flex flex-col w-full shadow-2xl">
        <div
          className="p-5 rounded-[10px] relative h-full flex flex-col justify-between"
          style={innerPanel3dStyle}
        >
          {/* Card Header (Clean, bold, no extra pill badges) */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-white text-xl font-bold tracking-tight">Subscriptions</h2>
            <div className="text-right">
              <span className="text-xs text-gray-300 block font-bold uppercase tracking-wider">Activated</span>
              <span className="text-white text-lg font-black font-mono">
                {formatCompactNumber(subscription_activated)}
              </span>
            </div>
          </div>

          {/* Donut Chart Inner 3D Sunken Well Container */}
          <div className="w-full flex items-center justify-center my-2">
            <div
              className="relative flex items-center justify-center w-[250px] h-[250px] rounded-full p-2 transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: "radial-gradient(circle at 50% 50%, #060913 0%, #0a1122 65%, #040710 100%)",
                border: "1px solid rgba(0, 0, 0, 0.95)",
                boxShadow:
                  "inset 0 8px 20px rgba(0, 0, 0, 0.95), inset 0 2px 6px rgba(0, 0, 0, 0.98), inset 0 -2px 2px rgba(255, 255, 255, 0.05), 0 2px 6px rgba(0, 0, 0, 0.6)",
              }}
            >
              {/* Central 3D recessed hub */}
              <div
                className="absolute w-[108px] h-[108px] rounded-full pointer-events-none transition-all duration-500"
                style={{
                  background: "radial-gradient(circle, #090f1f 0%, #03050a 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "inset 0 4px 10px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.6)",
                }}
              />
              <Chart
                options={chartOptions}
                series={series}
                type="donut"
                height={235}
                width={235}
              />
            </div>
          </div>

          {/* Clean Outcome Breakdown Row (No dots, no underscores, original clean styling) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/10">
            {outcomeCards.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-500/40"
                style={sunkenCardStyle}
              >
                <span className="text-gray-300 text-[11px] font-bold uppercase tracking-wider truncate">
                  {item.label}
                </span>
                <span className="text-white text-2xl font-black font-mono tracking-tight my-1.5">
                  {formatCompactNumber(item.count)}
                </span>
                <span className="text-gray-400 text-xs font-bold tracking-wide">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARD 2: Conversion Funnel (Right Side Progress Bars)     */}
      {/* ======================================================== */}
      <div className="rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d] h-full flex flex-col w-full shadow-2xl">
        <div
          className="p-5 rounded-[10px] relative h-full flex flex-col justify-between"
          style={innerPanel3dStyle}
        >
          {/* Card Header (Clean, bold, no extra pill badges) */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-white text-xl font-bold tracking-tight">Conversion Funnel</h2>
            <div className="text-right">
              <span className="text-xs text-gray-300 block font-bold uppercase tracking-wider">Conversion Rate</span>
              <span className="text-[#38bdf8] text-lg font-black font-mono">
                {conversionRate}
                <span className="text-xs text-gray-400 font-sans ml-0.5">%</span>
              </span>
            </div>
          </div>

          {/* Funnel Progress Bars (Clean Metric Count Only, No Redundant Percentage Clutter) */}
          <div className="flex flex-col justify-center space-y-3.5 my-auto py-2">
            {funnelStages.map((stage) => (
              <div key={stage.id} className="space-y-1.5 group">
                {/* Clean Label & Metric Count */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold text-sm tracking-wide group-hover:text-blue-300 transition-colors">
                    {stage.label}
                  </span>
                  <div className="flex items-center font-mono">
                    <span className="text-white font-black text-sm tracking-tight">
                      {formatCompactNumber(stage.count)}
                    </span>
                  </div>
                </div>

                {/* Unified signature blue gradient progress bar */}
                <div className="w-full h-3.5 rounded-[5px] bg-[#050811] border border-white/10 overflow-hidden p-[1.5px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]">
                  <div
                    className="h-full rounded-[3px] bg-gradient-to-r from-[#0459FE] to-[#2563eb] transition-all duration-1000 ease-out shadow-sm shadow-[#0459FE]/40 relative overflow-hidden"
                    style={{
                      width:
                        stage.percentage > 0
                          ? `${Math.max(4, Math.min(100, stage.percentage))}%`
                          : "0%",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Drop-off & Abandonment Insights Row (Clean, original 3D styling without repeating conversion rate) */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
            {/* Abandoned */}
            <div
              className="p-3 rounded-xl flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-500/40"
              style={sunkenCardStyle}
            >
              <span className="text-gray-300 text-[11px] font-bold uppercase tracking-wider truncate">
                Abandoned
              </span>
              <span className="text-white text-2xl font-black font-mono tracking-tight my-1.5">
                {formatCompactNumber(payment_abandoned)}
              </span>
              <span className="text-gray-400 text-xs font-bold tracking-wide">
                Left Checkout
              </span>
            </div>

            {/* Payment Failed */}
            <div
              className="p-3 rounded-xl flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-500/40"
              style={sunkenCardStyle}
            >
              <span className="text-gray-300 text-[11px] font-bold uppercase tracking-wider truncate">
                Failed Pay
              </span>
              <span className="text-white text-2xl font-black font-mono tracking-tight my-1.5">
                {formatCompactNumber(payment_failed)}
              </span>
              <span className="text-gray-400 text-xs font-bold tracking-wide">
                Declined
              </span>
            </div>

            {/* Timeouts */}
            <div
              className="p-3 rounded-xl flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-500/40"
              style={sunkenCardStyle}
            >
              <span className="text-gray-300 text-[11px] font-bold uppercase tracking-wider truncate">
                Timeouts
              </span>
              <span className="text-white text-2xl font-black font-mono tracking-tight my-1.5">
                {formatCompactNumber(payment_abandoned)}
              </span>
              <span className="text-gray-400 text-xs font-bold tracking-wide">
                30m Idle
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2.8s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default ArtistSubscriptionFunnel;
