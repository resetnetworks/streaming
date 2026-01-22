// src/pages/Album.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { BsShare } from "react-icons/bs";

// ✅ REACT QUERY for album data
import { useAlbum } from "../../hooks/api/useAlbums";

// ✅ REDUX for player
import {
  setSelectedSong,
  play,
  pause,
  setPlaybackContext,
} from "../../features/playback/playerSlice";

// ✅ REDUX for payment
import {
  initiateRazorpayItemPayment,
  resetPaymentState,
} from "../../features/payments/paymentSlice";
import {
  addPurchasedSong,
  addPurchasedAlbum,
} from "../../features/auth/authSlice";

// Components
import UserHeader from "../../components/user/UserHeader";
import SongList from "../../components/user/SongList";
import PageSEO from "../../components/PageSeo/PageSEO";
import SubscribeModal from "../../components/user/SubscribeModal";
import ShareDropdown from "../../components/user/ShareDropdown";

// Skeleton
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Helper functions
import { formatDuration } from "../../utills/helperFunctions";

// Subscription utilities
import { hasArtistSubscriptionInPurchaseHistory } from "../../utills/subscriptions";

// ✅ RAZORPAY Script Loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Format date helper
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Album() {
  const { albumId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ REACT QUERY: Album data
  const {
    data: album,
    isLoading: albumLoading,
    error: albumError,
    refetch: refetchAlbum,
  } = useAlbum(albumId);

  // ✅ REDUX
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const isPlaying = useSelector((state) => state.player?.isPlaying || false);
  const currentUser = useSelector((state) => state.auth.user);
  const paymentLoading = useSelector((state) => state.payment.loading);

  // Local states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentRazorpayInstance, setCurrentRazorpayInstance] = useState(null);
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  // ✅ Subscription modal state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  // ✅ Share menu state
  const [showShareMenu, setShowShareMenu] = useState(false);

  // ✅ Clear payment state on mount
  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  // ✅ Handle album loading error
  useEffect(() => {
    if (albumError) {
      toast.error("Failed to load album");
      console.error("Album loading error:", albumError);
    }
  }, [albumError]);

  // ✅ Play song handler
  const handlePlaySong = (song) => {
    if (!album) return;

    dispatch(
      setPlaybackContext({
        type: "album",
        id: album._id,
        songs: album.songs,
      })
    );

    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  // ✅ Play album (first song) when cover is clicked
  const handlePlayAlbum = () => {
    if (!album || !album.songs || album.songs.length === 0) {
      toast.error("No songs in this album");
      return;
    }

    dispatch(
      setPlaybackContext({
        type: "album",
        id: album._id,
        songs: album.songs,
      })
    );

    dispatch(setSelectedSong(album.songs[0]));
    dispatch(play());
  };

  // ✅ Purchase handler with subscription check
  const handlePurchaseClick = async (item, type) => {
    if (!currentUser) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }

    if (paymentLoading || processingPayment) {
      toast.info("Payment already in progress...");
      return;
    }

    // ✅ Check if user has subscription for this artist
    const artist = album?.artist;
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(
      currentUser,
      artist
    );

    if (type === "song") {
      // For individual song purchase
      if (!alreadySubscribed && item.accessType === "purchase-only") {
        // Show subscription modal
        setModalArtist(artist);
        setModalType("purchase");
        setModalData(item);
        setSubscribeModalOpen(true);
        return;
      }
    } else if (type === "album") {
      // For album purchase
      if (!alreadySubscribed && album.accessType === "purchase-only") {
        // Show subscription modal
        setModalArtist(artist);
        setModalType("purchase");
        setModalData(item);
        setSubscribeModalOpen(true);
        return;
      }
    }

    // If already subscribed or not a purchase-only item, proceed with payment
    await processPayment(item, type);
  };

  // ✅ Process payment
  const processPayment = async (item, type) => {
    try {
      setProcessingPayment(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      const result = await dispatch(
        initiateRazorpayItemPayment({
          itemType: type,
          itemId: item._id,
          amount: item.price || item.basePrice?.amount,
        })
      ).unwrap();

      if (result.order) {
        await handleRazorpayCheckout(result.order, item, type);
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  // ✅ Razorpay checkout handler
  const handleRazorpayCheckout = async (order, item, type) => {
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "musicreset",
        description: `Purchase ${type}: ${item.title || item.name}`,
        image: `${window.location.origin}/icon.png`,
        handler: function (response) {
          if (currentRazorpayInstance) {
            try {
              currentRazorpayInstance.close();
            } catch (e) {}
          }

          // Update Redux state
          if (type === "song") {
            dispatch(addPurchasedSong(item._id));
          } else if (type === "album") {
            dispatch(addPurchasedAlbum(item._id));
          }

          toast.success(`Successfully purchased ${item.title || item.name}!`, {
            duration: 5000,
          });

          setProcessingPayment(false);
          setCurrentRazorpayInstance(null);
          dispatch(resetPaymentState());
          refetchAlbum(); // Refresh album data
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          contact: currentUser?.phone || "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setProcessingPayment(false);
            setCurrentRazorpayInstance(null);
          },
        },
        error: function (error) {
          toast.error("Payment failed. Please try again.");
          setProcessingPayment(false);
          setCurrentRazorpayInstance(null);
        },
      };

      const rzp = new window.Razorpay(options);
      setCurrentRazorpayInstance(rzp);

      rzp.on("payment.error", function (error) {
        toast.error("Payment failed. Please try again.");
        setProcessingPayment(false);
        setCurrentRazorpayInstance(null);
      });

      rzp.open();
    } catch (error) {
      toast.error("Failed to open payment gateway");
      setProcessingPayment(false);
      setCurrentRazorpayInstance(null);
    }
  };

  // ✅ Handle subscribe modal close
  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  // ✅ Get artist name
  const artistName = React.useMemo(() => {
    if (!album) return "Unknown Artist";
    if (typeof album.artist === "object") return album.artist.name;
    return "Unknown Artist";
  }, [album]);

  // ✅ Get artist slug
  const getArtistSlug = () => {
    if (typeof album?.artist === "object" && album?.artist?.slug) {
      return album?.artist?.slug;
    }
    return null;
  };

  // ✅ Check purchase status
  const songs = album?.songs ? [...album.songs] : [];
  const isAlbumPurchased = currentUser?.purchasedAlbums?.includes(album?._id);
  const isSubscriptionAlbum =
    album?.accessType === "subscription" || album?.price === 0;
  const totalDuration = songs.reduce(
    (total, song) => total + (song.duration || 0),
    0
  );

  // ✅ Loading state
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
                  <Skeleton width={12} height={14} />
                  <Skeleton width={80} height={14} />
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

  // ✅ Error state
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

  // ✅ Main render
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
          byArtist: {
            "@type": "MusicGroup",
            name: artistName,
          },
          numTracks: songs.length,
          datePublished: album.releaseDate,
        }}
        noIndex={true}
      />

      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white px-4 sm:px-8 pt-6 sm:pt-10 pb-8">
          {/* Album Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-8 pb-6">
            {/* Album Cover with Click to Play - RESPONSIVE */}
            <div
              className="relative cursor-pointer flex-shrink-0 w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] mx-0"
              onMouseEnter={() => setIsHoveringCover(true)}
              onMouseLeave={() => setIsHoveringCover(false)}
              onClick={handlePlayAlbum}
            >
              <img
                src={album.coverImage}
                alt="Album Cover"
                className="w-full aspect-square object-cover rounded-xl shadow-2xl transition-opacity duration-300"
              />
              {/* Hover Overlay with Play Icon */}
              <div
                className={`absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center transition-opacity duration-300 ${
                  isHoveringCover ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-0.5 sm:ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="text-xs sm:text-sm font-bold tracking-widest uppercase opacity-80">
                Album
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold my-1 sm:my-2">
                {album.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-400">
                {album.description}
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

              {/* Purchase/Subscription Buttons */}
              <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
                {album?.basePrice?.amount > 0 && !isSubscriptionAlbum && (
                  <>
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1 md:px-5 md:py-3 bg-gray-800 rounded-full border border-gray-700">
                      <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                        ${album.basePrice.amount}
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

                {/* Share Button with Dropdown Component */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`p-2 sm:p-2.5 md:p-3.5 rounded-full border transition-colors group ${
                      showShareMenu
                        ? "bg-gray-800/50 text-blue-400 border-blue-400" // Active state
                        : "text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-blue-400" // Normal state
                    }`}
                  >
                    <BsShare
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
                    url={`${window.location}`}
                    title={album.title}
                    text={`Listen to "${album.title}" by ${
                      album.artist?.name || artistName
                    } on Reset Music`}
                    isActive={showShareMenu}
                    className="lg:right-0 right-[-80px] sm:right-[-40px]" // Responsive positioning
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
              {songs.map((song, index) => (
                <div key={song._id} className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4">
                  <div className="w-6 sm:w-8 text-center text-gray-400 font-medium text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <SongList
                      songId={song._id}
                      img={song.coverImage || album.coverImage}
                      songName={song.title}
                      singerName={song.singer}
                      seekTime={formatDuration(song.duration)}
                      onPlay={() => handlePlaySong(song)}
                      onTitleClick={() =>
                        navigate(`/song/${song?.slug || song?._id}`)
                      }
                      isSelected={selectedSong?._id === song._id}
                      price={
                        song.accessType === "purchase-only" &&
                        !isAlbumPurchased ? (
                          currentUser?.purchasedSongs?.includes(song._id) ? (
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
                                : `Buy ₹${song.price}`}
                            </button>
                          )
                        ) : isAlbumPurchased ? (
                          "Included"
                        ) : (
                          "Subs.."
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Loading Overlay */}
        {(processingPayment || paymentLoading) && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 sm:p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
              <div className="text-center">
                <p className="text-white text-base sm:text-lg font-semibold">
                  Processing Payment
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">
                  Please wait, do not close this window
                </p>
              </div>
            </div>
          </div>
        )}

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