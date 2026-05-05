// src/pages/Song.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaShoppingCart, FaCheck, FaPause, FaPlay } from "react-icons/fa";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { IoIosShareAlt } from "react-icons/io";

import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import { toast } from "sonner";

import UserHeader from "../../components/user/UserHeader";
import ShareDropdown from "../../components/user/ShareDropdown";
import RecentPlays from "../../components/user/RecentPlays";
import AlbumCard from "../../components/user/AlbumCard";
import { formatDuration } from "../../utills/helperFunctions";
import SubscribeModal from "../../components/user/SubscribeModal";
import PaymentMethodModal from "../../components/user/PaymentMethodModal";
import LoadingOverlay from "../../components/user/Home/LoadingOverlay";
import { useLikeSong, useLikedSongs } from "../../hooks/api/useSongs";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";
import LoginRequiredModal from "../../components/user/LoginRequiredModal";
import {
  useUserPurchases,
  useUserSubscriptions,
  userDashboardKeys,
} from "../../hooks/api/useUserDashboard";

// React Query imports
import { useQueryClient } from "@tanstack/react-query";
import { useSong, useArtistSingles } from "../../hooks/api/useSongs";
import { useArtistAlbumsSimple } from "../../hooks/api/useAlbums";

// Redux imports
import {
  setSelectedSong,
  play,
  pause,
} from "../../features/playback/playerSlice";

// Payment hook
import { usePaymentGateway } from "../../hooks/usePaymentGateway";

// Skeleton
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function formatDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

