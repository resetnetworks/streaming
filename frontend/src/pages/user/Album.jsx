import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { BsShare } from "react-icons/bs";
import { FaPlay, FaPause } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";

// React Query
import { useAlbum } from "../../hooks/api/useAlbums";
import { useUserPurchases, userDashboardKeys } from "../../hooks/api/useUserDashboard";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";
import { usePaymentGateway } from "../../hooks/usePaymentGateway";

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
import CurrencySelectionModal from "../../components/user/CurrencySelectionModal";

// Skeleton
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Helpers
import { formatDuration } from "../../utills/helperFunctions";
import { hasArtistSubscriptionInPurchaseHistory } from "../../utills/subscriptions";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ✅ ArtistSinglesSection se same helper functions
const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹",
    CAD: "C$", AUD: "A$", CHF: "CHF", CNY: "¥", SEK: "kr",
    NZD: "NZ$", MXN: "$", SGD: "S$", HKD: "HK$", NOK: "kr",
    TRY: "₺", RUB: "₽", BRL: "R$", ZAR: "R",
  };
  return symbols[currency] || currency;
};

const getAvailableCurrencies = (item) => {
  if (!item?.basePrice || !item?.convertedPrices) return [];
  return [
    { currency: item.basePrice.currency, amount: item.basePrice.amount, isBaseCurrency: true },
    ...item.convertedPrices.map((price) => ({
      currency: price.currency,
      amount: price.amount,
      isBaseCurrency: false,
    })),
  ];
};

