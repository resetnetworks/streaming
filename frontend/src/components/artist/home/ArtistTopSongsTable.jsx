// src/components/artist/home/ArtistTopSongsTable.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  LuMusic,
  LuPlay,
  LuCircleCheck,
  LuTrendingUp,
  LuHeart,
  LuSkipForward,
} from "react-icons/lu";
import {
  formatCompactNumber,
  formatPercentage,
} from "../../../utills/analytics/formatters";
import { formatDuration } from "../../../utills/helperFunctions";
import { TableSkeleton } from "./AnalyticsSkeleton";

const SORT_OPTIONS = [
  { id: "plays", label: "Most Plays" },
  { id: "qualifiedPlays", label: "Qualified Plays" },
  { id: "completions", label: "Completions" },
  { id: "likes", label: "Likes" },
];

export const ArtistTopSongsTable = ({
  songs = [],
  isLoading = false,
  sortBy = "plays",
  onSortChange,
}) => {
  if (isLoading) {
    return <TableSkeleton />;
  }

  const isEmpty = !songs || songs.length === 0;

  return (
    <div className="w-full rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent mb-6">
      <div className="rounded-2xl bg-[#0c1424]/90 backdrop-blur-md p-5 sm:p-6">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <LuMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Top Performing Tracks
              </h3>
              <p className="text-xs text-gray-400">
                Breakdown of listening duration, completion rate, and fan engagement
              </p>
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-gray-400 hidden sm:inline">Sort by:</span>
            <div className="flex items-center bg-[#070d18] p-1 rounded-xl border border-white/10">
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSortChange?.(opt.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="h-[220px] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 bg-white/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <LuMusic className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              No Track Performance Recorded Yet
            </h4>
            <p className="text-xs text-gray-400 max-w-md">
              Tracks that receive streams, completions, or likes within the selected date range will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">Track</th>
                  <th className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      <LuPlay className="w-3 h-3 text-blue-400" /> Plays
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <LuCircleCheck className="w-3 h-3 text-emerald-400" /> Qualified
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      <LuTrendingUp className="w-3 h-3 text-purple-400" /> Completion
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right hidden md:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <LuSkipForward className="w-3 h-3 text-amber-400" /> Skips
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <LuHeart className="w-3 h-3 text-pink-400" /> Likes
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {songs.map((song, index) => {
                  const rank = index + 1;
                  const rankBadgeClass =
                    rank === 1
                      ? "text-amber-300 font-bold"
                      : rank === 2
                      ? "text-slate-300 font-semibold"
                      : rank === 3
                      ? "text-amber-600 font-semibold"
                      : "text-gray-500";

                  const completionPercent = Number(song.completionRate || 0);

                  return (
                    <tr
                      key={song._id || song.songId || index}
                      className="group hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Rank */}
                      <td className={`py-3 px-3 text-center text-xs ${rankBadgeClass}`}>
                        {rank}
                      </td>

                      {/* Song info (artwork, title, duration) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 relative">
                            {song.artwork ? (
                              <img
                                src={song.artwork}
                                alt={song.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold ${
                                song.artwork ? "hidden" : "flex"
                              }`}
                            >
                              {(song.title || "T").charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                            <div className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                              {song.title || "Untitled Track"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDuration(song.duration || 0)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Plays */}
                      <td className="py-3 px-3 text-right font-semibold text-white">
                        {formatCompactNumber(song.plays || 0)}
                      </td>

                      {/* Qualified Plays */}
                      <td className="py-3 px-3 text-right text-gray-300 hidden sm:table-cell">
                        {formatCompactNumber(song.qualifiedPlays || 0)}
                      </td>

                      {/* Completion Rate + Bar */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="font-medium text-purple-300">
                            {formatPercentage(completionPercent)}
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, completionPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Skips */}
                      <td className="py-3 px-3 text-right text-amber-300/80 hidden md:table-cell">
                        {formatCompactNumber(song.skips || 0)}
                      </td>

                      {/* Likes */}
                      <td className="py-3 px-3 text-right text-pink-300/80 hidden lg:table-cell">
                        {formatCompactNumber(song.likes || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistTopSongsTable;
