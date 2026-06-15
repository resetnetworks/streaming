// src/pages/user/GenrePage.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { setSelectedSong, play } from "../../features/playback/playerSlice";
import { hasArtistSubscriptionInPurchaseHistory } from "../../utills/subscriptions";
import { useGenreSongs } from "../../hooks/api/useSongs";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PageSEO from "../../components/PageSeo/PageSEO";
import UserHeader from "../../components/user/UserHeader";
import SongList from "../../components/user/SongList";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";
// Genre display mapping
const genreAssets = {
  electronic: { label: "Electronic", image: "/images/genre1.jpg" },
  idm: { label: "IDM", image: "/images/genre2.jpg" },
  ambient: { label: "Ambient", image: "/images/genre3.jpg" },
  experimental: { label: "Experimental", image: "/images/genre4.jpg" },
  "avant-garde": { label: "Avant Garde", image: "/images/genre5.jpg" },
  noise: { label: "Noise", image: "/images/genre6.jpg" },
  downtempo: { label: "Downtempo", image: "/images/genre7.jpg" },
  soundtrack: { label: "Soundtrack", image: "/images/genre8.jpg" },
  industrial: { label: "Industrial", image: "/images/genre9.jpg" },
  ebm: { label: "EBM", image: "/images/genre10.jpg" },
  electro: { label: "Electro", image: "/images/genre11.jpg" },
  techno: { label: "Techno", image: "/images/genre12.jpg" },
  dance: { label: "Dance", image: "/images/genre13.jpg" },
  electronica: { label: "Electronica", image: "/images/genre14.jpg" },
  "sound-art": { label: "Sound Art", image: "/images/genre15.jpg" },
  jazz: { label: "Jazz", image: "/images/genre16.jpg" },
  classical: { label: "Classical", image: "/images/genre17.jpg" },
  "classical-crossover": { label: "Classical Crossover", image: "/images/genre18.jpg" },
  soundscapes: { label: "Soundscapes", image: "/images/genre19.jpg" },
  "field-recordings": { label: "Field Recordings", image: "/images/genre20.jpg" },
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
  const { resumePlayback } = usePlaybackControl();

  // Share dropdown state
  const [activeShareDropdown, setActiveShareDropdown] = useState(null);

  // Format genre for display and API
  const { displayTitle, headerLabel, genreImage } = useMemo(() => {
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
      genreImage: mapped?.image || "/images/placeholder.png",
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

      // Allowed to play
      dispatch(setSelectedSong(song));
      resumePlayback();
    },
    [currentUser, dispatch, resumePlayback]
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
      <PageSEO
        title={`Discover ${headerLabel} Music | Reset Music`}
        description={`Stream the best ${headerLabel} music tracks, songs, and albums on Reset Music Streaming.`}
        canonicalUrl={`https://musicreset.com/genre/${rawParam}`}
        ogUrl={`https://musicreset.com/genre/${rawParam}`}
        twitterImage={genreImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `Reset Music: ${headerLabel} Genre`,
          "description": `Discover and stream ${headerLabel} tracks on Reset Music.`,
          "url": `https://musicreset.com/genre/${rawParam}`,
          "image": genreImage,
        }}
        noIndex={false}
      />
      <UserHeader />

      {/* Genre header */}
      <div className="w-full">
        <div className="relative w-full h-[320px] overflow-hidden bg-black flex items-end justify-start text-left">
          {/* Genre Image Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${genreImage})` }}
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, black 100%)'
            }}
          />

          <div className="relative z-10 px-8 pb-10 w-full">
            <h1 className="text-white font-bold text-4xl sm:text-5xl md:text-6xl leading-tight drop-shadow-lg">
              {headerLabel}
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm border border-white/10">
                {totalSongs} tracks
              </span>
            </div>
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
                      seekTime={song.duration}
                      onPlay={() => handlePlay(song)}
                      isSelected={selectedSong?._id === song._id}
                      isPlaying={selectedSong?._id === song._id && isPlaying}
                      shareUrl={`${window.location.origin}/song/${song.slug || song._id}`}
                      currentUser={currentUser}
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