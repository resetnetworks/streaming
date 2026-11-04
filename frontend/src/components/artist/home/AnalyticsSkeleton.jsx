// src/components/artist/home/AnalyticsSkeleton.jsx
import React from "react";

export const CardSkeleton = () => (
  <div className="min-w-[170px] flex-1 h-[110px] rounded-xl p-[1px] bg-gradient-to-br from-white/20 to-white/5 animate-pulse">
    <div className="w-full h-full rounded-[11px] bg-[#151c2c] p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="w-6 h-6 rounded-full bg-white/10" />
      </div>
      <div>
        <div className="h-6 w-24 bg-white/20 rounded mb-1" />
        <div className="h-2 w-12 bg-white/10 rounded" />
      </div>
    </div>
  </div>
);

export const OverviewCardsSkeleton = () => (
  <div className="w-full overflow-x-auto pb-3">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 min-w-max md:min-w-0">
      {[...Array(7)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="w-full rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent animate-pulse">
    <div className="w-full h-[360px] rounded-2xl bg-[#0f172a] p-6 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-white/20 rounded" />
          <div className="h-3 w-60 bg-white/10 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-white/10 rounded-lg" />
          <div className="h-8 w-20 bg-white/10 rounded-lg" />
        </div>
      </div>
      {/* Mock wave / bars */}
      <div className="h-[200px] flex items-end gap-3 px-4">
        {[40, 65, 30, 85, 95, 55, 70, 45, 90, 60, 80, 50].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-white/10 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/30 pt-2 border-t border-white/5">
        <div className="h-3 w-12 bg-white/10 rounded" />
        <div className="h-3 w-12 bg-white/10 rounded" />
        <div className="h-3 w-12 bg-white/10 rounded" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent animate-pulse">
    <div className="w-full rounded-2xl bg-[#0f172a] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 w-48 bg-white/20 rounded" />
        <div className="h-8 w-32 bg-white/10 rounded-lg" />
      </div>
      <div className="space-y-3 pt-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-white/5 last:border-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-6 h-4 bg-white/10 rounded" />
              <div className="w-10 h-10 rounded-lg bg-white/10" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-white/20 rounded" />
                <div className="h-2.5 w-16 bg-white/10 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="h-4 w-12 bg-white/10 rounded" />
              <div className="h-4 w-12 bg-white/10 rounded hidden sm:block" />
              <div className="h-4 w-16 bg-white/10 rounded hidden md:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
