import React, { useState, useEffect, useCallback } from "react";
import { LuCalendarDays } from "react-icons/lu";
import { FiSearch } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import AlbumModal from "./AlbumModal";
import {
  useDashboardSingles,
  useDashboardAlbums,
} from "../../../hooks/api/useArtists";
import { useDraftAlbums, useMigrationStatus } from "../../../hooks/api/useMigration";
import { getS3Url } from "../../../utills/s3Utils";

import { toast } from "sonner";

/**
 * defaultTab  — "songs" | "albums" | null
 *   Passed by Dashboard after a successful upload so the right tab
 *   is immediately visible without the user having to click.
 *
 * onTabConsumed — () => void
 *   Called once after we apply defaultTab so Dashboard can reset
 *   its signal. Without this, every re-render would force the tab back.
 */
const UploadsComponent = ({ defaultTab = null, onTabConsumed, onDraftSelect }) => {
  const { data: songsData, isLoading: songsLoading } = useDashboardSingles();
  const { data: albumsData, isLoading: albumsLoading } = useDashboardAlbums();

  const activeJobId = localStorage.getItem("activeMigrationJobId");
  const { data: jobStatus } = useMigrationStatus(activeJobId, {
    refetchInterval: (query) => {
      const status = query.state?.data?.data?.status;
      if (status === 'READY' || status === 'FAILED' || status === 'IMPORTED') {
        return false;
      }
      return 5000;
    }
  });

  const currentStatus = jobStatus?.data?.status;
  const currentStep = jobStatus?.data?.currentStep;
  const currentProgress = jobStatus?.data?.progress;
  const isMigrating = currentStatus && !['READY', 'FAILED', 'IMPORTED'].includes(currentStatus);

  useEffect(() => {
    if (currentStatus === 'READY') {
      toast.success("Migration completed! All drafts fetched.", { id: "mig-toast" });
      localStorage.removeItem("activeMigrationJobId");
    } else if (currentStatus === 'FAILED') {
      toast.error("Migration failed.", { id: "mig-toast" });
      localStorage.removeItem("activeMigrationJobId");
    } else if (isMigrating && currentStep) {
      toast.loading(`Syncing: ${currentStep} (${currentProgress || 0}%)`, { id: "mig-toast" });
    }
  }, [currentStatus, currentStep, currentProgress, isMigrating]);

  const { data: draftsData, isLoading: draftsLoading } = useDraftAlbums({
    refetchInterval: isMigrating ? 5000 : false
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("uploadsActiveTab") || "albums";
    }
    return "albums";
  });
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("uploadsActiveTab", activeTab);
    }
  }, [activeTab]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("lastMonth");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Apply the one-time tab signal from Dashboard, then clear it
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
      onTabConsumed?.();
    }
  }, [defaultTab]);

  const handleImageError = useCallback((e) => {
    const target = e.target;
    if (target.dataset.errorHandled) return;
    target.dataset.errorHandled = "true";
    target.style.display = "none";

    const container = target.closest("div");
    if (container) {
      const title = container.dataset.title || "A";
      container.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white text-xs font-bold rounded-md md:rounded-lg">
          ${title.charAt(0).toUpperCase()}
        </div>
      `;
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleAlbumClick = useCallback((album) => {
    setSelectedAlbum(album);
  }, []);

  const songs = songsData?.pages?.flatMap((page) => page.songs) || [];
  const albums = albumsData?.pages?.flatMap((page) => page.albums) || [];
  const drafts = draftsData?.data || [];

  let data = [];
  if (activeTab === "songs") data = songs;
  else if (activeTab === "albums") data = albums;
  else if (activeTab === "drafts") data = drafts;

  const filtered = data.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Show spinner while the active tab's data is loading
  if (
    (activeTab === "songs" && songsLoading) ||
    (activeTab === "albums" && albumsLoading) ||
    (activeTab === "drafts" && draftsLoading)
  ) {
    return (
      <div className="p-4 md:p-6">
        <div className="w-full h-full text-white flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  const renderRow = (item, index) => (
    <div
      key={item._id}
      className={`
        group flex flex-col md:grid md:grid-cols-[60px_1fr_120px_140px]
        p-4 md:p-6 border-b border-gray-500/30 last:border-b-0
        hover:bg-gradient-to-r hover:scale-[1.02] md:hover:scale-100 transition-all duration-500 ease-out
        rounded-xl md:rounded-none md:hover:rounded-xl bg-white/3 md:bg-transparent backdrop-blur-sm
        hover:from-[#020617]/90 hover:to-[#001b3d]/90 hover:border-blue-500/30
        ${activeTab === "drafts" || activeTab === "albums" ? "cursor-pointer" : ""}
      `}
      onClick={() => {
        if (activeTab === "albums") handleAlbumClick(item);
        if (activeTab === "drafts" && onDraftSelect) onDraftSelect(item._id);
      }}
    >
      {/* ── Mobile row ── */}
      <div className="md:hidden">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0" data-title={item.title}>
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <img
                src={getS3Url(item.coverImage || item.coverImageKey) || "/api/placeholder/64/64"}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {index + 1}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold lowercase text-base mb-1 truncate">
              {item.title}
            </h3>
            <div className="space-y-1">
              <span
                className={`px-2 py-1 rounded-full lowercase text-xs font-medium ${item.accessType === "purchase-only"
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  : item.accessType === "free"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
              >
                {item.accessType === "purchase-only" ? "purchase-only" : item.accessType === "free" ? "free" : "subscription"}
              </span>
              <div className="flex items-center gap-1 text-sm text-white/60">
                <LuCalendarDays className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {formatDate(item.createdAt) || formatDate(item.releaseDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop row ── */}
      <div className="hidden md:contents">
        <span className="text-white/70 flex items-center justify-center">{index + 1}</span>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20"
            data-title={item.title}
          >
            <img
              src={getS3Url(item?.coverImage || item?.coverImageKey) || "/api/placeholder/40/40"}
              alt={item?.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          <span className="truncate lowercase text-white font-light max-w-[250px]">
            {item?.title}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <span
            className={`px-3 py-1 lowercase rounded-full text-xs font-medium ${item?.accessType === "purchase-only"
              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
              : item?.accessType === "free"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}
          >
            {item?.accessType === "purchase-only" ? "purchase-only" : item?.accessType === "free" ? "free" : "subscription"}
          </span>
        </div>

        <span className="text-right text-white/40 text-sm">
          {formatDate(item.createdAt || item.releaseDate)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 relative">
      <AlbumModal
        isOpen={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        album={selectedAlbum}
      />

      {/* ── Mobile header ── */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("albums")}
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === "albums"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-white/5 text-white/60"
              }`}
          >
            albums ({albums?.length})
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === "songs"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-white/5 text-white/60"
              }`}
          >
            songs ({songs?.length})
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === "drafts"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 text-white/60"
              }`}
          >
            drafts ({drafts?.length})
          </button>
        </div>

        <div className="flex items-center text-white gap-2">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 bg-white/5 rounded-lg border border-white/10"
          >
            <FiSearch className="text-lg" />
          </button>
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="p-2 bg-white/5 rounded-lg border border-white/10"
          >
            <IoFilterOutline className="text-lg" />
          </button>
        </div>
      </div>

      {/* Mobile search input */}
      {showMobileSearch && (
        <div className="mb-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-3 text-sm pl-12"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile filter dropdown */}
      {showMobileFilter && (
        <div className="mb-4 md:hidden">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#4DB3FF] border border-white/10 text-white rounded-lg px-4 py-3 text-sm pr-12 pl-12"
            >
              <option value="lastMonth">last Month</option>
              <option value="lastWeek">last Week</option>
              <option value="allTime">all Time</option>
            </select>
            <LuCalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          </div>
        </div>
      )}

      {/* ── Desktop header ── */}
      <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-gray-500/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("albums")}
            className={`pb-2 text-lg px-2 relative ${activeTab === "albums" ? "text-[#4DB3FF]" : "text-white/50"
              }`}
          >
            albums
            {activeTab === "albums" && (
              <div className="absolute -bottom-[19px] left-0 w-full h-0.5 rounded-lg bg-[#4DB3FF]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`pb-2 text-lg px-2 relative ${activeTab === "songs" ? "text-[#4DB3FF]" : "text-white/50"
              }`}
          >
            songs
            {activeTab === "songs" && (
              <div className="absolute -bottom-[19px] left-0 w-full h-0.5 rounded-lg bg-[#4DB3FF]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`pb-2 text-lg px-2 relative ${activeTab === "drafts" ? "text-[#4DB3FF]" : "text-white/50"
              }`}
          >
            drafts
            {activeTab === "drafts" && (
              <div className="absolute -bottom-[19px] left-0 w-full h-0.5 rounded-lg bg-[#4DB3FF]" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[280px] bg-[#020617] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm"
            />
            <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#3380FF] border border-white/10 text-white font-bold rounded-lg px-4 py-2 text-sm pr-12 pl-12 min-w-[160px]"
            >
              <option value="lastMonth">last Month</option>
              <option value="lastWeek">last Week</option>
              <option value="allTime">all Time</option>
            </select>
            <LuCalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-bold" />
          </div>
        </div>
      </div>

      {/* Desktop table header */}
      <div className="hidden md:block px-6 border-b border-gray-500/50 pb-4 mb-2">
        <div className="grid grid-cols-[60px_1fr_120px_140px] text-sm text-white/60 font-medium">
          <span>#</span>
          <span>Title</span>
          <span className="text-center">access Type</span>
          <span className="text-right">added On</span>
        </div>
      </div>

      {/* Content list */}
      <div className="space-y-2 md:space-y-0">
        {filtered.length > 0 && filtered.map(renderRow)}
        
        {activeTab === "drafts" && isMigrating && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={`skel-${i}`} className="grid grid-cols-1 md:grid-cols-[60px_1fr_120px_140px] items-center gap-4 py-4 md:py-3 px-6 hover:bg-white/5 transition-all border-b border-gray-500/20 last:border-b-0 animate-pulse">
                {/* ── Mobile row ── */}
                <div className="md:hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0 space-y-2 mt-2">
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-3 bg-white/10 rounded w-1/3"></div>
                      <div className="h-4 bg-white/10 rounded-full w-20 mt-1"></div>
                    </div>
                  </div>
                </div>

                {/* ── Desktop row ── */}
                <div className="hidden md:contents">
                  <div className="flex justify-center"><div className="w-4 h-4 bg-white/10 rounded"></div></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-6 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-16 h-4 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {filtered.length === 0 && !(activeTab === "drafts" && isMigrating) && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white/5 rounded-2xl border border-white/10">
              {search ? (
                <>
                  <FiSearch className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No results found for "{search}"</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 text-white/30 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-white/60">
                    No {activeTab === "songs" ? "songs" : "albums"} found
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsComponent;