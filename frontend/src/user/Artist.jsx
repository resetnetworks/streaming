import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";
import RecentPlays from "../components/user/RecentPlays";
import { FiMapPin } from "react-icons/fi";
import { LuSquareChevronRight } from "react-icons/lu";
import { fetchArtistById } from "../features/artists/artistsSlice";
import { selectSelectedArtist } from "../features/artists/artistsSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";
import { getAlbumsByArtist } from "../features/albums/albumsSlice";
import ArtistAboutSection from "../components/user/ArtistAboutSection";
import {
  selectArtistAlbums,
  selectArtistAlbumPagination,
  selectArtistInfo,
} from "../features/albums/albumsSelector";
import { fetchSongsByArtist } from "../features/songs/songSlice";
import { selectSongsByArtist } from "../features/songs/songSelectors";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import StripePayment from "../components/payments/StripePayment";
import { toast } from "sonner";

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const recentScrollRef = useRef(null);
  const singlesScrollRef = useRef(null);
  const navigate = useNavigate();

  // Selectors with proper memoization
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artist = useSelector(selectSelectedArtist);
  const artistAlbums = useSelector(selectArtistAlbums);
  const artistAlbumPagination = useSelector(selectArtistAlbumPagination);
  const artistInfo = useSelector(selectArtistInfo);
  const artistSongsData = useSelector(
    (state) => selectSongsByArtist(state, artistId),
    shallowEqual
  );

  // Local state for subscription and payment
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Destructure with default values
  const {
    songs: artistSongs = [],
    pages: totalPages = 1,
    status: songsStatus = "idle",
  } = artistSongsData || {};

  // Local state
  const [songsPage, setSongsPage] = useState(1);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [albumsStatus, setAlbumsStatus] = useState("idle");
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);

  // Refs
  const songsObserverRef = useRef();
  const albumsObserverRef = useRef();

  // Generate color from artist name
  const getArtistColor = (name) => {
    if (!name) return "bg-blue-600";
    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-red-600",
      "bg-orange-600",
      "bg-yellow-600",
      "bg-green-600",
      "bg-teal-600",
      "bg-indigo-600",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  // Initial data fetch
  useEffect(() => {
    if (artistId) {
      dispatch(fetchArtistById(artistId));
      fetchAlbums(1); // Initial fetch for first page
      dispatch(fetchSongsByArtist({ artistId, page: 1, limit: 10 }));

      // Check subscription status (mock implementation)
      const subscribedArtists =
        JSON.parse(localStorage.getItem("subscribedArtists")) || [];
      setIsSubscribed(subscribedArtists.includes(artistId));
    }
  }, [dispatch, artistId]);

  // Fetch albums function
  const fetchAlbums = async (page) => {
    if (albumsStatus === "loading") return;

    setAlbumsStatus("loading");
    try {
      await dispatch(
        getAlbumsByArtist({
          artistId,
          page,
          limit: 10,
        })
      ).unwrap();

      if (page >= artistAlbumPagination.totalPages) {
        setHasMoreAlbums(false);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setAlbumsStatus("idle");
    }
  };

  // Load more albums when page changes
  useEffect(() => {
    if (albumsPage > 1 && hasMoreAlbums) {
      fetchAlbums(albumsPage);
    }
  }, [albumsPage]);

  // Pagination for songs
  useEffect(() => {
    if (artistId && songsPage > 1) {
      dispatch(fetchSongsByArtist({ artistId, page: songsPage, limit: 10 }));
    }
  }, [dispatch, artistId, songsPage]);

  // Handlers
  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  const handleScroll = (ref) => {
    ref?.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // Subscription handler
 const handleSubscribe = async () => {
  if (isSubscribed) {
    const confirmUnsub = window.confirm(
      `Are you sure you want to unsubscribe from ${artist?.name}?`
    );
    if (!confirmUnsub) return;

    setSubscriptionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const subscribedArtists = JSON.parse(
        localStorage.getItem("subscribedArtists") || []
      );
      const updated = subscribedArtists.filter((id) => id !== artistId);
      localStorage.setItem("subscribedArtists", JSON.stringify(updated));
      setIsSubscribed(false);
      toast.success(`Unsubscribed from ${artist?.name}`);
    } catch (error) {
      toast.error("Failed to unsubscribe");
      console.error("Unsubscription error:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  } else {
    // No confirmation for subscribing, just open the payment modal
    setShowPaymentModal(true);
  }
};


  // Intersection observers
  const songsLastRef = useCallback(
    (node) => {
      if (songsStatus === "loading") return;

      if (songsObserverRef.current) {
        songsObserverRef.current.disconnect();
      }

      songsObserverRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && songsPage < totalPages) {
          setSongsPage((prev) => prev + 1);
        }
      });

      if (node) songsObserverRef.current.observe(node);
    },
    [songsStatus, songsPage, totalPages]
  );

  const albumsLastRef = useCallback(
    (node) => {
      if (albumsStatus === "loading" || !hasMoreAlbums) return;

      if (albumsObserverRef.current) {
        albumsObserverRef.current.disconnect();
      }

      albumsObserverRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreAlbums) {
          setAlbumsPage((prev) => prev + 1);
        }
      });

      if (node) albumsObserverRef.current.observe(node);
    },
    [albumsStatus, hasMoreAlbums]
  );

  // Derived values
  const songListView = showAllSongs ? artistSongs : artistSongs.slice(0, 5);
  const subscriptionPrice = artist?.subscriptionPrice || 4.99;
  const artistColor = getArtistColor(artist?.name);

  // Render artist image or fallback
  const renderArtistImage = (imageUrl, name, size = "w-20 h-20") => {
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={name || "Artist"}
          className={`${size} rounded-full object-cover border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]`}
        />
      );
    }

    return (
      <div
        className={`${size} ${artistColor} rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]`}
      >
        {name ? name.charAt(0).toUpperCase() : "A"}
      </div>
    );
  };

  // Render cover image or fallback
  const renderCoverImage = (imageUrl, title, size = "w-full h-full") => {
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={title || "Cover"}
          className={`${size} object-cover`}
        />
      );
    }

    return (
      <div
        className={`${size} ${artistColor} flex items-center justify-center text-white font-bold text-2xl`}
      >
        {title ? title.charAt(0).toUpperCase() : "C"}
      </div>
    );
  };

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        {/* Hero Section */}
        <div className="relative h-80 w-full">
          {artist ? (
            <>
              {artist.image ? (
                <img
                  src={artist.image}
                  className="w-full h-full object-cover opacity-80"
                  alt="Artist Background"
                />
              ) : (
                <div className={`w-full h-full ${artistColor} opacity-80`} />
              )}
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
              <div className="absolute bottom-8 left-8 z-30 flex items-center gap-6 text-white">
                {renderArtistImage(artist?.image, artist?.name)}
                <div>
                  <p className="text-sm lowercase tracking-widest text-gray-200">
                    Artist
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-1">
                    {artist?.name || "Unknown Artist"}
                  </h1>
                  <div className="flex items-center mt-1 text-gray-300 text-sm">
                    <FiMapPin className="mr-2 text-blue-600" />
                    <span>{artist?.location || "Unknown City"}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-lg font-semibold text-blue-400">
                      ₹{subscriptionPrice.toFixed(2)}/month
                    </span>
                    <button
                      onClick={handleSubscribe}
                      disabled={subscriptionLoading}
                      className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                        isSubscribed
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } ${
                        subscriptionLoading
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {subscriptionLoading
                        ? "Processing..."
                        : isSubscribed
                        ? "Subscribed ✓"
                        : "Subscribe"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Skeleton width={200} height={40} />
            </div>
          )}
        </div>

        {/* All Songs (vertical list) */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white">
          <h2>All Songs</h2>
          {artistSongs.length > 5 && (
            <button
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => setShowAllSongs(!showAllSongs)}
            >
              {showAllSongs ? "Show less" : "See all"}
            </button>
          )}
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          {songsStatus === "loading" && artistSongs.length === 0 ? (
            [...Array(5)].map((_, idx) => (
              <div
                key={`song-skeleton-${idx}`}
                className="flex items-center gap-4"
              >
                <Skeleton circle width={50} height={50} />
                <div className="flex-1">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
                <Skeleton width={40} height={16} />
              </div>
            ))
          ) : (
            <>
              {songListView.map((song) => (
                <SongList
                  key={song._id}
                  songId={song._id}
                  img={
                    song.coverImage
                      ? song.coverImage
                      : renderCoverImage(null, song.title, "w-12 h-12")
                  }
                  songName={song.title}
                  singerName={song.singer}
                  seekTime={formatDuration(song.duration)}
                  onPlay={() => handlePlaySong(song._id)}
                  isSelected={selectedSong === song._id}
                />
              ))}
              {songsStatus === "loading" &&
                songsPage < totalPages &&
                [...Array(5)].map((_, idx) => (
                  <div
                    key={`song-loading-${idx}`}
                    className="flex items-center gap-4"
                  >
                    <Skeleton circle width={50} height={50} />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} />
                      <Skeleton width={80} height={12} />
                    </div>
                    <Skeleton width={40} height={16} />
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Albums Carousel */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
          <h2>Albums</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Page {artistAlbumPagination.page} of{" "}
              {artistAlbumPagination.totalPages}
            </span>
            <LuSquareChevronRight
              className="text-white cursor-pointer hover:text-blue-800 text-2xl"
              onClick={() => handleScroll(recentScrollRef)}
            />
          </div>
        </div>
        <div
          ref={recentScrollRef}
          className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
        >
          {albumsStatus === "loading" && artistAlbums.length === 0 ? (
            [...Array(5)].map((_, idx) => (
              <div key={`album-skeleton-${idx}`} className="min-w-[160px]">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={120} height={16} className="mt-2" />
              </div>
            ))
          ) : artistAlbums.length > 0 ? (
            <>
              {artistAlbums.map((album, idx) => (
                <div
                  key={album._id}
                  onClick={() => navigate(`/album/${album._id}`)}
                  className="cursor-pointer min-w-[160px]"
                >
                  <RecentPlays
                    ref={idx === artistAlbums.length - 1 ? albumsLastRef : null}
                    title={album.title}
                    singer={artistInfo?.name || artist?.name}
                    image={
                      album.coverImage
                        ? album.coverImage
                        : renderCoverImage(null, album.title, "w-full h-40")
                    }
                    price={album.price}
                    isSelected={false}
                  />
                </div>
              ))}
              {albumsStatus === "loading" &&
                hasMoreAlbums &&
                [...Array(2)].map((_, idx) => (
                  <div key={`album-loading-${idx}`} className="min-w-[160px]">
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={120} height={16} className="mt-2" />
                  </div>
                ))}
            </>
          ) : (
            <p className="text-white text-sm">No albums found.</p>
          )}
        </div>

        {/* Singles Carousel */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
          <h2>Singles</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800 text-2xl"
            onClick={() => handleScroll(singlesScrollRef)}
          />
        </div>
        <div
          ref={singlesScrollRef}
          className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
        >
          {songsStatus === "loading" && artistSongs.length === 0
            ? [...Array(5)].map((_, idx) => (
                <div key={`single-skeleton-${idx}`} className="min-w-[160px]">
                  <Skeleton height={160} width={160} className="rounded-xl" />
                  <Skeleton width={120} height={16} className="mt-2" />
                </div>
              ))
            : artistSongs.map((song, idx) => (
                <RecentPlays
                  ref={idx === artistSongs.length - 1 ? songsLastRef : null}
                  key={song._id}
                  title={song.title}
                  singer={song.singer}
                  image={
                    song.coverImage
                      ? song.coverImage
                      : renderCoverImage(null, song.title, "w-full h-40")
                  }
                  onPlay={() => handlePlaySong(song._id)}
                  isSelected={selectedSong === song._id}
                />
              ))}
        </div>

        {/* About Section */}
        <ArtistAboutSection
          artist={artist}
          isSubscribed={isSubscribed}
          subscriptionLoading={subscriptionLoading}
          subscriptionPrice={subscriptionPrice}
          handleSubscribe={handleSubscribe}
          getArtistColor={getArtistColor}
        />

        {/* Stripe Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Subscribe to {artist?.name}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <StripePayment
                type="artist"
                id={artist?._id}
                amount={subscriptionPrice}
                onSuccess={() => {
                  // Handle successful subscription
                  setIsSubscribed(true);
                  setShowPaymentModal(false);
                  toast.success(`Successfully subscribed to ${artist?.name}!`);

                  // Update local storage
                  let subscribedArtists = [];
                  try {
                    const raw = localStorage.getItem("subscribedArtists");
                    subscribedArtists = raw ? JSON.parse(raw) : [];
                  } catch (err) {
                    console.error("Failed to parse subscribedArtists:", err);
                    subscribedArtists = [];
                  }

                  subscribedArtists.push(artistId);
                  localStorage.setItem(
                    "subscribedArtists",
                    JSON.stringify(subscribedArtists)
                  );
                }}
                onClose={() => setShowPaymentModal(false)}
              />

              <p className="text-gray-400 text-sm mt-4">
                You'll be charged ${subscriptionPrice.toFixed(2)} monthly until
                you cancel.
              </p>
            </div>
          </div>
        )}
      </SkeletonTheme>
    </UserLayout>
  );
};

export default Artist;
