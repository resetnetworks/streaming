// src/pages/user/GenrePage.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { setSelectedSong, play } from "../../features/playback/playerSlice";
import { hasArtistSubscriptionInPurchaseHistory } from "../../utills/subscriptions";
import { formatDuration } from "../../utills/helperFunctions";
import { useGenreSongs } from "../../hooks/api/useSongs";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import UserHeader from "../../components/user/UserHeader";
import SongList from "../../components/user/SongList";

// Genre display mapping
const genreAssets = {
  electronic: { label: "Electronic" },
  ambient: { label: "Ambient" },
  idm: { label: "IDM" },
  experimental: { label: "Experimental" },
  "avant-garde": { label: "Avant Garde" },
  noise: { label: "Noise" },
  downtempo: { label: "Downtempo" },
  soundtrack: { label: "Soundtrack" },
  industrial: { label: "Industrial" },
  ebm: { label: "EBM" },
  electro: { label: "Electro" },
  techno: { label: "Techno" },
  dance: { label: "Dance" },
  electronica: { label: "Electronica" },
  "sound-art": { label: "Sound Art" },
  jazz: { label: "Jazz" },
  classical: { label: "Classical" },
  "classical-crossover": { label: "Classical Crossover" },
  soundscapes: { label: "Soundscapes" },
  "field-recordings": { label: "Field Recordings" },
};

const toGenreKey = (v) =>
  (v || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/%20/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const GenrePage = () => {
  const { genre: rawParam } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const selectedSong = useSelector((s) => s.player.selectedSong);
  const isPlaying = useSelector((s) => s.player.isPlaying);

  // Share dropdown state
  const [activeShareDropdown, setActiveShareDropdown] = useState(null);

  // Format genre for display and API
  const { displayTitle, headerLabel } = useMemo(() => {
    let decoded = "";
    try {
      decoded = decodeURIComponent(rawParam || "");
    } catch {
      decoded = rawParam || "";
    }
    const key = toGenreKey(decoded);
    const fromStateTitle = location.state?.title;
    const titleCase = decoded
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const mapped = genreAssets[key];
    return {
      displayTitle: fromStateTitle || titleCase,
      headerLabel: fromStateTitle || mapped?.label || titleCase,
    };
  }, [location.state, rawParam]);

  // React Query infinite fetch
  const limit = 20;
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGenreSongs(displayTitle, limit);

  // Flatten songs from all pages
  const songs = data?.pages?.flatMap((page) => page.songs) || [];
  const lastPage = data?.pages?.[data.pages.length - 1];
  const totalSongs = lastPage?.pagination?.total || 0;

  // Infinite scroll trigger
  const { lastElementRef } = useInfiniteScroll({
    hasMore: hasNextPage,
    loading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  // Play handler with access control
  const handlePlay = useCallback(
    (song) => {
      const purchased = currentUser?.purchasedSongs?.includes(song._id);
      const subscribed = hasArtistSubscriptionInPurchaseHistory(
        currentUser,
        song.artist
      );

      // Check access
      if (song.accessType === "subscription" && !subscribed) {
        toast.error("Subscribe to this artist to play this song");
        return;
      }
      if (song.accessType === "purchase-only" && song.price > 0 && !purchased) {
        toast.error("Purchase this song to play it");
        return;
      }

      // Allowed to play
      dispatch(setSelectedSong(song));
      dispatch(play());
    },
    [currentUser, dispatch]
  );

  // Share dropdown handlers
  const handleShareToggle = (songId) => {
    setActiveShareDropdown((prev) => (prev === songId ? null : songId));
  };

  const handleShareClose = () => setActiveShareDropdown(null);

  // Loading skeletons
  if (isLoading && !songs.length) {
    return (
      <>
        <UserHeader />
        <div className="w-full px-4 py-4 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader />

      {/* Genre header */}
      <div className="w-full">
        <div className="relative w-full h-40 sm:h-52 md:h-64 lg:h-72 overflow-hidden bg-black flex items-center justify-center text-center">
          <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22)_0%,rgba(0,0,0,0.0)_55%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_2px,transparent_2px,transparent_8px)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#10153e8f] to-[#0E43CA]" />
          <div className="relative z-10 px-4">
            <h1 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
              {headerLabel}
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1">
              {totalSongs} tracks
            </p>
          </div>
        </div>
      </div>

      {/* Songs list */}
      <div className="w-full px-4 py-4">
        {songs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No tracks found in this genre.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-800 rounded-lg overflow-hidden border border-gray-800">
              {songs.map((song, index) => {
                const isLast = index === songs.length - 1;
                return (
                  <div
                    key={song._id}
                    ref={isLast ? lastElementRef : null}
                  >
                    <SongList
                      songId={song._id}
                      songSlug={song.slug}
                      img={song.coverImage || "/images/placeholder.png"}
                      songName={song.title}
                      singerName={song.singer || song.artist?.name}
                      seekTime={formatDuration(song.duration)}
                      onPlay={() => handlePlay(song)}
                     isSelected={selectedSong?._id === song._id}
                     isPlaying={selectedSong?._id === song._id && isPlaying}
                      shareUrl={`${window.location.origin}/song/${song.slug || song._id}`}
                      isShareDropdownOpen={activeShareDropdown === song._id}
                      onShareDropdownToggle={() => handleShareToggle(song._id)}
                      onShareMenuClose={handleShareClose}
                    />
                  </div>
                );
              })}
            </div>

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="w-full py-4 flex justify-center">
                <div className="w-40 h-8 bg-gray-800 rounded animate-pulse" />
              </div>
            )}

            {/* End message */}
            {!hasNextPage && songs.length > 0 && (
              <div className="text-center text-gray-500 py-8 text-sm">
                You've reached the end of the list
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default GenrePage;