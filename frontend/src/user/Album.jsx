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

// ✅ UPDATED IMPORTS - Add setPlaybackContext
import { setSelectedSong, play, setPlaybackContext } from "../features/playback/playerSlice";
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

  // ✅ UPDATED PLAY SONG HANDLER - SET ALBUM CONTEXT
  const handlePlaySong = (song) => {
    // Set album playback context when playing from album
    dispatch(setPlaybackContext({
      type: 'album',
      id: album._id,
      songs: songs // All songs in this album
    }));
    
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
      ? album?.artist?.name
      : artists.find((a) => a._id === album?.artist)?.name || "Unknown Artist";

  // ✅ NEW: Get artist slug for navigation
  const getArtistSlug = () => {
    if (typeof album?.artist === "object" && album?.artist?.slug) {
      return album?.artist?.slug;
    }
    const artistData = artists.find((a) => a._id === album?.artist);
    return artistData?.slug || null;
  };

  // ✅ REVERSE THE SONGS ORDER IS REMOVED - SHOW AS IS
  const songs = album?.songs ? [...album.songs] : [];

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
        <div className="min-h-screen text-white sm:px-8 px-4 pt-10 pb-8">
          {/* Header */}
          {loading || !album || artists.length === 0 ? (
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 pb-6">
              <Skeleton width={232} height={232} className="rounded-lg" />
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
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 pb-6">
              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt="Album Cover"
                  className="w-[232px] h-[232px] object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div
                  className={`w-[232px] h-[232px] ${artistColor} rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-4xl`}
                >
                  {album.title ? album.title.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              <div>
                <div className="text-sm font-bold tracking-widest uppercase opacity-80">
                  Album
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold my-2">
                  {album.title}
                </h1>
                <p className="text-lg text-gray-400">{album.description}</p>
                <div className="flex items-center gap-2 mt-4 flex-wrap text-sm md:text-base text-gray-300">
                  <span className="font-semibold">{artistName}</span>
                  <span className="text-xl">•</span>
                  <span>{formatDate(album.releaseDate)}</span>
                  <span className="text-xl">•</span>
                  <span>{songs.length} songs</span>
                  {/* ✅ ADD TOTAL DURATION */}
                  <span className="text-xl">•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                
                {/* ✅ UPDATED: Purchase Button OR Subscription Button */}
                <div className="flex items-center gap-4 mt-6">
                  {/* Purchase Button for Paid Albums */}
                  {album.price > 0 && !isSubscriptionAlbum && (
                    <>
                      <span className="text-lg font-semibold text-blue-400">
                        ₹{album.price}
                      </span>
                      {isAlbumPurchased ? (
                        <span className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold">
                          Purchased
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseClick(album, "album")}
                          disabled={processingPayment || paymentLoading}
                          className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md ${
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
                      <span className="text-lg font-semibold text-blue-400">
                        Subscription
                      </span>
                      <button
                        onClick={() => navigate(`/artist/${getArtistSlug()}`)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 shadow-md flex items-center gap-2"
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

          {/* Song List */}
          {loading || !album || artists.length === 0 ? (
            <div className="flex flex-col gap-4">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={`song-skeleton-${idx}`}
                  className="flex items-center gap-4"
                >
                  <Skeleton width={50} height={50} className="rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton width={160} height={14} />
                    <Skeleton width={100} height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center text-gray-400 mt-8 text-lg">
              No songs in this album.
            </div>
          ) : (
            <>
              {/* ✅ SONGS WITH NUMBERING */}
              {songs.map((song, index) => (
                <div key={song._id} className="mb-4 flex items-center gap-4">
                  {/* ✅ TRACK NUMBER ON LEFT */}
                  <div className="w-8 text-center text-gray-400 font-medium">
                    {index + 1}
                  </div>
                  
                  {/* ✅ SONG COMPONENT */}
                  <div className="flex-1">
                    <SongList
                      songId={song._id}
                      img={song.coverImage || album.coverImage}
                      songName={song.title} // ✅ REMOVED SLICE - FULL NAME NOW
                      singerName={song.singer}
                      seekTime={formatDuration(song.duration)}
                      onPlay={() => handlePlaySong(song)}
                      isSelected={selectedSong?._id === song._id}
                      // ✅ UPDATED SONG PURCHASE WITH RAZORPAY
                      price={
                        song.accessType === "purchase-only" && !isAlbumPurchased ? (
                          currentUser?.purchasedSongs?.includes(song._id) ? (
                            "Purchased"
                          ) : (
                            <button
                              className={`text-white text-xs px-2 py-1 rounded transition-colors ${
                                processingPayment || paymentLoading
                                  ? "bg-gray-500 cursor-not-allowed"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}
                              onClick={() => handlePurchaseClick(song, "song")}
                              disabled={processingPayment || paymentLoading}
                            >
                              {processingPayment || paymentLoading 
                                ? "..." 
                                : `Buy ₹${song.price}`
                              }
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
            </>
          )}
        </div>

        {/* ✅ ADD LOADING OVERLAY */}
        {(processingPayment || paymentLoading) && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <div className="text-center">
                <p className="text-white text-lg font-semibold">Processing Payment</p>
                <p className="text-gray-300 text-sm mt-1">Please wait, do not close this window</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ADD SUCCESS TOAST ENHANCEMENT */}
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