export default function Song() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { songId } = useParams();
  const queryClient = useQueryClient();
  const likeMutation = useLikeSong();
  const { data: likedData } = useLikedSongs(20);
  const shareBtnRef = useRef(null);

  const { isSongPlaying, isSongSelected, pausePlayback, resumePlayback } =
    usePlaybackControl();

  // React Query hooks
  const { data: purchasesData } = useUserPurchases();
  const userPurchases = Array.isArray(purchasesData?.history)
    ? purchasesData.history
    : [];

  const { data: subscriptionsData } = useUserSubscriptions();
  const userSubscriptions = subscriptionsData?.subscriptions || [];

  const {
    data: song,
    isLoading,
    isError,
    error,
    refetch: refetchSong,
  } = useSong(songId);

  const likedSongs = likedData?.pages?.flatMap((page) => page.songs) || [];
  const isLiked = likedSongs.some((likedSong) => likedSong._id === song?._id);

  // Get artist ID from song
  const artistId = song?.artist?._id || song?.artist;

  // Fetch artist's singles and albums
  const { data: singlesData, isLoading: singlesLoading } = useArtistSingles(
    artistId,
    10,
  );
  const { data: artistAlbumsData, isLoading: albumsLoading } =
    useArtistAlbumsSimple(artistId, 10);

  // Current user from Redux
  const currentUser = useSelector((state) => state.auth?.user);
  const currentSong = useSelector((state) => state.player?.currentSong);

  // State for modals and UI
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [loginModal, setLoginModal] = useState({
    open: false,
    type: "purchase",
    contentType: "purchase",
    data: null,
  });

  const singlesScrollRef = useRef(null);
  const albumsScrollRef = useRef(null);

  // Payment Gateway hook
  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo,
  } = usePaymentGateway();

  // Check if user is subscribed to the song's artist
  const isSubscribedToArtist = useMemo(() => {
    if (!song?.artist || !userSubscriptions.length) return false;
    return userSubscriptions.some(
      (sub) =>
        sub.artist?._id === song.artist?._id ||
        sub.artist?._id === song.artist ||
        sub.artist?.slug === song.artist?.slug,
    );
  }, [userSubscriptions, song]);

  // Derived states
  const isFromAlbum = Boolean(
    song?.album && Object.keys(song.album).length > 0,
  );
  const isCurrentSongPlaying = isSongPlaying(song?._id || songId);
  const isSongPurchased = userPurchases.some(
    (p) => p.itemType === "song" && String(p.itemId) === String(song?._id),
  );
  const purchasedAlbumIds = new Set(
    userPurchases
      .filter((p) => p.itemType === "album")
      .map((p) => String(p.itemId)),
  );

  // Extract and filter singles/albums
  const artistSingles = singlesData?.pages?.[0]?.songs || [];
  const filteredSingles = artistSingles
    .filter((single) => single._id !== songId)
    .slice(0, 10);

  const artistAlbums = artistAlbumsData?.albums || [];
  const filteredAlbums =
    isFromAlbum && song?.album?._id
      ? artistAlbums.filter((album) => album._id !== song.album._id)
      : artistAlbums;

  // Reset payment state on unmount
  useEffect(() => {
    return () => {
      setProcessingPayment(false);
      setPaymentLoading(false);
    };
  }, []);

  // Handle payment method selection
  const handlePaymentMethodSelect = async (gateway) => {
    try {
      setProcessingPayment(true);
      setPaymentLoading(true);
      await originalHandlePaymentMethodSelect(gateway);
      // Invalidate purchases and refetch song data
      await queryClient.invalidateQueries({
        queryKey: userDashboardKeys.purchases(),
      });
      refetchSong();
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

  // Purchase click handler (aligned with Album.jsx)
  const handlePurchaseClick = (item, type) => {
    if (!requireLogin("like", "purchase", song)) return;

    if (processingPayment || paymentLoading) {
      toast.info("Payment already in progress...");
      return;
    }

    const artist = song?.artist;

    // If not subscribed to artist and item requires purchase, show subscribe modal
    if (!isSubscribedToArtist) {
      if (
        (type === "song" && item.accessType === "purchase-only") ||
        (type === "album" && item.accessType === "purchase-only")
      ) {
        setModalArtist(artist);
        setModalType("purchase");
        setModalData(item);
        setSubscribeModalOpen(true);
        return;
      }
    }

    // Directly open payment modal
    openPaymentOptions(item, type);
  };

  const requireLogin = (type, contentType, data = null) => {
    if (!currentUser) {
      setLoginModal({
        open: true,
        type,
        contentType,
        data,
      });
      return false;
    }
    return true;
  };

  // Handle play/pause for current song
  const handlePlaySong = () => {
    if (!song) return;
    if (isSongSelected(song._id)) {
      isSongPlaying(song._id) ? pausePlayback() : resumePlayback();
    } else {
      dispatch(setSelectedSong(song));
      dispatch(play());
    }
  };

  const handlePlayOtherSong = (songData) => {
    dispatch(setSelectedSong(songData));
    dispatch(play());
  };

  const handleSingleTitleClick = (single) => {
    navigate(`/song/${single.slug || single._id}`);
  };

  const handleCoverClick = () => {
    handlePlaySong();
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
  toast.error("You must be logged in to like songs");
  return;
}

    likeMutation.mutate(song?._id, {
      onSuccess: () => {
        toast.success(
          isLiked ? "Removed from Liked Songs" : "Added to Liked Songs",
        );
      },
      onError: () => {
        toast.error("Failed to update like");
      },
    });
  };

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleScroll = (direction = "right", section = "singles") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    const ref = section === "singles" ? singlesScrollRef : albumsScrollRef;
    ref?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Price display for a song (used in singles list)
  const getSongPriceDisplay = (songItem) => {
    const isPurchased = userPurchases.some(
      (p) => p.itemType === "song" && String(p.itemId) === String(songItem._id),
    );

    if (isPurchased) {
      return (
        <span className="text-green-400 text-xs font-semibold">Purchased</span>
      );
    }

    if (songItem?.accessType === "subscription") {
      return (
        <span className="text-blue-400 text-xs font-semibold">Subs..</span>
      );
    }

    if (
      songItem?.accessType === "purchase-only" &&
      songItem?.basePrice?.amount > 0
    ) {
      const symbol =
        songItem.basePrice.currency === "USD"
          ? "$"
          : songItem.basePrice.currency;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePurchaseClick(songItem, "song");
          }}
          className="text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded"
        >
          Buy {symbol}
          {songItem.basePrice.amount}
        </button>
      );
    }

    return null;
  };

  // Price display for albums
  const getAlbumPriceDisplay = (album) => {
    const isPurchased = purchasedAlbumIds.has(String(album._id));

    if (isPurchased) {
      return (
        <span className="text-green-400 text-xs font-semibold">Purchased</span>
      );
    }

    if (album.accessType === "subscription") {
      return (
        <span className="text-blue-400 text-xs font-semibold">Subs..</span>
      );
    }

    if (album.accessType === "purchase-only" && album.basePrice?.amount > 0) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePurchaseClick(album, "album");
          }}
          className="text-white sm:text-xs text-[10px] sm:mt-0 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
        >
          Buy ${album.basePrice.amount}
        </button>
      );
    }

    return null;
  };

  // Main purchase button handler for current song
  const handleMainPurchaseClick = () => {
    if (!song) return;
    handlePurchaseClick(song, "song");
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <UserHeader />
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="min-h-screen text-white sm:px-8 px-4 pt-10 pb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-8">
              <Skeleton className="w-full max-w-[320px] h-[320px] rounded-2xl" />
              <div className="flex-1 flex flex-col gap-3">
                <Skeleton width={60} height={16} />
                <Skeleton width={400} height={40} />
                <Skeleton width={200} height={18} />
                <Skeleton width={350} height={16} />
                <div className="flex gap-2 mt-4">
                  <Skeleton width={100} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={80} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={60} height={14} />
                </div>
              </div>
            </div>
          </div>
        </SkeletonTheme>
      </>
    );
  }

  // Error state
  if (isError || !song) {
    return (
      <>
        <UserHeader />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Song not found
            </h2>
            <p className="text-gray-400 mb-6">
              The track you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
            >
              Browse Music
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white sm:px-8 px-4 pt-10 pb-8 relative">
          {/* Main Song Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-8">
            {/* Song Cover */}
            <div
              className="relative group w-full max-w-[240px] sm:max-w-[300px] mx-auto"
              onMouseEnter={() => setIsHoveringCover(true)}
              onMouseLeave={() => setIsHoveringCover(false)}
            >
              <div className="relative w-full">
                <img
                  src={song?.coverImage || song?.album?.coverImage}
                  alt={`${song.title} cover`}
                  className="w-full h-auto aspect-square object-cover rounded-xl shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={handleCoverClick}
                />
              </div>
            </div>

            {/* Song Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="sm:text-sm text-xs font-bold tracking-widest opacity-80">
                  track
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black leading-tight text-white">
                {song.title}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                {song?.artist && (
                  <button
                    onClick={() => navigate(`/artist/${song?.artist?.slug}`)}
                    className="text-base sm:text-lg text-gray-300 hover:text-white transition-colors hover:underline"
                  >
                    {song?.artist?.name}
                  </button>
                )}
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-sm sm:text-base">
                  {formatDate(song?.releaseDate)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-sm sm:text-base">
                  {formatDuration(song?.duration)}
                </span>
                {song?.copyright && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm sm:text-base flex items-center gap-1">
                      <span>©</span>
                      {song.copyright}
                    </span>
                  </>
                )}
              </div>

              <p className="text-base sm:text-lg text-gray-300 mb-4 leading-relaxed max-w-2xl">
                {song.description}
              </p>

              {/* Genre Tags */}
              {song.genre && song.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {song.genre.map((genre, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(`/genre/${genre.toLowerCase()}`)}
                      className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gray-800/50 text-white text-xs sm:text-sm rounded-full border border-gray-700"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <button
                  onClick={handlePlaySong}
                  className="p-3 sm:p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center shadow-lg"
                  aria-label={isCurrentSongPlaying ? "Pause" : "Play"}
                >
                  {isCurrentSongPlaying ? (
                    <FaPause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FaPlay className="w-4 h-4 sm:w-5 sm:h-5 pl-0.5" />
                  )}
                </button>

                {/* Purchase/Subscription Info */}
                {song.accessType === "purchase-only" &&
                  song.basePrice?.amount > 0 && (
                    <>
                      <div className="px-3 py-1 sm:px-5 sm:py-3 bg-gray-800 rounded-full border border-gray-700">
                        <span className="text-base sm:text-xl font-bold text-white">
                          ${song.basePrice.amount}
                        </span>
                      </div>
                      {isSongPurchased ? (
                        <button className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-green-600 text-white rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                          Purchased
                        </button>
                      ) : (
                        <button
                          onClick={handleMainPurchaseClick}
                          disabled={processingPayment || paymentLoading}
                          className={`px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base ${
                            processingPayment || paymentLoading
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                        >
                          <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          {processingPayment || paymentLoading
                            ? "Processing..."
                            : "Purchase Song"}
                        </button>
                      )}
                    </>
                  )}

                {song.accessType === "subscription" && (
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs sm:text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-full">
                    Subscription
                  </span>
                )}

                {/* Like Button */}
                <button
                  onClick={handleToggleLike}
                  disabled={likeMutation.isLoading}
                  className="p-2.5 sm:p-3.5 rounded-full text-gray-300 border border-gray-700 hover:bg-gray-800/50 hover:text-red-600 transition-colors group"
                >
                  {isLiked ? (
                    <BsHeartFill className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  ) : (
                    <BsHeart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-red-700" />
                  )}
                </button>

                {/* Share Button */}
                <div className="relative">
                  <button
                    ref={shareBtnRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`p-2.5 sm:p-3.5 rounded-full border transition-colors group ${
                      showShareMenu
                        ? "bg-gray-800/50 text-blue-400 border-blue-400"
                        : "text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-blue-400"
                    }`}
                  >
                    <IoIosShareAlt
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        showShareMenu
                          ? "text-blue-400"
                          : "group-hover:text-blue-400"
                      }`}
                    />
                  </button>

                  <ShareDropdown
                    isOpen={showShareMenu}
                    onClose={() => setShowShareMenu(false)}
                    triggerRef={shareBtnRef}
                    url={`${window.location}`}
                    title={song.title}
                    text={`Listen to "${song.title}" by ${
                      song.artist?.name || song.singer
                    } on Reset Music`}
                    isActive={showShareMenu}
                    className="lg:right-0 right-[-80px] sm:right-[-40px]"
                  />
                </div>
              </div>

              {/* Album Info if from album */}
              {isFromAlbum && song?.album && (
                <div className="mt-2">
                  <span className="text-gray-400 text-sm">From album: </span>
                  <button
                    onClick={() =>
                      navigate(
                        `/album/${song?.album?.slug || song?.album?._id}`,
                      )
                    }
                    className="text-white font-medium hover:underline text-sm sm:text-base"
                  >
                    {song.album.title}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Artist Info Section */}
          {song?.artist && (
            <div className="pt-4 mb-8 border-t border-gray-700">
              <div className="flex items-center gap-2 sm:gap-4 mb-6">
                <div className="h-8 sm:h-12 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Artist: {song.artist.name}
                </h2>
                <button
                  onClick={() => navigate(`/artist/${song.artist.slug}`)}
                  className="ml-auto px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                Artist Profile
                </button>
              </div>
            </div>
          )}

          {/* More Songs by This Artist Section */}
          {filteredSingles.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  more tracks by {song?.artist?.name || song?.singer}
                </h2>
                <div className="hidden sm:flex items-center gap-2">
                  <LuSquareChevronLeft
                    className="text-white cursor-pointer hover:text-blue-800 text-xl"
                    onClick={() => handleScroll("left", "singles")}
                  />
                  <LuSquareChevronRight
                    className="text-white cursor-pointer hover:text-blue-800 text-xl"
                    onClick={() => handleScroll("right", "singles")}
                  />
                </div>
              </div>

              <div
                ref={singlesScrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 no-scrollbar"
              >
                {singlesLoading
                  ? [...Array(5)].map((_, idx) => (
                      <div
                        key={`single-skeleton-${idx}`}
                        className="min-w-[140px] sm:min-w-[180px] flex-shrink-0"
                      >
                        <Skeleton className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-xl" />
                        <Skeleton width={120} height={16} className="mt-2" />
                        <Skeleton width={80} height={14} className="mt-1" />
                      </div>
                    ))
                  : filteredSingles.map((single) => (
                      <div
                        key={single._id}
                        className="min-w-[140px] sm:min-w-[180px] flex-shrink-0"
                      >
                        <RecentPlays
                          songId={single._id}
                          title={single.title}
                          image={
                            single.coverImage ? (
                              single.coverImage
                            ) : (
                              <div
                                className={`w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] ${getArtistColor(
                                  single.artist?.name || single.singer,
                                )} flex items-center justify-center text-white font-bold text-xl sm:text-2xl`}
                              >
                                {single.title
                                  ? single.title.charAt(0).toUpperCase()
                                  : "S"}
                              </div>
                            )
                          }
                          price={getSongPriceDisplay(single)}
                          onPlay={() => handlePlayOtherSong(single)}
                          onTitleClick={() => handleSingleTitleClick(single)}
                          isSelected={currentSong?._id === single._id}
                        />
                      </div>
                    ))}
              </div>
            </div>
          )}

          {/* Albums by This Artist Section */}
          {filteredAlbums.length > 0 && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  albums by {song?.artist?.name || song?.singer}
                </h2>
                <div className="hidden sm:flex items-center gap-2">
                  <LuSquareChevronLeft
                    className="text-white cursor-pointer hover:text-blue-800 text-xl"
                    onClick={() => handleScroll("left", "albums")}
                  />
                  <LuSquareChevronRight
                    className="text-white cursor-pointer hover:text-blue-800 text-xl"
                    onClick={() => handleScroll("right", "albums")}
                  />
                </div>
              </div>

              <div
                ref={albumsScrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 no-scrollbar"
              >
                {albumsLoading
                  ? [...Array(5)].map((_, idx) => (
                      <div
                        key={`album-skeleton-${idx}`}
                        className="min-w-[130px] sm:min-w-[160px] flex-shrink-0"
                      >
                        <Skeleton className="w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] rounded-xl" />
                        <Skeleton width={100} height={16} className="mt-2" />
                      </div>
                    ))
                  : filteredAlbums.slice(0, 10).map((album) => (
                      <div
                        key={album._id}
                        className="min-w-[130px] sm:min-w-[160px] flex-shrink-0"
                      >
                        <AlbumCard
                          tag={`${album.title || "music"}`}
                          artists={album.artist?.name || "Various Artists"}
                          image={album.coverImage || "/images/placeholder.png"}
                          price={getAlbumPriceDisplay(album)}
                          onClick={() => navigate(`/album/${album.slug}`)}
                        />
                      </div>
                    ))}
              </div>
            </div>
          )}
        </div>
      </SkeletonTheme>

      {/* Modals */}
      <LoadingOverlay show={processingPayment || paymentLoading} />

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

      <PaymentMethodModal
        open={showPaymentOptions}
        onClose={handleClosePaymentOptions}
        onSelectMethod={handlePaymentMethodSelect}
        item={pendingPayment?.item}
        itemType={pendingPayment?.itemType}
        currencyData={pendingPayment?.currencyData}
        getPaymentDisplayInfo={getPaymentDisplayInfo}
      />
    </>
  );
}
