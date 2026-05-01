// src/pages/Album.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { BsShare } from "react-icons/bs";
import { IoIosShareAlt } from "react-icons/io";
import { FaPlay, FaPause } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";

// React Query
import { useAlbum } from "../../hooks/api/useAlbums";
import {
  useUserPurchases,
  useUserSubscriptions,
  userDashboardKeys,
} from "../../hooks/api/useUserDashboard";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";
import { usePaymentGateway } from "../../hooks/usePaymentGateway";
import LoginRequiredModal from "../../components/user/LoginRequiredModal";

// Redux
import {
  setSelectedSong,
  play,
  setPlaybackContext,
  addToQueue,
  clearQueue,
} from "../../features/playback/playerSlice";
import { resetPaymentState } from "../../features/payments/paymentSlice";

// Components
import UserHeader from "../../components/user/UserHeader";
import SongList from "../../components/user/SongList";
import PageSEO from "../../components/PageSeo/PageSEO";
import SubscribeModal from "../../components/user/SubscribeModal";
import ShareDropdown from "../../components/user/ShareDropdown";
import PaymentMethodModal from "../../components/user/PaymentMethodModal";

// Skeleton
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Helpers
import { formatDuration } from "../../utills/helperFunctions";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
  };
  return symbols[currency] || currency;
};