export default function Album() {
  const { albumId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shareBtnRef = useRef(null);
  const queryClient = useQueryClient();

  const [showFullDesc, setShowFullDesc] = useState(false);

  // React Query
  const { data: purchasesData } = useUserPurchases();
  const userPurchases = Array.isArray(purchasesData?.history)
    ? purchasesData.history
    : [];

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

  // ✅ Currency modal state — song aur album dono ke liye
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingPurchaseItem, setPendingPurchaseItem] = useState(null);
  const [pendingPurchaseType, setPendingPurchaseType] = useState(null);

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

  const isAlbumSongPlaying =
    selectedSong &&
    album?.songs?.some((s) => s._id === selectedSong._id) &&
    isSongPlaying(selectedSong._id);

  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  useEffect(() => {
    if (albumError) {
      toast.error("Failed to load album");
    }
  }, [albumError]);

  // ✅ Payment method select handler
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

  // ✅ Currency select handler — ArtistSinglesSection jaisa
  const handleCurrencySelect = (selectedCurrency) => {
    setShowCurrencyModal(false);
    if (pendingPurchaseItem && selectedCurrency) {
      openPaymentOptions(pendingPurchaseItem, pendingPurchaseType, {
        currency: selectedCurrency.currency,
        amount: selectedCurrency.amount,
        symbol: getCurrencySymbol(selectedCurrency.currency),
      });
    }
    setPendingPurchaseItem(null);
    setPendingPurchaseType(null);
  };

  const handleCloseCurrencyModal = () => {
    setShowCurrencyModal(false);
    setPendingPurchaseItem(null);
    setPendingPurchaseType(null);
  };

  // ✅ Main purchase click — subscription check → currency select → payment gateway
  const handlePurchaseClick = (item, type, currencyData = null) => {
    if (!currentUser) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }

    if (processingPayment || paymentLoading) {
      toast.info("Payment already in progress...");
      return;
    }

    const artist = album?.artist;
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(
      currentUser,
      artist
    );

    // Not subscribed + purchase-only → subscribe modal
    if (!alreadySubscribed) {
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

    // ✅ If currencyData already provided (from outside), skip currency modal
    if (currencyData) {
      openPaymentOptions(item, type, currencyData);
      return;
    }

    // ✅ Check available currencies — show modal if multiple
    const availableCurrencies = getAvailableCurrencies(item);

    if (availableCurrencies.length > 1) {
      setPendingPurchaseItem(item);
      setPendingPurchaseType(type);
      setShowCurrencyModal(true);
    } else if (availableCurrencies.length === 1) {
      const currency = availableCurrencies[0];
      openPaymentOptions(item, type, {
        currency: currency.currency,
        amount: currency.amount,
        symbol: getCurrencySymbol(currency.currency),
      });
    } else {
      // No converted prices — directly open payment
      openPaymentOptions(item, type, null);
    }
  };

  // Play handlers
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
    dispatch(setPlaybackContext({ type: "album", id: album._id, songs: album.songs }));
    dispatch(setSelectedSong(song));
    nextSongs.forEach((s) =>
      dispatch(addToQueue({ ...s, artistSlug: getArtistSlug(), albumSlug: album?.slug }))
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
    dispatch(setPlaybackContext({ type: "album", id: album._id, songs: album.songs }));
    dispatch(setSelectedSong({ ...album.songs[0], artistSlug: getArtistSlug(), albumSlug: album?.slug }));
    nextSongs.forEach((s) =>
      dispatch(addToQueue({ ...s, artistSlug: getArtistSlug(), albumSlug: album?.slug }))
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

  const artistName = React.useMemo(() => {
    if (!album) return "Unknown Artist";
    if (typeof album?.artist === "object") return album?.artist?.name;
    return "Unknown Artist";
  }, [album]);

  const DESCRIPTION_LIMIT = 300;
  const isLongDescription = album?.description?.length > DESCRIPTION_LIMIT;
  const displayedDescription = showFullDesc
    ? album?.description
    : album?.description?.slice(0, DESCRIPTION_LIMIT);

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
            <h2 className="text-2xl font-bold text-white mb-4">Album not found</h2>
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
        noIndex={true}
      />

      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white px-4 sm:px-8 pt-6 sm:pt-10 pb-8">
          {/* Album Header */}
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
              <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold my-1 sm:my-2">
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

                {/* Share Button */}
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
              {songs.map((song, index) => {
                const isSongPurchased = userPurchases.some(
                  (p) =>
                    p.itemType === "song" &&
                    String(p.itemId) === String(song._id)
                );

                // ✅ Song ka price display — currency symbol sahi
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
                          : `Buy ${getCurrencySymbol(song?.basePrice?.currency)}${song?.basePrice?.amount || song.price}`}
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
                    <div className="w-6 sm:w-8 text-center text-gray-400 font-medium text-sm sm:text-base">
                      {index + 1}
                    </div>
                    <div className="flex-1">
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
                        onTitleClick={() =>
                          navigate(`/song/${song?.slug || song?._id}`)
                        }
                        isSelected={selectedSong?._id === song._id}
                        price={songPriceDisplay}
                        shareUrl={`${window.location.origin}/song/${
                          song?.slug || song?._id
                        }`}
                        isShareDropdownOpen={
                          activeSongShareDropdown === song._id
                        }
                        onShareDropdownToggle={() =>
                          handleSongShareDropdownToggle(song._id)
                        }
                        onShareMenuClose={() =>
                          setActiveSongShareDropdown(null)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ✅ Currency Selection Modal */}
        <CurrencySelectionModal
          open={showCurrencyModal}
          onClose={handleCloseCurrencyModal}
          onSelectCurrency={handleCurrencySelect}
          item={pendingPurchaseItem}
          itemType={pendingPurchaseType}
        />

        {/* ✅ Payment Method Modal */}
        <PaymentMethodModal
          open={showPaymentOptions}
          onClose={handleClosePaymentOptions}
          onSelectMethod={handlePaymentMethodSelect}
          item={pendingPayment?.item}
          itemType={pendingPayment?.itemType}
          currencyData={pendingPayment?.currencyData}
          getPaymentDisplayInfo={getPaymentDisplayInfo}
        />

        {/* Subscribe Modal */}
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

        <style jsx="true" global="true">{`
          [data-sonner-toast] {
            background: rgb(31, 41, 55) !important;
            border: 1px solid rgb(75, 85, 99) !important;
            color: white !important;
          }
          [data-sonner-toast] [data-icon] {
            color: rgb(34, 197, 94) !important;
          }
        `}</style>
      </SkeletonTheme>
    </>
  );
}