import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import CardStat from './CardStat';
import ArtistMap from './Map';
import ArtistTimeseriesChart from './ArtistTimeseriesChart';
import ArtistSubscriptionFunnel from './ArtistSubscriptionFunnel';
import { useArtistDashboardAnalytics } from '../../../hooks/api/useArtistAnalytics';
import { useDashboardSingles, useDashboardAlbums } from '../../../hooks/api/useArtists';
import { useArtistBalance } from '../../../hooks/api/useArtistRevenue';
import { useQueries, useQuery } from '@tanstack/react-query';
import { albumApi } from '../../../api/albumApi';
import { formatCompactNumber, formatDollarAmount } from '../../../utills/analytics/formatters';

const HomeComponent = ({ workspace = null, artistId = null, onNavigateToUploads = null, onNavigateToTab = null }) => {
  const [range, setRange] = useState("30d");
  const authUser = useSelector((state) => state.auth?.user);
  const resolvedArtistId = artistId || workspace?.artistId || authUser?.artistId || null;

  const handleShowAll = (subTab) => {
    if (onNavigateToUploads) {
      onNavigateToUploads(subTab);
    } else {
      localStorage.setItem("uploadsActiveTab", subTab);
      localStorage.setItem("dashboardSelectedTab", "uploads");
      window.dispatchEvent(
        new CustomEvent("navigate-tab", { detail: { tab: "uploads", subTab } })
      );
    }
  };

  const handleNavigateToRevenue = () => {
    if (onNavigateToTab) {
      onNavigateToTab("revenue");
    } else {
      localStorage.setItem("dashboardSelectedTab", "revenue");
      window.dispatchEvent(
        new CustomEvent("navigate-tab", { detail: { tab: "revenue" } })
      );
    }
  };

  // 1. Live analytics data (overview, timeseries, top songs)
  const {
    overview,
    timeseries,
    topSongs,
    funnel,
    isLoading,
  } = useArtistDashboardAnalytics({
    range,
    artistId: resolvedArtistId,
  });

  // 2. Live uploaded albums and singles by this artist
  const { data: singlesData } = useDashboardSingles(10);
  const { data: albumsData } = useDashboardAlbums(10);

  const singles = singlesData?.pages?.flatMap((page) => page.songs) || [];
  const albums = albumsData?.pages?.flatMap((page) => page.albums) || [];

  // 3. Parallel query to fetch album track details for accurate album stream aggregation
  const albumDetailsQueries = useQueries({
    queries: albums.map((album) => ({
      queryKey: ['album', album._id],
      queryFn: () => albumApi.fetchById(album._id),
      enabled: !!album?._id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  // 4. Payout balance stats from shared Revenue cache (available balance, total earned, currency)
  const balanceQuery = useArtistBalance();
  const balanceData = balanceQuery.data?.balance || null;

  // Comprehensive song artwork map from singles and albums
  const songCoverMap = useMemo(() => {
    const map = new Map();

    // From singles
    if (Array.isArray(singles)) {
      singles.forEach((s) => {
        const id = String(s._id || s.id || "");
        const cover = s.coverImage || s.coverImageKey;
        if (id && cover) map.set(id, cover);
        if (s.title && cover) map.set(s.title.toLowerCase().trim(), cover);
      });
    }

    // From albums & their detailed tracks
    if (Array.isArray(albums)) {
      albums.forEach((album, idx) => {
        const detailedAlbum = albumDetailsQueries[idx]?.data || album;
        const albumCover = detailedAlbum.coverImage || detailedAlbum.coverImageKey;
        const albumSongs = detailedAlbum.songs || [];
        if (Array.isArray(albumSongs)) {
          albumSongs.forEach((s) => {
            const id = String(s._id || s.id || "");
            const cover = s.coverImage || s.coverImageKey || albumCover;
            if (id && cover) map.set(id, cover);
            if (s.title && cover) map.set(s.title.toLowerCase().trim(), cover);
          });
        }
      });
    }

    return map;
  }, [singles, albums, albumDetailsQueries]);

  // Enrich singles with live stream analytics
  const enrichedSingles = useMemo(() => {
    if (!Array.isArray(singles)) return [];
    const playsMap = new Map();
    if (Array.isArray(topSongs)) {
      topSongs.forEach((ts) => {
        const id = String(ts.songId || ts._id || ts.id || "");
        if (id) playsMap.set(id, ts.plays || 0);
        if (ts.title) playsMap.set(ts.title.toLowerCase().trim(), ts.plays || 0);
      });
    }

    return singles.map((song) => {
      const id = String(song._id || song.songId || song.id || "");
      const matchedPlays = playsMap.get(id) ?? (song.title ? playsMap.get(song.title.toLowerCase().trim()) : undefined);
      const plays = typeof song.plays === "number" ? song.plays : (matchedPlays ?? song.views ?? 0);
      return { ...song, plays };
    });
  }, [singles, topSongs]);

  const totalAlbumViews = overview?.traffic?.albumViews ?? 0;

  // Enrich albums with track counts and views (albums track impressions/views, not stream volume)
  const enrichedAlbums = useMemo(() => {
    if (!Array.isArray(albums)) return [];

    return albums
      .map((album, idx) => {
        const detailedAlbum = albumDetailsQueries[idx]?.data;
        const albumSongs = detailedAlbum?.songs || album.songs || [];

        let albumViews = typeof album.views === "number" ? album.views : 0;
        if (!albumViews && typeof detailedAlbum?.views === "number") {
          albumViews = detailedAlbum.views;
        }
        if (!albumViews && totalAlbumViews > 0) {
          albumViews = totalAlbumViews;
        }

        return {
          ...album,
          songs: albumSongs,
          songCount: albumSongs.length || album.songCount || 0,
          views: albumViews,
        };
      })
      .sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [albums, albumDetailsQueries, totalAlbumViews]);

  // Format top songs for the ranked list with resolved real CDN covers
  const formattedTopSongs = useMemo(() => {
    if (!Array.isArray(topSongs)) return [];
    return topSongs.map((s) => {
      const id = String(s.songId || s._id || "");
      const titleKey = s.title?.toLowerCase()?.trim();
      const resolvedCover =
        songCoverMap.get(id) ||
        (titleKey ? songCoverMap.get(titleKey) : null) ||
        s.artwork ||
        s.coverImage;

      return {
        _id: id,
        title: s.title,
        coverImage: resolvedCover,
        genre: s.completionRate !== undefined ? `${s.completionRate}% completion` : undefined,
        plays: s.plays,
        duration: s.duration,
      };
    });
  }, [topSongs, songCoverMap]);

  const playback = overview?.playback;
  const traffic = overview?.traffic;
  const audience = overview?.audience;

  const totalViews = traffic ? (traffic.profileViews || 0) + (traffic.songViews || 0) + (traffic.albumViews || 0) : 0;

  return (
    <>
      {/* Entire Dashboard */}
      <div className='p-6 relative min-h-[500px] animate-dashboard-fade-in'>
        {/* Date Range Selector Pills placed directly on the Left (No title, no "Range:", no date string) */}
        <div className='flex items-center mb-3.5 px-1'>
          <div
            className='flex items-center gap-1 p-1 rounded-[8px]'
            style={{
              background: "#060911",
              border: "1px solid rgba(0, 0, 0, 0.95)",
              boxShadow:
                "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {['7d', '30d', '90d'].map((r) => {
              const isActive = range === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`relative px-3 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRangePill"
                      className="absolute inset-0 bg-[#0459FE] rounded-[6px] shadow-sm shadow-[#0459FE]/40"
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
        </div>

        {/* SECTION 1: Performance Overview Cards (Connected to live backend & financial ledger) */}
        <div className="w-full mb-3.5 relative z-20 overflow-visible">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5 w-full overflow-visible">
            <CardStat
              label="Streams"
              value={formatCompactNumber(playback?.totalPlays ?? 0)}
              tooltip="Total times your tracks started playing across the entire platform."
            />
            <CardStat
              label="Qualified Plays"
              value={formatCompactNumber(playback?.qualifiedPlays ?? 0)}
              tooltip="Plays where listeners streamed for at least 30 seconds."
            />
            <CardStat
              label="Listeners"
              value={formatCompactNumber(playback?.uniqueListeners ?? (playback?.qualifiedPlays ?? (playback?.totalPlays ?? 0)))}
              tooltip="Distinct individual listeners who tuned in to your tracks."
            />
            <CardStat
              label="Views"
              value={formatCompactNumber(totalViews)}
              tooltip="Total page impressions on your artist profile, album pages, and individual tracks."
            />
            <CardStat
              label="Followers"
              value={`+${formatCompactNumber(audience?.newFollowers ?? 0)}`}
              tooltip="New followers gained during this selected time window."
            />
            <CardStat
              label="Total Earned"
              value={balanceQuery.isLoading ? "..." : formatDollarAmount(balanceData?.totalEarned || 0, balanceData?.currency)}
              tooltip="Total lifetime earnings recorded from subscriptions and digital purchases."
              onClick={handleNavigateToRevenue}
            />
            <CardStat
              label="Available Balance"
              value={balanceQuery.isLoading ? "..." : formatDollarAmount(balanceData?.availableBalance || 0, balanceData?.currency)}
              tooltip="Available balance ready for withdrawal or payout transfer."
              onClick={handleNavigateToRevenue}
            />
          </div>
        </div>

        {/* SECTION 2: Stream Activity (Full Width - Top Countries/Regions map commented out until location data is integrated) */}
        <div className="w-full my-4">
          {/* <ArtistMap listeners={overview?.geographic?.listeners || []} /> */}
          <ArtistTimeseriesChart timeseries={timeseries} range={range} isLoading={isLoading} />
        </div>

        {/* SECTION 4: Subscription Intelligence & Conversion Funnel */}
        <ArtistSubscriptionFunnel
          overview={overview}
          balanceData={balanceData}
          funnel={funnel}
          range={range}
        />
        
        <style>{`
          @keyframes dashboardFadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-dashboard-fade-in {
            animation: dashboardFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        `}</style>
      </div>
    </>
  );
};

export default HomeComponent;
