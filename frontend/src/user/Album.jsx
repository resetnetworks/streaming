import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";

import { fetchAlbumById } from "../features/albums/albumsSlice";
import {
  selectAlbumDetails,
  selectAlbumsLoading,
} from "../features/albums/albumsSelector";

import { fetchAllArtists } from "../features/artists/artistsSlice";
import { selectAllArtists } from "../features/artists/artistsSelectors";

import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";

// ✅ ADD RAZORPAY IMPORTS
import { initiateRazorpayItemPayment, resetPaymentState } from "../features/payments/paymentSlice";
import { addPurchasedSong, addPurchasedAlbum } from "../features/auth/authSlice";

// Skeleton
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ✅ ADD RAZORPAY SCRIPT LOADER
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

  const album = useSelector(selectAlbumDetails);
  const loading = useSelector(selectAlbumsLoading);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const currentUser = useSelector((state) => state.auth.user);
  const artists = useSelector(selectAllArtists);

  // ✅ ADD RAZORPAY PAYMENT STATE
  const paymentLoading = useSelector((state) => state.payment.loading);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentRazorpayInstance, setCurrentRazorpayInstance] = useState(null);

  useEffect(() => {
    if (albumId) dispatch(fetchAlbumById(albumId));
    dispatch(fetchAllArtists());
  }, [albumId, dispatch]);

  // ✅ ADD CLEAR PAYMENT STATE ON MOUNT
  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  // ✅ ADD RAZORPAY PURCHASE HANDLER
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

    try {
      setProcessingPayment(true);
      
      // Load Razorpay script first
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }
      
      // Dispatch Razorpay order creation
      const result = await dispatch(initiateRazorpayItemPayment({
        itemType: type,
        itemId: item._id,
        amount: item.price
      })).unwrap();

      if (result.order) {
        await handleRazorpayCheckout(result.order, item, type);
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  // ✅ ADD RAZORPAY CHECKOUT HANDLER
  const handleRazorpayCheckout = async (order, item, type) => {
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'musicreset',
        description: `Purchase ${type}: ${item.title || item.name}`,
        image: `${window.location.origin}/icon.png`,
        handler: function (response) {
          // Immediately close modal and show success
          if (currentRazorpayInstance) {
            try {
              currentRazorpayInstance.close();
            } catch (e) {
              // Razorpay instance already closed
            }
          }

          // ✅ IMMEDIATELY UPDATE REDUX STATE
          if (type === "song") {
            dispatch(addPurchasedSong(item._id));
          } else if (type === "album") {
            dispatch(addPurchasedAlbum(item._id));
          }

          // Show success message
          toast.success(`Successfully purchased ${item.title || item.name}!`, {
            duration: 5000,
          });
          
          // Reset states
          setProcessingPayment(false);
          setCurrentRazorpayInstance(null);
          dispatch(resetPaymentState());
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
            setProcessingPayment(false);
            setCurrentRazorpayInstance(null);
          }
        },
        error: function(error) {
          toast.error('Payment failed. Please try again.');
          setProcessingPayment(false);
          setCurrentRazorpayInstance(null);
        }
      };

      const rzp = new window.Razorpay(options);
      setCurrentRazorpayInstance(rzp);
      
      rzp.on('payment.success', function (response) {
        // Additional success handling if needed
      });

      rzp.on('payment.error', function (error) {
        toast.error('Payment failed. Please try again.');
        setProcessingPayment(false);
        setCurrentRazorpayInstance(null);
      });

      rzp.open();

    } catch (error) {
      toast.error('Failed to open payment gateway');
      setProcessingPayment(false);
      setCurrentRazorpayInstance(null);
    }
  };

  const artistName =
    typeof album?.artist === "object"
      ? album.artist.name
      : artists.find((a) => a._id === album?.artist)?.name || "Unknown Artist";

  // ✅ NEW: Get artist slug for navigation
  const getArtistSlug = () => {
    if (typeof album?.artist === "object" && album.artist.slug) {
      return album.artist.slug;
    }
    const artistData = artists.find((a) => a._id === album?.artist);
    return artistData?.slug || null;
  };

  // ✅ REVERSE THE SONGS ORDER
  const songs = album?.songs ? [...album.songs].reverse() : [];

  // Check if album is purchased
  const isAlbumPurchased = currentUser?.purchasedAlbums?.includes(album?._id);

  // ✅ NEW: Check if album is subscription type
  const isSubscriptionAlbum = album?.accessType === 'subscription' || album?.price === 0;

  // ✅ CALCULATE TOTAL DURATION
  const totalDuration = songs.reduce((total, song) => total + (song.duration || 0), 0);

  // Generate color from artist name (same logic as Artist page)
  const getArtistColor = (name) => {
    if (!name) return "bg-blue-600";
    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-red-600",
      "bg-orange-600",
      "bg-yellow-600",
      "bg-blue-600",
      "bg-teal-600",
      "bg-indigo-600",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const artistColor = getArtistColor(artistName);

  return (
   <>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        {/* ✅ RESPONSIVE CONTAINER */}
        <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-8 max-w-7xl mx-auto">
          
          {/* ✅ LEFT-ALIGNED RESPONSIVE HEADER */}
          {loading || !album || artists.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8 pb-6">
              <div className="flex-shrink-0">
                <Skeleton width={200} height={200} className="rounded-lg sm:w-[232px] sm:h-[232px]" />
              </div>
              <div className="flex-1 w-full">
                <Skeleton width={80} height={18} />
                <Skeleton width="100%" height={36} className="mt-2 max-w-md" />
                <Skeleton width="100%" height={16} className="mt-2 max-w-lg" />
                <div className="flex flex-wrap gap-2 mt-4">
                  <Skeleton width={100} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={120} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={80} height={14} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8 pb-6">
              {/* ✅ RESPONSIVE ALBUM COVER */}
              <div className="flex-shrink-0">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt="Album Cover"
                    className="w-48 h-48 sm:w-56 sm:h-56 lg:w-[232px] lg:h-[232px] object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div
                    className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-[232px] lg:h-[232px] ${artistColor} rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-3xl sm:text-4xl`}
                  >
                    {album.title ? album.title.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
              </div>
              
              {/* ✅ LEFT-ALIGNED ALBUM INFO */}
              <div className="flex-1 w-full">
                <div className="text-xs sm:text-sm font-bold tracking-widest uppercase opacity-80">
                  Album
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold my-2 leading-tight">
                  {album.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-400 mb-4 max-w-2xl">
                  {album.description}
                </p>
                
                {/* ✅ LEFT-ALIGNED ALBUM METADATA */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base text-gray-300">
                  <span className="font-semibold">{artistName}</span>
                  <span className="text-sm sm:text-xl">•</span>
                  <span className="whitespace-nowrap">{formatDate(album.releaseDate)}</span>
                  <span className="text-sm sm:text-xl">•</span>
                  <span className="whitespace-nowrap">{songs.length} songs</span>
                  <span className="text-sm sm:text-xl">•</span>
                  <span className="whitespace-nowrap">{formatDuration(totalDuration)}</span>
                </div>
                
                {/* ✅ LEFT-ALIGNED PURCHASE/SUBSCRIPTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mt-4 sm:mt-6">
                  {/* Purchase Button for Paid Albums */}
                  {album.price > 0 && !isSubscriptionAlbum && (
                    <>
                      <span className="text-base sm:text-lg font-semibold text-blue-400">
                        ₹{album.price}
                      </span>
                      {isAlbumPurchased ? (
                        <span className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-sm sm:text-base">
                          Purchased
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseClick(album, "album")}
                          disabled={processingPayment || paymentLoading}
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-200 shadow-md text-sm sm:text-base ${
                            processingPayment || paymentLoading
                              ? "bg-gray-500 cursor-not-allowed text-gray-300"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {processingPayment || paymentLoading 
                            ? "Processing..." 
                            : "Purchase Album"
                          }
                        </button>
                      )}
                    </>
                  )}

                  {/* ✅ NEW: Subscription Button for Subscription Albums */}
                  {isSubscriptionAlbum && getArtistSlug() && (
                    <>
                      <span className="text-base sm:text-lg font-semibold text-blue-400">
                        Subscription
                      </span>
                      <button
                        onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 shadow-md flex items-center gap-2 text-sm sm:text-base"
                      >
                        <span>View Artist</span>
                        <svg 
                          className="w-4 h-4" 
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
          )}

          {/* ✅ RESPONSIVE SONG LIST */}
          {loading || !album || artists.length === 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={`song-skeleton-${idx}`}
                  className="flex items-center gap-3 sm:gap-4"
                >
                  <Skeleton width={30} height={30} className="rounded-full flex-shrink-0" />
                  <Skeleton width={40} height={40} className="rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton width="70%" height={16} className="mb-1" />
                    <Skeleton width="50%" height={14} />
                  </div>
                  <Skeleton width={60} height={24} className="rounded flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : songs.length === 0 ? (
            <div className="text-left text-gray-400 mt-8 text-base sm:text-lg">
              No songs in this album.
            </div>
          ) : (
            <div className="w-full overflow-x-hidden space-y-2 sm:space-y-3">
              {/* ✅ FULLY RESPONSIVE SONGS WITH NUMBERING */}
              {songs.map((song, index) => (
                <div 
                  key={song._id} 
                  className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full min-w-0"
                >
                  {/* ✅ RESPONSIVE TRACK NUMBER */}
                  <div className="w-6 sm:w-8 text-center text-gray-400 font-medium flex-shrink-0 text-sm sm:text-base">
                    {index + 1}
                  </div>
                  
                  {/* ✅ RESPONSIVE SONG COMPONENT */}
                  <div className="flex-1 min-w-0 w-full">
                    <SongList
                      songId={song._id}
                      img={song.coverImage || album.coverImage}
                      songName={song.title}
                      singerName={song.singer}
                      seekTime={formatDuration(song.duration)}
                      onPlay={() => handlePlaySong(song)}
                      isSelected={selectedSong?._id === song._id}
                      // ✅ RESPONSIVE SONG PURCHASE BUTTON
                      price={
                        song.accessType === "purchase-only" && !isAlbumPurchased ? (
                          currentUser?.purchasedSongs?.includes(song._id) ? (
                            <span className="text-xs sm:text-sm text-green-400 whitespace-nowrap">
                              Purchased
                            </span>
                          ) : (
                            <button
                              className={`text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors whitespace-nowrap ${
                                processingPayment || paymentLoading
                                  ? "bg-gray-500 cursor-not-allowed"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}
                              onClick={() => handlePurchaseClick(song, "song")}
                              disabled={processingPayment || paymentLoading}
                            >
                              {processingPayment || paymentLoading 
                                ? "..." 
                                : `₹${song.price}`
                              }
                            </button>
                          )
                        ) : isAlbumPurchased ? (
                          <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                            Included
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-blue-400 whitespace-nowrap">
                            Subs..
                          </span>
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ RESPONSIVE LOADING OVERLAY */}
        {(processingPayment || paymentLoading) && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 sm:p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
              <div className="text-center">
                <p className="text-white text-base sm:text-lg font-semibold">Processing Payment</p>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">Please wait, do not close this window</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ TOAST STYLING */}
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
