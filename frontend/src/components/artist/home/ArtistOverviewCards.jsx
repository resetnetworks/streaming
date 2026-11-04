// src/components/artist/home/ArtistOverviewCards.jsx
import React from "react";
import {
  LuPlay,
  LuCircleCheck,
  LuTrendingUp,
  LuSkipForward,
  LuEye,
  LuUsers,
  LuDollarSign,
} from "react-icons/lu";
import {
  formatCompactNumber,
  formatPercentage,
  formatCurrency,
} from "../../../utills/analytics/formatters";
import { OverviewCardsSkeleton } from "./AnalyticsSkeleton";

const MetricCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  accentColor = "from-blue-500 to-cyan-500",
  iconBg = "bg-blue-500/10 text-blue-400 border-blue-500/20",
}) => {
  return (
    <div className="group relative min-w-[170px] flex-1 rounded-2xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent hover:from-white/30 transition-all duration-300">
      <div className="h-full rounded-[15px] bg-[#0c1424]/90 backdrop-blur-md p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle hover background highlight */}
        <div
          className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br ${accentColor} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity duration-300`}
        />

        {/* Top: Label and Icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          {Icon && (
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border text-sm ${iconBg}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Middle: Big Stat */}
        <div className="my-1">
          <div className="text-2xl font-bold text-white tracking-tight">
            {value}
          </div>
        </div>

        {/* Bottom: Subtext / helper */}
        {subtext && (
          <div className="text-[11px] text-gray-400 truncate mt-1 flex items-center gap-1">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export const ArtistOverviewCards = ({ overview, isLoading = false }) => {
  if (isLoading) {
    return <OverviewCardsSkeleton />;
  }

  const playback = overview?.playback || {};
  const traffic = overview?.traffic || {};
  const audience = overview?.audience || {};
  const monetization = overview?.monetization || {};
  const artist = overview?.artist || {};

  const totalViews = (traffic.profileViews || 0) + (traffic.songViews || 0);

  const cards = [
    {
      id: "streams",
      label: "Streams",
      value: formatCompactNumber(playback.totalPlays || 0),
      subtext: `${formatCompactNumber(playback.qualifiedPlays || 0)} qualified`,
      icon: LuPlay,
      accentColor: "from-blue-500 to-cyan-400",
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: "qualified",
      label: "Qualified",
      value: formatCompactNumber(playback.qualifiedPlays || 0),
      subtext: "Plays \u2265 30 seconds",
      icon: LuCircleCheck,
      accentColor: "from-emerald-500 to-teal-400",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      id: "completion",
      label: "Completion",
      value: formatPercentage(playback.completionRate || 0),
      subtext: `${formatCompactNumber(playback.completions || 0)} finished`,
      icon: LuTrendingUp,
      accentColor: "from-indigo-500 to-purple-400",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: "skips",
      label: "Skip Rate",
      value: formatPercentage(playback.skipRate || 0),
      subtext: `${formatCompactNumber(playback.skips || 0)} skipped`,
      icon: LuSkipForward,
      accentColor: "from-amber-500 to-orange-400",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      id: "views",
      label: "Page Views",
      value: formatCompactNumber(totalViews),
      subtext: `${formatCompactNumber(traffic.profileViews || 0)} profile \u2022 ${formatCompactNumber(traffic.songViews || 0)} track`,
      icon: LuEye,
      accentColor: "from-sky-500 to-blue-400",
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    {
      id: "followers",
      label: "Followers",
      value: `+${formatCompactNumber(audience.newFollowers || 0)}`,
      subtext: `Total ${formatCompactNumber(artist.currentFollowers || 0)} fans`,
      icon: LuUsers,
      accentColor: "from-pink-500 to-rose-400",
      iconBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
    {
      id: "revenue",
      label: "Revenue",
      value: monetization.revenueFormatted || formatCurrency(monetization.revenueCents || 0),
      subtext: `${monetization.purchasesCompleted || 0} purchases`,
      icon: LuDollarSign,
      accentColor: "from-emerald-400 to-green-500",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 pt-1 -mt-1 scrollbar-thin scrollbar-thumb-white/10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 min-w-max lg:min-w-0">
        {cards.map((card) => (
          <MetricCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  );
};

export default ArtistOverviewCards;
