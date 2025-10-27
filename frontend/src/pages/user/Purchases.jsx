import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../../features/songs/songSlice";
import PageSEO from "../../components/PageSeo/PageSEO";
import {
  fetchUserSubscriptions,
  fetchUserPurchases,
} from "../../features/payments/userPaymentSlice";
import { useNavigate } from "react-router-dom";
import { setSelectedSong, play } from "../../features/playback/playerSlice";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import UserHeader from "../../components/user/UserHeader";
import SongList from "../../components/user/SongList";
import { formatDuration, getAvatarColor } from "../../utills/helperFunctions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Purchases = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [librarySongs, setLibrarySongs] = useState([]);
  const recentScrollRef = useRef(null);
  const observerRef = useRef();
  
  // ✅ Added scroll refs for artists and albums
  const artistsScrollRef = useRef(null);
  const albumsScrollRef = useRef(null);

  const selectedSong = useSelector((state) => state.player.selectedSong);
  const allSongsStatus = useSelector((state) => state.songs.status);
  const totalPages = useSelector((state) => state.songs.totalPages);

  const subscriptions = useSelector((state) => state.userDashboard.subscriptions);
  const purchases = useSelector((state) => state.userDashboard.purchases);
  const dashboardLoading = useSelector((state) => state.userDashboard.loading);

  useEffect(() => {
    dispatch(fetchUserSubscriptions());
    dispatch(fetchUserPurchases());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllSongs({ type: "library", page, limit: 20 })).then((res) => {
      if (res.payload?.songs) {
        setLibrarySongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }, [dispatch, page]);

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
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

  // ✅ Scroll handler functions for both sections
  const handleArtistsScroll = (direction = "right") => {
    if (!artistsScrollRef.current) return;
    const scrollAmount = 200;
    artistsScrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const handleAlbumsScroll = (direction = "right") => {
    if (!albumsScrollRef.current) return;
    const scrollAmount = 200;
    albumsScrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  // ✅ Artist Avatar Component with responsive text truncation
  const ArtistAvatar = ({ artist }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    const getFirstLetter = (name) => {
      return name ? name.charAt(0).toUpperCase() : "A";
    };

    return (
      <div className="flex-shrink-0 cursor-pointer">
        {/* ✅ Artist Avatar Container */}
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0"
          onClick={() => navigate(`/artist/${artist?.slug}`)}
        >
          {/* ✅ Fixed circular container with proper aspect ratio */}
          <div className="w-full h-full relative rounded-full overflow-hidden border-2 border-blue-500 shadow-md bg-gray-700">
            {!imageError && artist?.image ? (
              <>
                <img
                  src={artist.image}
                  alt={artist?.name || "Artist"}
                  className="w-full h-full object-cover absolute inset-0"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
                {imageLoading && (
                  <div className="w-full h-full bg-gray-600 animate-pulse absolute inset-0" />
                )}
              </>
            ) : (
              /* ✅ First letter fallback with gradient background */
              <div className={`w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-xl ${getAvatarColor(artist?.name)} absolute inset-0`}>
                {getFirstLetter(artist?.name)}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Artist name with responsive truncation */}
        <div className="mt-2 w-20 sm:w-24">
          <p 
            className="text-xs sm:text-sm text-center text-white leading-tight"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
            title={artist?.name || "Unknown Artist"} // ✅ Tooltip for full name
          >
            {artist?.name || "Unknown Artist"}
          </p>
        </div>
      </div>
    );
  };

  // ✅ Album Card Component with responsive text
  const AlbumCard = ({ album }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div
        onClick={() => navigate(`/album/${album.slug || album._id}`)}
        className="flex-shrink-0 cursor-pointer"
      >
        {/* ✅ Album Cover */}
        <div className="w-36 h-36 sm:w-40 sm:h-40 relative rounded-xl overflow-hidden border-2 border-blue-500 shadow-md bg-gray-700">
          {!imageError && album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl ${getAvatarColor(album.title)}`}>
              {album.title ? album.title.charAt(0).toUpperCase() : "A"}
            </div>
          )}
        </div>

        {/* ✅ Album Info with responsive text truncation */}
        <div className="mt-2 w-36 sm:w-40">
          <p 
            className="text-sm font-medium text-white leading-tight mb-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word'
            }}
            title={album.title} // ✅ Tooltip for full title
          >
            {album.title}
          </p>
          <p 
            className="text-xs text-gray-400 leading-tight"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word'
            }}
            title={album.artist?.name || "Various Artists"} // ✅ Tooltip for full artist name
          >
            {album.artist?.name || "Various Artists"}
          </p>
        </div>
      </div>
    );
  };

  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < librarySongs.length; i += chunkSize) {
    songColumns.push(librarySongs.slice(i, i + chunkSize));
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

          {/* ✅ Subscribed Artists - Added scroll buttons */}
          <div>
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="md:text-xl text-lg font-semibold">
                Active Subscriptions
              </h2>
              
              {/* ✅ Scroll buttons for artists (desktop only) */}
              {subscriptions.length > 0 && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
                    onClick={() => handleArtistsScroll("left")}
                    aria-label="Scroll artists left"
                    title="Previous"
                  >
                    <LuSquareChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
                    onClick={() => handleArtistsScroll("right")}
                    aria-label="Scroll artists right"
                    title="Next"
                  >
                    <LuSquareChevronRight />
                  </button>
                </div>
              )}
            </div>

            {dashboardLoading ? (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
                {[...Array(5)].map((_, idx) => (
                  <div key={`artist-skeleton-${idx}`} className="flex-shrink-0 text-center">
                    <Skeleton width={80} height={80} circle className="sm:w-24 sm:h-24" />
                    <Skeleton width={60} height={12} className="mt-2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : subscriptions.length > 0 ? (
              <div 
                ref={artistsScrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2"
              >
                {subscriptions.map((sub) => (
                  <ArtistAvatar 
                    key={sub._id} 
                    artist={sub.artist}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                You're not subscribed to any artists.
              </p>
            )}
          </div>

          {/* ✅ Purchased Albums - Added scroll buttons */}
          <div>
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="md:text-xl text-lg font-semibold">
                Purchased Albums
              </h2>
              
              {/* ✅ Scroll buttons for albums (desktop only) */}
              {purchases.albums?.length > 0 && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
                    onClick={() => handleAlbumsScroll("left")}
                    aria-label="Scroll albums left"
                    title="Previous"
                  >
                    <LuSquareChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
                    onClick={() => handleAlbumsScroll("right")}
                    aria-label="Scroll albums right"
                    title="Next"
                  >
                    <LuSquareChevronRight />
                  </button>
                </div>
              )}
            </div>

            {dashboardLoading ? (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
                {[...Array(5)].map((_, idx) => (
                  <div key={`album-skel-${idx}`} className="flex-shrink-0">
                    <Skeleton height={144} width={144} className="rounded-xl sm:h-40 sm:w-40" />
                    <Skeleton width={100} height={12} className="mt-2" />
                    <Skeleton width={80} height={10} className="mt-1" />
                  </div>
                ))}
              </div>
            ) : purchases.albums?.length > 0 ? (
              <div 
                ref={albumsScrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2"
              >
                {purchases.albums.map((album) => (
                  <AlbumCard key={album._id} album={album} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No albums purchased yet.</p>
            )}
          </div>

          {/* ✅ Purchased Songs */}
          <div>
            <h2 className="md:text-xl text-lg font-semibold mt-6 mb-4">
              Purchased Songs
            </h2>
            {dashboardLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={`song-skel-${idx}`} className="flex items-center gap-4">
                    <Skeleton height={50} width={50} circle />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} />
                      <Skeleton width={80} height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchases.songs?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {purchases.songs.map((song) => (
                  <SongList
                    key={song._id}
                    songId={song._id}
                    img={song.coverUrl || "/images/placeholder.png"}
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
