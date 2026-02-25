// src/pages/Song.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaPlay, FaShoppingCart, FaCheck, FaPause } from "react-icons/fa";
import { BsHeart, BsHeartFill, BsShare } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
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
import { useLikeSong,useLikedSongs } from "../../hooks/api/useSongs";
import { useUserPurchases } from "../../hooks/api/useUserDashboard";


// React Query imports
import { useSong, useArtistSingles } from "../../hooks/api/useSongs";
import { useArtistAlbumsSimple } from "../../hooks/api/useAlbums";

// Redux imports
import {
  setSelectedSong,
  play,
  pause,
} from "../../features/playback/playerSlice";

// Subscription utilities
import { hasArtistSubscriptionInPurchaseHistory } from "../../utills/subscriptions";
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
    "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-red-600",
    "bg-orange-600", "bg-yellow-600", "bg-green-600", "bg-teal-600", "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

export default function Song() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { songId } = useParams();
  const likeMutation = useLikeSong();
const { data: likedData } = useLikedSongs(20);
const { data: purchaseData } = useUserPurchases();

const purchases = Array.isArray(purchaseData?.history)
  ? purchaseData.history
  : [];

  
  // State for modals
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  const purchasedSongIds = React.useMemo(() => {
  return new Set(
    purchases
      ?.filter(item => item.itemType === "song")
      .map(item => item.itemId)
  );
}, [purchases]);

const purchasedAlbumIds = React.useMemo(() => {
  return new Set(
    purchases
      ?.filter(item => item.itemType === "album")
      .map(item => item.itemId)
  );
}, [purchases]);
  
  // ✅ Payment Gateway hook
  const { 
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo
  } = usePaymentGateway();
  
  // ✅ Separate loading states for actual payment processing
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const singlesScrollRef = useRef(null);
  const albumsScrollRef = useRef(null);

  // React Query for fetching song data
  const { data: song, isLoading, isError, error } = useSong(songId);
  const likedSongs =
  likedData?.pages?.flatMap((page) => page.songs) || [];

