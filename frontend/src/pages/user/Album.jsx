// src/pages/Album.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
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
  const isPlayerLoading = useSelector((state) => state.player.isLoading);
  const streamError = useSelector((state) => state.player.streamError);

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
              className={`text-white text-[10px] xs:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded transition-colors ${processingPayment || paymentLoading
                ? "bg-gray-500 cursor-not-allowed"
                : ""
                }`}
              style={!(processingPayment || paymentLoading) ? { backgroundColor: '#3380FF' } : {}}
              onClick={() => handlePurchaseClick(song, "song")}
              disabled={processingPayment || paymentLoading}
            >
              {processingPayment || paymentLoading
                ? "..."
                : `Buy ${getCurrencySymbol(song?.basePrice?.currency)}${song?.basePrice?.amount || song.price
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
              shareUrl={`${window.location.origin}/song/${song?.slug || song?._id
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
              className="px-6 py-3 text-white rounded-full font-semibold transition-colors"
              style={{ backgroundColor: '#3380FF' }}
            >
              Browse Albums
            </button>
          </div>
        </div>
      </>
    );
  }

  const albumSlug = album?.slug || albumId;
  const canonicalUrl = `https://musicreset.com/album/${albumSlug}`;

  return (
    <>
      <PageSEO
        title={`Album: ${album.title} by ${artistName} | Reset Music`}
        description={`Access the album '${album.title}' by ${artistName}. Stream all ${songs.length} songs.`}
        canonicalUrl={canonicalUrl}
        ogUrl={canonicalUrl}
        twitterImage={album.coverImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          "name": album.title,
          "description": album.description || `Listen to '${album.title}' by ${artistName} on Reset Music.`,
          "image": album.coverImage,
          "url": canonicalUrl,
          "byArtist": { 
            "@type": "MusicGroup", 
            "name": artistName,
            "url": getArtistSlug() ? `https://musicreset.com/artist/${getArtistSlug()}` : undefined
          },
          "numTracks": songs.length,
          "datePublished": album.releaseDate,
          "track": songs.map((s) => ({
            "@type": "MusicRecording",
            "name": s.title,
            "url": `https://musicreset.com/song/${s.slug || s._id || s.id}`,
            "duration": s.duration ? `PT${Math.floor(s.duration / 60)}M${Math.floor(s.duration % 60)}S` : undefined,
          }))
        }}
        noIndex={false}
      />

      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="min-h-screen text-white pb-8">
            {/* Cover image (no share button on cover anymore) */}
            <div className="px-4 pt-4 flex justify-center">
              <div className="relative w-[80%] max-w-xs">
                <img
                  src={album?.coverImage}
                  alt="Album Cover"
                  className="w-full rounded-lg shadow-2xl object-cover aspect-square"
                />
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

              {/* Action buttons - Play, Share, then Price/Purchase */}
              <div className="flex items-center gap-3 flex-wrap mb-6">
                {/* Play/Pause — same SVG as web player */}
                <div
                  className="cursor-pointer transition-transform duration-150 flex-shrink-0"
                  onClick={handleAlbumPlayPause}
                >
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="al_f_glass" x="-10%" y="-10%" width="120%" height="120%">
                        <feFlood floodOpacity={0} result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy={1} /><feGaussianBlur stdDeviation={1.5} />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                      </filter>
                      <linearGradient id="al_grad_ring" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ECF3FD" />
                        <stop offset="35%" stopColor="#1448FF" />
                        <stop offset="100%" stopColor="#010203" />
                      </linearGradient>
                      <linearGradient id="al_grad_fill" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                        <stop offset="0%" stopColor="#050F2A" stopOpacity="0.32" />
                        <stop offset="30%" stopColor="#0941A4" stopOpacity="0.75" />
                        <stop offset="56%" stopColor="#2775FF" stopOpacity="0.88" />
                        <stop offset="78%" stopColor="#0C63FF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#020A1A" stopOpacity="0.10" />
                      </linearGradient>
                      <linearGradient id="al_grad_stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="white" />
                        <stop offset="10%" stopColor="#88B2EF" />
                        <stop offset="64%" stopColor="#88B2EF" />
                        <stop offset="87%" stopColor="#033CAA" />
                      </linearGradient>
                    </defs>
                    <circle cx="22" cy="22" r="21" fill="none" stroke="url(#al_grad_ring)" strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="19.4" fill="#1A1C20" />
                    <circle cx="22" cy="22" r="19.4" fill="url(#al_grad_fill)" />
                    <circle cx="22" cy="22" r="19.4" fill="none" stroke="url(#al_grad_stroke)" strokeWidth="0.7" />
                    {isPlayerLoading ? (
                      <g>
                        <circle cx="22" cy="22" r="7" fill="none" stroke="white" strokeWidth="2" strokeDasharray="22" strokeDashoffset="10" opacity="0.8">
                          <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.8s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    ) : isAlbumSongPlaying ? (
                      <g filter="url(#al_f_glass)">
                        <rect x="16.5" y="15.75" width="3.5" height="12.5" rx="1.5" fill="white" />
                        <rect x="24" y="15.75" width="3.5" height="12.5" rx="1.5" fill="white" />
                      </g>
                    ) : (
                      <g filter="url(#al_f_glass)" transform="translate(15.726, 14.691) scale(0.5455)">
                        <path d="M21.5455 15.4362C21.4636 15.547 21.0818 16.018 20.7818 16.3227L20.6182 16.4889C18.3273 19.01 12.6273 22.8053 9.73636 24.0243C9.73636 24.052 8.01818 24.7723 7.2 24.8H7.09091C5.83636 24.8 4.66364 24.0797 4.06364 22.9162C3.73636 22.279 3.43636 20.4228 3.40909 20.3951C3.16364 18.7329 3 16.187 3 13.3861C3 10.4496 3.16364 7.79004 3.46364 6.15553C3.46364 6.12782 3.76364 4.63183 3.95455 4.13317C4.25455 3.41288 4.8 2.8034 5.48182 2.41555C6.02727 2.13852 6.6 2 7.2 2C7.82727 2.0277 9 2.44603 9.46364 2.63718C12.5182 3.85614 18.3545 7.84544 20.5909 10.2834C20.9727 10.6712 21.3818 11.1422 21.4909 11.253C21.9545 11.8625 22.2 12.6104 22.2 13.4166C22.2 14.1341 21.9818 14.8544 21.5455 15.4362Z" fill="white" />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Share Button (mobile) - now in action row */}
                <div className="relative">
                  <button
                    ref={shareBtnRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 rounded-full border border-gray-600 hover:border-white transition-colors"
                    aria-label="Share"
                  >
                    <IoIosShareAlt className="w-4 h-4" />
                  </button>
                  <ShareDropdown
                    triggerRef={shareBtnRef}
                    isOpen={showShareMenu}
                    onClose={() => setShowShareMenu(false)}
                    url={`${window.location}`}
                    title={album.title}
                    text={`Listen to "${album.title}" by ${album.artist?.name || artistName
                      } on Reset Music`}
                    isActive={showShareMenu}
                    isPlayerContext={true}
                    artistSlug={getArtistSlug()}
                    navigate={navigate}
                  />
                </div>

                {/* Purchase / Subscription actions */}
                {album?.basePrice?.amount > 0 && !isSubscriptionAlbum && (
                  <>
                    <div className="px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
                      <span className="text-base font-bold text-white">
                        {getCurrencySymbol(album?.basePrice?.currency)}
                        {album?.basePrice?.amount}
                      </span>
                    </div>
                    {isAlbumPurchased ? (
                      <span className="px-4 py-2 text-white rounded-full font-semibold text-sm" style={{ backgroundColor: '#3380FF' }}>
                        Purchased
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchaseClick(album, "album")}
                        disabled={processingPayment || paymentLoading}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-md ${processingPayment || paymentLoading
                          ? "bg-gray-500 cursor-not-allowed text-gray-300"
                          : "text-white"
                          }`}
                        style={!(processingPayment || paymentLoading) ? { backgroundColor: '#3380FF' } : {}}
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
                    <span className="text-sm font-semibold" style={{ color: '#4DB3FF' }}>
                      Subscription
                    </span>
                    <button
                      onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                      className="px-4 py-2 text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-md flex items-center gap-1.5"
                      style={{ backgroundColor: '#3380FF' }}
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
                    {isMobileLongDescription && !showFullDesc && "..."}
                    {isMobileLongDescription && (
                      <span
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="ml-2 text-sm font-medium hover:underline cursor-pointer"
                        style={{ color: '#4DB3FF' }}
                      >
                        {showFullDesc ? "show less" : "show more"}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Copyright */}
            <div className="px-4 mt-6 pt-4 border-t border-gray-700/40">
              <p className="text-xs text-gray-200">
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
                      className="ml-2 cursor-pointer hover:underline text-sm"
                      style={{ color: '#4DB3FF' }}
                    >
                      {showFullDesc ? "show less" : "show more"}
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

                {/* Action Buttons - Play, Share, then Price/Purchase */}
                <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
                  {/* Play/Pause — same SVG as web player */}
                  <div
                    className="cursor-pointer transition-transform duration-150"
                    onClick={handleAlbumPlayPause}
                  >
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="ald_f_glass" x="-10%" y="-10%" width="120%" height="120%">
                          <feFlood floodOpacity={0} result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                          <feOffset dy={1} /><feGaussianBlur stdDeviation={1.5} />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                        </filter>
                        <linearGradient id="ald_grad_ring" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ECF3FD" />
                          <stop offset="35%" stopColor="#1448FF" />
                          <stop offset="100%" stopColor="#010203" />
                        </linearGradient>
                        <linearGradient id="ald_grad_fill" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                          <stop offset="0%" stopColor="#050F2A" stopOpacity="0.32" />
                          <stop offset="30%" stopColor="#0941A4" stopOpacity="0.75" />
                          <stop offset="56%" stopColor="#2775FF" stopOpacity="0.88" />
                          <stop offset="78%" stopColor="#0C63FF" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#020A1A" stopOpacity="0.10" />
                        </linearGradient>
                        <linearGradient id="ald_grad_stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="white" />
                          <stop offset="10%" stopColor="#88B2EF" />
                          <stop offset="64%" stopColor="#88B2EF" />
                          <stop offset="87%" stopColor="#033CAA" />
                        </linearGradient>
                      </defs>
                      <circle cx="22" cy="22" r="21" fill="none" stroke="url(#ald_grad_ring)" strokeWidth="1.2" />
                      <circle cx="22" cy="22" r="19.4" fill="#1A1C20" />
                      <circle cx="22" cy="22" r="19.4" fill="url(#ald_grad_fill)" />
                      <circle cx="22" cy="22" r="19.4" fill="none" stroke="url(#ald_grad_stroke)" strokeWidth="0.7" />
                      {isPlayerLoading ? (
                        <g>
                          <circle cx="22" cy="22" r="7" fill="none" stroke="white" strokeWidth="2" strokeDasharray="22" strokeDashoffset="10" opacity="0.8">
                            <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.8s" repeatCount="indefinite" />
                          </circle>
                        </g>
                      ) : isAlbumSongPlaying ? (
                        <g filter="url(#ald_f_glass)">
                          <rect x="16.5" y="15.75" width="3.5" height="12.5" rx="1.5" fill="white" />
                          <rect x="24" y="15.75" width="3.5" height="12.5" rx="1.5" fill="white" />
                        </g>
                      ) : (
                        <g filter="url(#ald_f_glass)" transform="translate(15.726, 14.691) scale(0.5455)">
                          <path d="M21.5455 15.4362C21.4636 15.547 21.0818 16.018 20.7818 16.3227L20.6182 16.4889C18.3273 19.01 12.6273 22.8053 9.73636 24.0243C9.73636 24.052 8.01818 24.7723 7.2 24.8H7.09091C5.83636 24.8 4.66364 24.0797 4.06364 22.9162C3.73636 22.279 3.43636 20.4228 3.40909 20.3951C3.16364 18.7329 3 16.187 3 13.3861C3 10.4496 3.16364 7.79004 3.46364 6.15553C3.46364 6.12782 3.76364 4.63183 3.95455 4.13317C4.25455 3.41288 4.8 2.8034 5.48182 2.41555C6.02727 2.13852 6.6 2 7.2 2C7.82727 2.0277 9 2.44603 9.46364 2.63718C12.5182 3.85614 18.3545 7.84544 20.5909 10.2834C20.9727 10.6712 21.3818 11.1422 21.4909 11.253C21.9545 11.8625 22.2 12.6104 22.2 13.4166C22.2 14.1341 21.9818 14.8544 21.5455 15.4362Z" fill="white" />
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Share Button (desktop) - now immediately after play */}
                  <div className="relative">
                    <button
                      ref={shareBtnRef}
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2 sm:p-2.5 md:p-3.5 rounded-full border border-gray-600 hover:border-white transition-colors"
                    >
                      <IoIosShareAlt
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={showShareMenu ? { color: '#4DB3FF' } : {}}
                      />
                    </button>
                    <ShareDropdown
                      triggerRef={shareBtnRef}
                      isOpen={showShareMenu}
                      onClose={() => setShowShareMenu(false)}
                      url={`${window.location}`}
                      title={album.title}
                      text={`Listen to "${album.title}" by ${album.artist?.name || artistName
                        } on Reset Music`}
                      isActive={showShareMenu}
                      isPlayerContext={true}
                      artistSlug={getArtistSlug()}
                      navigate={navigate}
                    />
                  </div>

                  {/* Purchase / Subscription actions */}
                  {album?.basePrice?.amount > 0 && !isSubscriptionAlbum && (
                    <>
                      <div className="px-2 py-0.5 sm:px-3 sm:py-1 md:px-5 md:py-3 bg-gray-800 rounded-full border border-gray-700">
                        <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                          {getCurrencySymbol(album?.basePrice?.currency)}
                          {album?.basePrice?.amount}
                        </span>
                      </div>
                      {isAlbumPurchased ? (
                        <span className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 text-white rounded-full font-semibold text-sm sm:text-base" style={{ backgroundColor: '#3380FF' }}>
                          Purchased
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseClick(album, "album")}
                          disabled={processingPayment || paymentLoading}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all duration-200 shadow-md text-sm sm:text-base ${processingPayment || paymentLoading
                            ? "bg-gray-500 cursor-not-allowed text-gray-300"
                            : "text-white"
                            }`}
                          style={!(processingPayment || paymentLoading) ? { backgroundColor: '#3380FF' } : {}}
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
                      <span className="text-sm sm:text-base md:text-lg font-semibold" style={{ color: '#4DB3FF' }}>
                        Subscription
                      </span>
                      <button
                        onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 text-white rounded-full font-semibold transition-all duration-200 shadow-md flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                        style={{ backgroundColor: '#3380FF' }}
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
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-200">
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