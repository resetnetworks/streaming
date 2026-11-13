// src/components/admin/analytics/AdminArtistsLeaderboard.jsx
import React from "react";
import {
  LuUser,
  LuBadgeCheck,
  LuTrendingUp,
  LuArrowDownRight,
  LuChevronLeft,
  LuChevronRight,
  LuMusic,
} from "react-icons/lu";
import { formatCompactNumber, formatCurrency } from "../../../utills/analytics/formatters";

const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

export const AdminArtistsLeaderboard = ({
  artists = [],
  pagination,
  sortBy,
  onSortChange,
  onPageChange,
  isLoading,
}) => {
  const sortOptions = [
    { value: "plays", label: "Most Streams" },
    { value: "qualifiedPlays", label: "Qualified Plays" },
    { value: "revenue", label: "Top Revenue" },
    { value: "followers", label: "Followers Gained" },
  ];

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md w-full">
      <div className="rounded-2xl flex flex-col overflow-hidden" style={innerPanel3dStyle}>
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Top Performing Artists
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked breakdown of creator engagement and monetization
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-[#060911] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-[#0459FE] transition-colors cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          {isLoading && artists.length === 0 ? (
            <div className="p-14 text-center">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-[#38bdf8]" />
              <p className="text-sm text-slate-400 mt-3 font-medium">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <LuMusic className="w-8 h-8 text-slate-600 mx-auto mb-2 stroke-1" />
              <p className="text-sm font-medium">No artist performance data recorded yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/30 border-b border-white/5">
                  <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider w-14 text-center">
                    #
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">
                    Streams
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">
                    Qualified
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">
                    Revenue
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">
                    Followers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {artists.map((artist, idx) => {
                  const rank = ((pagination?.page || 1) - 1) * (pagination?.limit || 20) + (idx + 1);

                  return (
                    <tr key={artist.artistId || idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 text-center">
                        <span
                          className={`text-xs font-bold font-mono ${
                            rank === 1
                              ? "text-amber-400"
                              : rank === 2
                              ? "text-slate-200"
                              : rank === 3
                              ? "text-amber-600"
                              : "text-slate-500"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F3272] to-[#3380FF] flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden border border-white/10">
                            {artist.avatar ? (
                              <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                              artist.name?.charAt(0)?.toUpperCase() || "A"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{artist.name}</span>
                              {artist.isVerified && (
                                <LuBadgeCheck className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              @{artist.handle || "artist"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-white">
                          {formatCompactNumber(artist.plays || 0)}
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-300">
                          {formatCompactNumber(artist.qualifiedPlays || 0)}
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-emerald-400">
                          {formatCurrency(artist.revenueCents || 0)}
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-300">
                          +{formatCompactNumber(artist.followersGained || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20 text-xs">
            <span className="text-slate-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} artists)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
                className="p-1.5 rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <LuChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="p-1.5 rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <LuChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArtistsLeaderboard;