const isLiked = likedSongs.some(
  (likedSong) => likedSong._id === song?._id
);



  // Get artist ID from song
  const artistId = song?.artist?._id || song?.artist;

  // Fetch artist's singles
  const {
    data: singlesData,
    isLoading: singlesLoading,
  } = useArtistSingles(artistId, 10);

  // Fetch artist's albums
  const {
    data: artistAlbumsData,
    isLoading: albumsLoading
  } = useArtistAlbumsSimple(artistId, 10);

  // Current user from Redux
  const currentUser = useSelector((state) => state.auth?.user);
  

  // Get player state directly from Redux store
  const isPlaying = useSelector((state) => state.player?.isPlaying || false);
  const currentSong = useSelector((state) => state.player?.currentSong);
  const isCurrentSongPlaying = currentSong?._id === songId && isPlaying;

  // Check if song belongs to an album
  const isFromAlbum = Boolean(
    song?.album && Object.keys(song.album).length > 0
  );

  // Handle play/pause song
  const handlePlaySong = () => {
    if (song) {
      // Play the song
      if (currentSong?._id === songId && isPlaying) {
        dispatch(pause());
      } else {
        dispatch(setSelectedSong(song));
        dispatch(play());
      }
    }
  };

  // Handle play other songs - FIXED
  const handlePlayOtherSong = (songData) => { 
    // Play the song
    dispatch(setSelectedSong(songData));
    dispatch(play());
  };

  // Handle title click for singles - FIXED: Directly navigate
  const handleSingleTitleClick = (single) => {
    navigate(`/song/${single.slug || single._id}`);
  };

  // Handle cover image click
  const handleCoverClick = () => {
    handlePlaySong();
  };

  const handleToggleLike = (e) => {
  e.preventDefault();
  e.stopPropagation();

  likeMutation.mutate(song?._id, {
    onSuccess: () => {
      toast.success(
        isLiked
          ? "Removed from Liked Songs"
          : "Added to Liked Songs"
      );
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });
};




  // Check if song is purchased
  const isSubscriptionSong = song?.accessType === "subscription";

  // ✅ Purchase handler
  const handlePurchaseClick = (item, itemType, currencyData = null) => {
    setProcessingPayment(false);
    setPaymentLoading(false);
    openPaymentOptions(item, itemType, currencyData);
  };

  // ✅ Wrapper for payment method selection
  const handlePaymentMethodSelect = async (gateway) => {
    try {
      setProcessingPayment(true);
      setPaymentLoading(true);
      
      await originalHandlePaymentMethodSelect(gateway);
      
    } catch (error) {
      console.error('Payment method selection error:', error);
    } finally {
      setTimeout(() => {
        setProcessingPayment(false);
        setPaymentLoading(false);
      }, 1000);
    }
  };

  // ✅ Enhanced close handler
  const handleClosePaymentOptions = () => {
    setProcessingPayment(false);
    setPaymentLoading(false);
    closePaymentOptions();
  };

  const handleSubscribeDecision = (artist, type, data) => {
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);
    
    if (type === "purchase") {
      if (alreadySubscribed) {
        handlePurchaseClick(data, "song");
        return;
      }
      setModalArtist(artist);
      setModalType(type);
      setModalData(data);
      setSubscribeModalOpen(true);
      return;
    }
  };

  // Handle subscribe modal close
  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  // Extract artist singles
  const artistSingles = singlesData?.pages?.[0]?.songs || [];
  // Filter out current song from singles
  const filteredSingles = artistSingles.filter(single => single._id !== songId).slice(0, 10);

  // Extract artist albums
  const artistAlbums = artistAlbumsData?.albums || [];
  // Filter out current album if song is from album
  const filteredAlbums = isFromAlbum && song?.album?._id 
    ? artistAlbums.filter(album => album._id !== song.album._id)
    : artistAlbums;

  // Scroll handlers
  const handleScroll = (direction = "right", section = "singles") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    if (section === "singles") {
      singlesScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
      albumsScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
const isSongPurchased = purchasedSongIds.has(song?._id);
  // Get song price display
  const getSongPriceDisplay = (songItem) => {
  if (purchasedSongIds.has(songItem?._id)) {
  return (
    <span className="text-green-400 text-xs font-semibold">
      Purchased
    </span>
  );
}

  if (songItem?.accessType === "subscription") {
    return (
      <span className="text-blue-400 text-xs font-semibold">
        subs..
      </span>
    );
  }

  if (songItem?.accessType === "purchase-only") {
    const priceData = songItem?.basePrice;

    if (priceData?.amount > 0) {
      const symbol =
        priceData.currency === "USD" ? "$" : priceData.currency;

      const alreadySubscribed =
        hasArtistSubscriptionInPurchaseHistory(currentUser, songItem?.artist);

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (alreadySubscribed) {
              handlePurchaseClick(songItem, "song");
            } else {
              handleSubscribeDecision(songItem?.artist, "purchase", songItem);
            }
          }}
          className="text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded"
        >
          Buy {symbol}{priceData.amount}
        </button>
      );
    }

    if (priceData?.amount === 0) {
      return "Free";
    }
  }

  return null;
};


  // Get album price display
  const getAlbumPriceDisplay = (album) => {
    if (purchasedAlbumIds.has(album?._id)) {
  return (
    <span className="text-green-400 text-xs font-semibold">
      Purchased
    </span>
  );
}

    if (album.accessType === "subscription") {
      return <span className="text-blue-400 text-xs font-semibold">subs..</span>;
    }

    // Sirf purchase-only wale albums ke liye buy button
    if (album.accessType === "purchase-only") {
      if (album.basePrice && album.basePrice.amount > 0) {
        const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, album.artist);
        
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (alreadySubscribed) {
                handlePurchaseClick(album, "album");
              } else {
                handleSubscribeDecision(album.artist, "purchase", album);
              }
            }}
            className="text-white sm:text-xs text-[10px] sm:mt-0 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors relative"
          >
            {`Buy $${album.basePrice.amount}`}
          </button>
        );
      }
      
      if (album.basePrice && album.basePrice.amount === 0) {
        return "Free";
      }
    }

    return null;
  };

  // Main purchase button handler for current song
  const handleMainPurchaseClick = () => {
    if (!song) return;
    
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);
    
    if (alreadySubscribed) {
      handlePurchaseClick(song, "song");
    } else {
      handleSubscribeDecision(song.artist, "purchase", song);
    }
  };

  return (
    <>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white sm:px-8 px-4 pt-10 pb-8 relative">
          {/* Main Song Header */}
          {isLoading ? (
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
          ) : song ? (
            <>
              <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-8">
                {/* Song Cover with Hover Play Button - RESPONSIVE */}
                <div
                  className="relative group w-full max-w-[200px] sm:max-w-[300px] mx-0"
                  onMouseEnter={() => setIsHoveringCover(true)}
                  onMouseLeave={() => setIsHoveringCover(false)}
                >
                  <div className="relative w-full cursor-pointer">
                    <img
                      src={song?.coverImage || song?.album?.coverImage}
                      alt={`${song.title} cover`}
                      className="w-full max-w-[200px] sm:max-w-[300px] h-auto aspect-square object-cover rounded-2xl shadow-2xl transition-all duration-300 mx-auto"
                      onClick={handleCoverClick}
                    />
                    {/* Hover Overlay with Play Button */}
                    <div
                      className={`absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isHoveringCover ? "opacity-100" : "opacity-0"
                      }`}
                      onClick={handleCoverClick}
                    >
                      <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110">
                        {isCurrentSongPlaying ? (
                          <FaPause className="w-6 h-6 text-white" />
                        ) : (
                          <FaPlay className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                    </div>
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
                    {/* Purchase/Subscription Info - Sirf purchase-only ke liye */}
                    {song.accessType === "purchase-only" && song.basePrice?.amount > 0 && (
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
                            className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-blue-600 text-white rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base"
                          >
                            <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                            Purchase Song
                          </button>
                        )}
                      </>
                    )}

                    {song.accessType === "subscription" && (
                      <div className="subscription-wrapper">
                        <button className="subscription-card px-4 py-2.5 sm:px-6 sm:py-3.5 flex items-center gap-2 text-sm sm:text-base">
                          Subscription Access
                        </button>
                      </div>
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

                    {/* Share Button with Dropdown Component */}
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className={`p-2.5 sm:p-3.5 rounded-full border transition-colors group ${
                          showShareMenu 
                            ? "bg-gray-800/50 text-blue-400 border-blue-400" // Active state
                            : "text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-blue-400" // Normal state
                        }`}
                      >
                        <BsShare className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          showShareMenu ? "text-blue-400" : "group-hover:text-blue-400"
                        }`} />
                      </button>

                      <ShareDropdown
                        isOpen={showShareMenu}
                        onClose={() => setShowShareMenu(false)}
                        url={`${window.location}`}
                        title={song.title}
                        text={`Listen to "${song.title}" by ${
                          song.artist?.name || song.singer
                        } on Reset Music`}
                        isActive={showShareMenu}
                        className="lg:right-0 right-[-80px] sm:right-[-40px]" // Responsive positioning
                      />
                    </div>

                    {/* More Options Button */}
                    {/* <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="p-3.5 text-gray-300 rounded-full border border-gray-700 hover:cursor-pointer hover:bg-gray-800/50 transition-colors"
                    >
                      <FiMoreHorizontal className="w-5 h-5" />
                    </button> */}
                  </div>
                  
                  {/* Album Info if from album */}
                  {isFromAlbum && song?.album && (
                    <div className="mt-2">
                      <span className="text-gray-400 text-sm">From album: </span>
                      <button
                        onClick={() =>
                          navigate(
                            `/album/${song?.album?.slug || song?.album?._id}`
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
                      View Artist Profile →
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
                    {singlesLoading ? (
                      [...Array(5)].map((_, idx) => (
                        <div key={`single-skeleton-${idx}`} className="min-w-[140px] sm:min-w-[180px] flex-shrink-0">
                          <Skeleton className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-xl" />
                          <Skeleton width={120} height={16} className="mt-2" />
                          <Skeleton width={80} height={14} className="mt-1" />
                        </div>
                      ))
                    ) : (
                      filteredSingles.map((single) => (
                        <div key={single._id} className="min-w-[140px] sm:min-w-[180px] flex-shrink-0">
                          <RecentPlays
                            title={single.title}
                            image={
                              single.coverImage ? (
                                single.coverImage
                              ) : (
                                <div
                                  className={`w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] ${getArtistColor(single.artist?.name || single.singer)} flex items-center justify-center text-white font-bold text-xl sm:text-2xl`}
                                >
                                  {single.title ? single.title.charAt(0).toUpperCase() : "S"}
                                </div>
                              )
                            }
                            onPlay={() => handlePlayOtherSong(single)}
                            onTitleClick={() => handleSingleTitleClick(single)}
                            isSelected={currentSong?._id === single._id}
                            price={getSongPriceDisplay(single)}
                          />
                        </div>
                      ))
                    )}
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
                    {albumsLoading ? (
                      [...Array(5)].map((_, idx) => (
                        <div key={`album-skeleton-${idx}`} className="min-w-[130px] sm:min-w-[160px] flex-shrink-0">
                          <Skeleton className="w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] rounded-xl" />
                          <Skeleton width={100} height={16} className="mt-2" />
                        </div>
                      ))
                    ) : (
                      filteredAlbums.slice(0, 10).map((album) => (
                        <div key={album._id} className="min-w-[130px] sm:min-w-[160px] flex-shrink-0">
                          <AlbumCard
                            tag={`${album.title || "music"}`}
                            artists={album.artist?.name || "Various Artists"}
                            image={album.coverImage || "/images/placeholder.png"}
                            price={getAlbumPriceDisplay(album)}
                            onClick={() => navigate(`/album/${album.slug}`)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
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

      {/* Payment Method Modal */}
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