// Simple media query hook
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export default function Album() {
  const { albumId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shareBtnRef = useRef(null);
  const queryClient = useQueryClient();

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [loginModal, setLoginModal] = useState({
    open: false,
    type: "play",
    contentType: "song",
    data: null,
  });

  // React Query
  const { data: purchasesData } = useUserPurchases();
  const userPurchases = Array.isArray(purchasesData?.history)
    ? purchasesData.history
    : [];

  const { data: subscriptionsData } = useUserSubscriptions();
  const userSubscriptions = subscriptionsData?.subscriptions || [];

  const {
    data: album,
    isLoading: albumLoading,
    error: albumError,
    refetch: refetchAlbum,
  } = useAlbum(albumId);

  const { isSongPlaying, pausePlayback, resumePlayback } = usePlaybackControl();

  // Redux
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const currentUser = useSelector((state) => state.auth.user);

  // Payment states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Subscribe modal
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Share
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeSongShareDropdown, setActiveSongShareDropdown] = useState(null);

  // Payment Gateway Hook
  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo,
  } = usePaymentGateway();

  const requireLogin = (type, contentType, data = null) => {
    if (!currentUser) {
      setLoginModal({ open: true, type, contentType, data });
      return false;
    }
    return true;
  };

  const isSubscribedToAlbumArtist = useMemo(() => {
    if (!album?.artist || !userSubscriptions.length) return false;
    return userSubscriptions.some(
      (sub) =>
        sub.artist?._id === album.artist?._id ||
        sub.artist?._id === album.artist ||
        sub.artist?.slug === album.artist?.slug
    );
  }, [userSubscriptions, album]);

  const isAlbumSongPlaying =
    selectedSong &&
    album?.songs?.some((s) => s._id === selectedSong._id) &&
    isSongPlaying(selectedSong._id);

  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  useEffect(() => {
    if (albumError) toast.error("Failed to load album");
  }, [albumError]);

  const handlePaymentMethodSelect = async (gateway) => {
    try {
      setProcessingPayment(true);
      setPaymentLoading(true);
      await originalHandlePaymentMethodSelect(gateway);
      await queryClient.invalidateQueries({
        queryKey: userDashboardKeys.purchases(),
      });
      refetchAlbum();
    } catch (error) {
      console.error("Payment method selection error:", error);
    } finally {
      setTimeout(() => {
        setProcessingPayment(false);
        setPaymentLoading(false);
      }, 1000);
    }
  };

  const handleClosePaymentOptions = () => {
    setProcessingPayment(false);
    setPaymentLoading(false);
    closePaymentOptions();
  };

  const handlePurchaseClick = (item, type) => {
    if (!requireLogin("purchase", type, item)) return;
    if (processingPayment || paymentLoading) {
      toast.info("Payment already in progress...");
      return;
    }
    const artist = album?.artist;
    if (!isSubscribedToAlbumArtist) {
      if (
        (type === "song" && item.accessType === "purchase-only") ||
        (type === "album" && album?.accessType === "purchase-only")
      ) {
        setModalArtist(artist);
        setModalType("purchase");
        setModalData(item);
        setSubscribeModalOpen(true);
        return;
      }
    }
    openPaymentOptions(item, type);
  };

  const getArtistSlug = () => {
    if (typeof album?.artist === "object" && album?.artist?.slug) {
      return album?.artist?.slug;
    }
    return null;
  };

  const handlePlaySong = (song) => {
    if (!album) return;
    const index = album.songs.findIndex((s) => s._id === song._id);
    const nextSongs = album.songs.slice(index + 1);
    dispatch(clearQueue());
    dispatch(
      setPlaybackContext({ type: "album", id: album._id, songs: album.songs })
    );
    dispatch(setSelectedSong(song));
    nextSongs.forEach((s) =>
      dispatch(
        addToQueue({
          ...s,
          artistSlug: getArtistSlug(),
          albumSlug: album?.slug,
        })
      )
    );
    dispatch(play());
  };

  const handlePlayAlbum = () => {
    if (!album?.songs?.length) {
      toast.error("No songs in this album");
      return;
    }
    const nextSongs = album.songs.slice(1);
    dispatch(clearQueue());
    dispatch(
      setPlaybackContext({ type: "album", id: album._id, songs: album.songs })
    );
    dispatch(
      setSelectedSong({
        ...album.songs[0],
        artistSlug: getArtistSlug(),
        albumSlug: album?.slug,
      })
    );
    nextSongs.forEach((s) =>
      dispatch(
        addToQueue({
          ...s,
          artistSlug: getArtistSlug(),
          albumSlug: album?.slug,
        })
      )
    );
    dispatch(play());
  };

  const handleAlbumPlayPause = () => {
    if (!album?.songs?.length) return;
    if (selectedSong && album.songs.some((s) => s._id === selectedSong._id)) {
      isSongPlaying(selectedSong._id) ? pausePlayback() : resumePlayback();
    } else {
      handlePlayAlbum();
    }
  };

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleSongShareDropdownToggle = (songId) => {
    setActiveSongShareDropdown((prev) => (prev === songId ? null : songId));
  };

  const artistName = useMemo(() => {
    if (!album) return "Unknown Artist";
    if (typeof album?.artist === "object") return album?.artist?.name;
    return "Unknown Artist";
  }, [album]);

  const DESCRIPTION_LIMIT = 300;
  const isLongDescription = album?.description?.length > DESCRIPTION_LIMIT;
  const displayedDescription = showFullDesc
    ? album?.description
    : album?.description?.slice(0, DESCRIPTION_LIMIT);

  const MOBILE_DESCRIPTION_LIMIT = 200;
  const isMobileLongDescription =
    album?.description?.length > MOBILE_DESCRIPTION_LIMIT;
  const mobileDisplayedDescription = showFullDesc
    ? album?.description
    : album?.description?.slice(0, MOBILE_DESCRIPTION_LIMIT);

  const songs = album?.songs ? [...album.songs] : [];

  const isAlbumPurchased = userPurchases.some(
    (purchase) =>
      purchase?.itemType === "album" &&
      String(purchase.itemId) === String(album?._id)
  );

  const isSubscriptionAlbum =
    album?.accessType === "subscription" || album?.price === 0;

  const totalDuration = songs.reduce(
    (total, song) => total + (song.duration || 0),
    0
  );

  // Shared song list renderer
  const renderSongs = () =>
    songs.map((song, index) => {
      const isSongPurchased = userPurchases.some(
        (p) => p.itemType === "song" && String(p.itemId) === String(song._id)
      );

      const songPriceDisplay =
        song.accessType === "purchase-only" && !isAlbumPurchased ? (
          isSongPurchased ? (
            "Purchased"
          ) : (
            <button
              className={`text-white text-[10px] xs:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded transition-colors ${
                processingPayment || paymentLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              onClick={() => handlePurchaseClick(song, "song")}
              disabled={processingPayment || paymentLoading}
            >
              {processingPayment || paymentLoading
                ? "..."
                : `Buy ${getCurrencySymbol(song?.basePrice?.currency)}${
                    song?.basePrice?.amount || song.price
                  }`}
            </button>
          )
        ) : isAlbumPurchased ? (
          "Included"
        ) : (
          "Subs.."
        );

      return (
        <div
          key={song._id}
          className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4"
        >
          <div className="w-6 sm:w-8 text-center text-gray-400 font-medium text-sm sm:text-base flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <SongList
              songId={song._id}
              currentUser={currentUser}
              img={song?.coverImage || album?.coverImage}
              songName={song?.title}
              songSlug={song?.slug || song?._id}
              artistSlug={getArtistSlug()}
              albumSlug={album?.slug}
              seekTime={song.duration}
              onPlay={() =>
                handlePlaySong({
                  ...song,
                  artistSlug: getArtistSlug(),
                  albumSlug: album?.slug,
                })
              }
              onTitleClick={() => navigate(`/song/${song?.slug || song?._id}`)}
              isSelected={selectedSong?._id === song._id}
              price={songPriceDisplay}
              shareUrl={`${window.location.origin}/song/${
                song?.slug || song?._id
              }`}
              isShareDropdownOpen={activeSongShareDropdown === song._id}
              onShareDropdownToggle={() =>
                handleSongShareDropdownToggle(song._id)
              }
              onShareMenuClose={() => setActiveSongShareDropdown(null)}
            />
          </div>
        </div>
      );
    });

  const isMobile = useMediaQuery("(max-width: 767px)");

  // Loading state
  if (albumLoading) {
    return (
      <>
        <UserHeader />
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="min-h-screen text-white px-4 sm:px-8 pt-6 sm:pt-10 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-8 pb-6">
              <Skeleton className="w-full max-w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton width={80} height={18} />
                <Skeleton width={300} height={36} />
                <Skeleton width={400} height={16} />
                <div className="flex gap-2 mt-4">
                  <Skeleton width={100} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={120} height={14} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <Skeleton width={50} height={50} className="rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton width={160} height={14} />
                    <Skeleton width={100} height={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      </>
    );
  }

  // Error state
  if (albumError || !album) {
    return (
      <>
        <UserHeader />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Album not found
            </h2>
            <p className="text-gray-400 mb-6">
              The album you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
            >
              Browse Albums
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title={`Album: ${album.title} by ${artistName} | Reset Music`}
        description={`Access the album '${album.title}' by ${artistName}. Stream all ${songs.length} songs.`}
        canonicalUrl={`https://musicreset.com/album/${albumId}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          name: album.title,
          description: album.description,
          image: album.coverImage,
          url: `https://musicreset.com/album/${albumId}`,
          byArtist: { "@type": "MusicGroup", name: artistName },
          numTracks: songs.length,
          datePublished: album.releaseDate,
        }}
        noIndex={false}
      />

      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="min-h-screen text-white pb-8">
            {/* Cover with share icon – now with visibility background */}
            <div className="px-4 pt-4 flex justify-center">
              <div className="relative w-[80%] max-w-xs">
                <img
                  src={album?.coverImage}
                  alt="Album Cover"
                  className="w-full rounded-lg shadow-2xl object-cover aspect-square"
                />
                {/* Share button with dark circular background for visibility */}
                <div className="absolute top-2 right-2">
                  <button
                    ref={shareBtnRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-black/50 backdrop-blur-sm rounded-full p-1.5 text-white hover:bg-black/70 transition-colors"
                    aria-label="Share"
                  >
                    <IoIosShareAlt className="w-5 h-5" />
                  </button>
                  <ShareDropdown
                    triggerRef={shareBtnRef}
                    isOpen={showShareMenu}
                    onClose={() => setShowShareMenu(false)}
                    url={`${window.location}`}
                    title={album.title}
                    text={`Listen to "${album.title}" by ${
                      album.artist?.name || artistName
                    } on Reset Music`}
                    isActive={showShareMenu}
                    isPlayerContext={true}
                    artistSlug={getArtistSlug()}
                    navigate={navigate}
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-4 mt-5">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 mb-1">
                Album by{" "}
                <button
                  className="text-white font-bold hover:underline"
                  onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                >
                  {artistName}
                </button>
              </p>

              <h1 className="text-xl font-extrabold leading-tight mb-3">
                {album.title}
              </h1>

              {/* Genre tags */}
              {album?.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {album.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gray-600 text-gray-300"
                    >
                      #{genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap mb-5">
                <span>{formatDateShort(album.releaseDate)}</span>
                <span>·</span>
                <span>{songs.length} songs</span>
                {totalDuration > 0 && (
                  <>
                    <span>·</span>
                    <span>{formatDuration(totalDuration)}</span>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap mb-6">
                <button
                  onClick={handleAlbumPlayPause}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg flex items-center justify-center flex-shrink-0"
                  aria-label={isAlbumSongPlaying ? "Pause" : "Play"}
                >
                  {isAlbumSongPlaying ? (
                    <FaPause style={{ display: "block" }} />
                  ) : (
                    <FaPlay style={{ display: "block", marginLeft: "2px" }} />
                  )}
                </button>

                {/* Purchase */}
                {album?.basePrice?.amount > 0 && !isSubscriptionAlbum && (
                  <>
                    <div className="px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
                      <span className="text-base font-bold text-white">
                        {getCurrencySymbol(album?.basePrice?.currency)}
                        {album?.basePrice?.amount}
                      </span>
                    </div>
                    {isAlbumPurchased ? (
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm">
                        Purchased
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchaseClick(album, "album")}
                        disabled={processingPayment || paymentLoading}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-md ${
                          processingPayment || paymentLoading
                            ? "bg-gray-500 cursor-not-allowed text-gray-300"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {processingPayment || paymentLoading
                          ? "Processing..."
                          : "Purchase Album"}
                      </button>
                    )}
                  </>
                )}

                {/* Subscription */}
                {isSubscriptionAlbum && getArtistSlug() && (
                  <>
                    <span className="text-sm font-semibold text-blue-400">
                      Subscription
                    </span>
                    <button
                      onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-md flex items-center gap-1.5"
                    >
                      <span>View Artist</span>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tracklist */}
            <div className="px-4">
              {songs.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-base">
                  No songs in this album.
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">
                    Tracklist
                  </h2>
                  {renderSongs()}
                </>
              )}
            </div>

            {/* About this album */}
            <div className="px-4 mt-8">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    about
                  </p>
                  <h2 className="text-xl font-bold text-white">this album</h2>
                </div>
                {isSubscriptionAlbum && (
                  <span className="text-sm font-semibold text-blue-400 mt-1">
                    Subscription
                  </span>
                )}
              </div>

              {album?.description && (
                <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {mobileDisplayedDescription}
                  </p>
                  {isMobileLongDescription && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="text-blue-400 text-sm font-medium hover:underline"
                    >
                      {showFullDesc ? "show less" : "show more..."}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Copyright */}
            <div className="px-4 mt-6 pt-4 border-t border-gray-700/40">
              <p className="text-xs text-gray-500">
                © {album?.copyright || artistName} All rights reserved.
              </p>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="min-h-screen text-white px-4 sm:px-8 pt-6 sm:pt-10 pb-8">
            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-8 pb-6">
              <div className="relative flex-shrink-0 w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] mx-0">
                <img
                  src={album?.coverImage}
                  alt="Album Cover"
                  className="w-full aspect-square object-cover rounded-xl shadow-2xl transition-all duration-300"
                />
              </div>

              <div className="flex-1 w-full">
                <div className="text-xs sm:text-sm font-bold tracking-widest uppercase opacity-80">
                  Album
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold my-1 sm:my-2">
                  {album.title}
                </h1>
                <p className="text-base md:text-lg text-gray-400">
                  {displayedDescription}
                  {isLongDescription && !showFullDesc && "..."}
                  {isLongDescription && (
                    <span
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="ml-2 text-blue-400 cursor-pointer hover:underline text-sm"
                    >
                      {showFullDesc ? "View less" : "View more"}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4 flex-wrap text-xs sm:text-sm md:text-base text-gray-300">
                  <button
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                  >
                    {artistName}
                  </button>
                  <span className="text-sm md:text-xl">•</span>
                  <span>{formatDate(album.releaseDate)}</span>
                  <span className="text-sm md:text-xl">•</span>
                  <span>{songs.length} songs</span>
                  <span className="text-sm md:text-xl">•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
                  <button
                    onClick={handleAlbumPlayPause}
                    className="p-3 sm:p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center shadow-lg"
                  >
                    {isAlbumSongPlaying ? (
                      <FaPause className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FaPlay className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>

                  {album?.basePrice?.amount > 0 && !isSubscriptionAlbum && (
                    <>
                      <div className="px-2 py-0.5 sm:px-3 sm:py-1 md:px-5 md:py-3 bg-gray-800 rounded-full border border-gray-700">
                        <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                          {getCurrencySymbol(album?.basePrice?.currency)}
                          {album?.basePrice?.amount}
                        </span>
                      </div>
                      {isAlbumPurchased ? (
                        <span className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-full font-semibold text-sm sm:text-base">
                          Purchased
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseClick(album, "album")}
                          disabled={processingPayment || paymentLoading}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all duration-200 shadow-md text-sm sm:text-base ${
                            processingPayment || paymentLoading
                              ? "bg-gray-500 cursor-not-allowed text-gray-300"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {processingPayment || paymentLoading
                            ? "Processing..."
                            : "Purchase Album"}
                        </button>
                      )}
                    </>
                  )}

                  {isSubscriptionAlbum && getArtistSlug() && (
                    <>
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-400">
                        Subscription
                      </span>
                      <button
                        onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 shadow-md flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                      >
                        <span>View Artist</span>
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Share Button (desktop) */}
                  <div className="relative">
                    <button
                      ref={shareBtnRef}
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2 sm:p-2.5 md:p-3.5 rounded-full border border-gray-600 hover:border-white transition-colors"
                    >
                      <BsShare
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          showShareMenu ? "text-blue-400" : ""
                        }`}
                      />
                    </button>
                    <ShareDropdown
                      triggerRef={shareBtnRef}
                      isOpen={showShareMenu}
                      onClose={() => setShowShareMenu(false)}
                      url={`${window.location}`}
                      title={album.title}
                      text={`Listen to "${album.title}" by ${
                        album.artist?.name || artistName
                      } on Reset Music`}
                      isActive={showShareMenu}
                      isPlayerContext={true}
                      artistSlug={getArtistSlug()}
                      navigate={navigate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Song List */}
            {songs.length === 0 ? (
              <div className="text-center text-gray-400 mt-6 sm:mt-8 text-base sm:text-lg">
                No songs in this album.
              </div>
            ) : (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                  Tracklist
                </h2>
                {renderSongs()}
              </div>
            )}

            {/* Copyright Section */}
            <div className="mt-10 pt-6 border-t border-gray-700/50">
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-500">
                <p>© {album?.copyright || artistName} All rights reserved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Shared Modals */}
        <PaymentMethodModal
          open={showPaymentOptions}
          onClose={handleClosePaymentOptions}
          onSelectMethod={handlePaymentMethodSelect}
          item={pendingPayment?.item}
          itemType={pendingPayment?.itemType}
          currencyData={pendingPayment?.currencyData}
          getPaymentDisplayInfo={getPaymentDisplayInfo}
        />

        <SubscribeModal
          open={subscribeModalOpen}
          artist={modalArtist}
          type={modalType}
          itemData={modalData}
          onClose={handleSubscribeModalClose}
          onNavigate={() => {
            setSubscribeModalOpen(false);
            if (modalArtist?.slug) navigate(`/artist/${modalArtist.slug}`);
          }}
        />

        <LoginRequiredModal
          open={loginModal.open}
          onClose={() => setLoginModal((prev) => ({ ...prev, open: false }))}
          type={loginModal.type}
          contentType={loginModal.contentType}
          itemData={loginModal.data}
          onLogin={() => navigate("/login")}
        />
      </SkeletonTheme>
    </>
  );
}