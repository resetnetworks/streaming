import React, { useEffect, useRef, useState, useCallback } from "react";
import { fetchAllSongs } from "../../features/songs/songSlice";
import PageSEO from "../../components/PageSeo/PageSEO";
import { useNavigate } from "react-router-dom";
import { setSelectedSong, play } from "../../features/playback/playerSlice";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import UserHeader from "../../components/user/UserHeader";
import SongList from "../../components/user/SongList";
import { formatDuration, getAvatarColor } from "../../utills/helperFunctions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useUserDashboard } from "../../hooks/api/useUserDashboard";
import { useSelector, useDispatch } from "react-redux";

const Purchases = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [page, setPage] = useState(1);
  const [librarySongs, setLibrarySongs] = useState([]);
  const recentScrollRef = useRef(null);
  const observerRef = useRef();

  const {
    purchases,
    subscriptions,
    isLoading: dashboardLoading,
  } = useUserDashboard();

  const purchasedAlbums = purchases?.albums || [];
  const purchasedSongs = purchases?.songs || [];
  const activeSubscriptions = subscriptions || [];

  const artistsScrollRef = useRef(null);
  const albumsScrollRef = useRef(null);

  const selectedSong = useSelector((state) => state.player.selectedSong);
  const allSongsStatus = useSelector((state) => state.songs.status);
  const totalPages = useSelector((state) => state.songs.totalPages);

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const lastSongRef = useCallback(
    (node) => {
      if (allSongsStatus === "loading") return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [allSongsStatus, page, totalPages]
  );

  const handleArtistsScroll = (direction = "right") => {
    if (!artistsScrollRef.current) return;
    artistsScrollRef.current.scrollBy({
      left: direction === "right" ? 200 : -200,
      behavior: "smooth",
    });
  };

  const handleAlbumsScroll = (direction = "right") => {
    if (!albumsScrollRef.current) return;
    albumsScrollRef.current.scrollBy({
      left: direction === "right" ? 200 : -200,
      behavior: "smooth",
    });
  };

  const ArtistAvatar = ({ artist }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    return (
      <div className="flex-shrink-0 cursor-pointer">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0"
          onClick={() => navigate(`/artist/${artist?.slug}`)}
        >
          <div className="w-full h-full relative rounded-full overflow-hidden border-2 border-blue-500 shadow-md bg-gray-700">
            {!imageError && artist?.profileImage ? (
              <>
                <img
                  src={artist?.profileImage}
                  alt={artist?.name || "Artist"}
                  className="w-full h-full object-cover absolute inset-0"
                  onLoad={() => setImageLoading(false)}
                  onError={() => { setImageLoading(false); setImageError(true); }}
                  style={{ display: imageLoading ? "none" : "block" }}
                />
                {imageLoading && (
                  <div className="w-full h-full bg-gray-600 animate-pulse absolute inset-0" />
                )}
              </>
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-xl ${getAvatarColor(artist?.name)} absolute inset-0`}>
                {artist?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 w-20 sm:w-24">
          <p
            className="text-xs sm:text-sm text-center text-white leading-tight"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}
            title={artist?.name || "Unknown Artist"}
          >
            {artist?.name || "Unknown Artist"}
          </p>
        </div>
      </div>
    );
  };

  const AlbumCard = ({ album }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div
        onClick={() => navigate(`/album/${album.slug || album._id}`)}
        className="flex-shrink-0 cursor-pointer"
      >
        <div className="w-36 h-36 sm:w-40 sm:h-40 relative rounded-xl overflow-hidden border-2 border-blue-500 shadow-md bg-gray-700">
          {!imageError && album?.coverImage ? (
            <img
              src={album?.coverImage}
              alt={album?.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl ${getAvatarColor(album.title)}`}>
              {album.title?.charAt(0).toUpperCase() || "A"}
            </div>
          )}
        </div>
        <div className="mt-2 w-36 sm:w-40">
          <p className="text-sm font-medium text-white leading-tight mb-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }} title={album.title}>
            {album.title}
          </p>
          <p className="text-xs text-gray-400 leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }} title={album.artist?.name || "Various Artists"}>
            {album.artist?.name || "Various Artists"}
          </p>
        </div>
      </div>
    );
  };

  // ✅ Auth check - Purchases component ke andar, return ke pehle
  if (!isAuthenticated) {
    return (
      <>
        <UserHeader />
        <div className="text-white flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">View your purchases</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Sign in to access tracks, albums, and subscriptions you've purchased.
            </p>
          </div>
          <button
  onClick={() => navigate("/login")}
  className="mt-2 px-6 py-2 border border-gray-600 hover:border-white text-white text-sm font-medium rounded-full transition-colors cursor-pointer bg-transparent"
>
  Sign in
</button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title="Reset Music Streaming purchased Songs and Subscriptions"
        description="Explore your purchased songs and active artist subscriptions on Reset Music Streaming platform."
        canonicalUrl="https://musicreset.com/purchases"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Reset Music purchased Songs and Subscriptions",
          "description": "Explore your purchased songs and active artist subscriptions on Reset Music Streaming platform.",
          "url": "https://musicreset.com/purchases",
        }}
        noIndex={true}
      />
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-6">

          {/* Active Subscriptions */}
          <div>
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="md:text-xl text-lg font-semibold">Active Subscriptions</h2>
              {activeSubscriptions.length > 0 && (
                <div className="hidden md:flex items-center gap-2">
                  <button type="button" className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors" onClick={() => handleArtistsScroll("left")}>
                    <LuSquareChevronLeft />
                  </button>
                  <button type="button" className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors" onClick={() => handleArtistsScroll("right")}>
                    <LuSquareChevronRight />
                  </button>
                </div>
              )}
            </div>

            {dashboardLoading ? (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="flex-shrink-0 text-center">
                    <Skeleton width={80} height={80} circle />
                    <Skeleton width={60} height={12} className="mt-2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : activeSubscriptions.length > 0 ? (
              <div ref={artistsScrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
                {activeSubscriptions.map((sub) => (
                  <ArtistAvatar key={sub._id} artist={sub?.artist} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">You're not subscribed to any artists.</p>
            )}
          </div>

          {/* Purchased Albums */}
          <div>
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="md:text-xl text-lg font-semibold">Purchased Albums</h2>
              {purchasedAlbums.length > 0 && (
                <div className="hidden md:flex items-center gap-2">
                  <button type="button" className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors" onClick={() => handleAlbumsScroll("left")}>
                    <LuSquareChevronLeft />
                  </button>
                  <button type="button" className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors" onClick={() => handleAlbumsScroll("right")}>
                    <LuSquareChevronRight />
                  </button>
                </div>
              )}
            </div>

            {dashboardLoading ? (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <Skeleton height={144} width={144} className="rounded-xl" />
                    <Skeleton width={100} height={12} className="mt-2" />
                    <Skeleton width={80} height={10} className="mt-1" />
                  </div>
                ))}
              </div>
            ) : purchasedAlbums.length > 0 ? (
              <div ref={albumsScrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
                {purchasedAlbums.map((album) => (
                  <AlbumCard key={album._id} album={album} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No albums purchased yet.</p>
            )}
          </div>

          {/* Purchased Songs */}
          <div>
            <h2 className="md:text-xl text-lg font-semibold mt-6 mb-4">Purchased Songs</h2>
            {dashboardLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Skeleton height={50} width={50} circle />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} />
                      <Skeleton width={80} height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchasedSongs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {purchasedSongs.map((song) => (
                  <SongList
                    key={song._id}
                    songId={song._id}
                    img={song?.coverImage || "/images/placeholder.png"}
                    songName={song.title}
                    singerName={song.artist?.name || "Unknown Artist"}
                    seekTime={formatDuration(song.duration || 0)}
                    onPlay={() => handlePlaySong(song)}
                    isSelected={selectedSong?._id === song._id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No songs purchased yet.</p>
            )}
          </div>
        </div>
      </SkeletonTheme>
    </>
  );
};

export default Purchases;