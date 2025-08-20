import React, { useState, useEffect, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserHeader from "../components/user/UserHeader";
import RecentPlays from "../components/user/RecentPlays";
import AlbumCard from "../components/user/AlbumCard";
import {
  fetchUnifiedSearchResults,
  clearSearchResults,
} from "../features/search/searchSlice";
import { fetchAllSongs } from "../features/songs/songSlice";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { initiateRazorpayItemPayment, resetPaymentState } from "../features/payments/paymentSlice";
import {
  selectPaymentLoading,
  selectPaymentError,
} from "../features/payments/paymentSelectors";
import { addPurchasedSong, addPurchasedAlbum } from "../features/auth/authSlice";
import { toast } from "sonner";

// Razorpay Script Loader
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

// ✅ Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ✅ URL Search Params Hook
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ Get query from URL or empty string
  const [query, setQuery] = useState(searchParams.get('q') || '');
  
  // ✅ Debounced query for auto-search
  const debouncedQuery = useDebounce(query, 400); // 300ms delay

  // Payment processing states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentRazorpayInstance, setCurrentRazorpayInstance] = useState(null);

  const { results, loading, error } = useSelector((state) => state.search);
  const trendingSongs = useSelector((state) => state.songs.songs);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const currentUser = useSelector((state) => state.auth.user);
  
  // Payment state from Redux
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);

  useEffect(() => {
    dispatch(fetchAllSongs());
    // Load Razorpay script on component mount
    loadRazorpayScript();
  }, [dispatch]);

  // Clear payment state on mount
  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  // ✅ Handle initial URL query parameter
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  // ✅ Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() !== '') {
      // Update URL with search query
      setSearchParams({ q: debouncedQuery }, { replace: true });
      // Trigger search
      dispatch(fetchUnifiedSearchResults(debouncedQuery));
    } else {
      // Clear URL params and results if empty
      setSearchParams({}, { replace: true });
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, setSearchParams, dispatch]);

  // ✅ Manual search (still useful for Enter key)
  const handleSearch = useCallback(() => {
    if (query.trim() !== "") {
      setSearchParams({ q: query });
      dispatch(fetchUnifiedSearchResults(query));
    } else {
      setSearchParams({});
      dispatch(clearSearchResults());
    }
  }, [query, setSearchParams, dispatch]);

  // ✅ Handle input change with real-time URL updates
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  // Razorpay Purchase Handler (keeping existing code)
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

  // Handle Razorpay Checkout with proper success handling (keeping existing code)
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

  const getRandomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Updated function with new price logic (keeping existing code)
  const getSongPriceComponent = (song) => {
    return (
      // First check if song is already purchased
      currentUser?.purchasedSongs?.includes(song._id) ? (
        "Purchased"
      ) : // Then check subscription songs first (they can have price = 0)
      song.accessType === "subscription" ? (
        "Subs.."
      ) : // Then check purchase-only songs with price > 0
      song.accessType === "purchase-only" && song.price > 0 ? (
        <button
          className={`text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 rounded transition-colors ${
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
      ) : // Then check if it's a free album song (purchase-only with price = 0)
      song.accessType === "purchase-only" && song.price === 0 ? (
        "album"
      ) : (
        "Free"
      )
    );
  };

  // Function to get price component for albums (keeping existing code)
  const getAlbumPriceComponent = (album) => {
    if (album.price === 0) {
      return "subs..";
    } else if (currentUser?.purchasedAlbums?.includes(album._id)) {
      return "Purchased";
    } else {
      return (
        <button
          className={`text-white sm:text-xs text-[10px] sm:px-2 px-1 sm:mt-0 py-1 rounded transition-colors ${
            processingPayment || paymentLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          onClick={() => handlePurchaseClick(album, "album")}
          disabled={processingPayment || paymentLoading}
        >
          {processingPayment || paymentLoading ? "..." : `₹${album.price}`}
        </button>
      );
    }
  };

  return (
    <>
      <UserHeader />
      <h1 className="text-xl text-center leading-none text-white">
        Search by artist, album, or song
      </h1>

      {/* ✅ Updated Search Bar with Auto-Search */}
      <div className="min-h-screen">
        <div className="w-full flex flex-col items-center px-8 sticky top-2 z-10 pt-4">
          <div className="flex items-center w-full max-w-3xl mx-auto p-[2px] rounded-2xl searchbar-container shadow-inner shadow-[#7B7B7B47] bg-gray-700">
            <div className="flex items-center flex-grow rounded-l-2xl bg-gray-700 relative">
              <FiSearch className="text-white mx-3" size={20} />
              <input
                type="text"
                placeholder="Search here..."
                className="w-full bg-transparent text-white placeholder-gray-400 py-2 pr-12 outline-none"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            {/* ✅ Optional Search Button (still useful for mobile/accessibility) */}
            <button
              className="bg-gradient-to-r from-[#1b233dfe] via-[#0942a4e1] via-40% to-[#0C63FF] text-white font-semibold py-2 px-6 rounded-r-2xl border-[1px] searchbar-button"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          
          {/* ✅ Auto-search indicator */}
          {query && query !== debouncedQuery && (
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
              Searching...
            </div>
          )}
        </div>

        {/* Result Section - keeping existing code */}
        <div className="flex flex-col items-start mt-10 px-6">
          {loading && <p className="text-white mt-4">Loading...</p>}
          {error && <p className="text-red-400 mt-4">{error}</p>}

          {!query.trim() ? (
            <>
              <h2 className="text-white text-lg mt-6 mb-2">
                Discover New Songs, Artists And Albums
              </h2>
              <div className="flex flex-wrap gap-6">
                {getRandomItems(trendingSongs, 10).map((song) => (
                  <RecentPlays
                    key={song._id}
                    title={song.title}
                    price={getSongPriceComponent(song)}
                    singer={song.artist?.name || "Unknown Artist"}
                    image={song.coverImage || "/images/placeholder.png"}
                    onPlay={() => handlePlaySong(song)}
                    isSelected={selectedSong?._id === song._id}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Songs */}
              {results?.songs?.length > 0 && (
                <>
                  <h2 className="text-blue-500 font-bold text-lg mt-6 mb-2">Songs</h2>
                  <div className="flex flex-wrap gap-6">
                    {results.songs.map((song) => (
                      <RecentPlays
                        key={song._id}
                        title={song.title}
                        price={getSongPriceComponent(song)}
                        singer={song.artist?.name || "Unknown"}
                        image={song.coverImage || "/images/placeholder.png"}
                        onPlay={() => handlePlaySong(song)}
                        isSelected={selectedSong?._id === song._id}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Artists */}
              {results?.artists?.length > 0 && (
                <>
                  <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Artists</h2>
                  <div className="flex flex-wrap gap-6">
                    {results.artists.map((artist) => (
                      <RecentPlays
                        key={artist._id}
                        title={artist.name}
                        price="Artist"
                        singer="Artist"
                        image={artist.image || "/images/placeholder.png"}
                        onPlay={() => navigate(`/artist/${artist.slug}`)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Albums */}
              {results?.albums?.length > 0 && (
                <>
                  <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Albums</h2>
                  <div className="flex flex-wrap gap-6">
                    {results.albums.map((album) => (
                      <div key={album._id}>
                        <AlbumCard
                          tag={`#${album.title || "music"}`}
                          artists={album.artist?.name || "Various Artists"}
                          image={album.coverImage || "/images/placeholder.png"}
                          price={getAlbumPriceComponent(album)}
                          onClick={() => navigate(`/album/${album.slug}`)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* No results */}
              {results?.songs?.length === 0 &&
                results?.artists?.length === 0 &&
                results?.albums?.length === 0 && 
                debouncedQuery.trim() !== '' && (
                  <p className="text-white/70 mt-8">No results found for "{debouncedQuery}".</p>
                )}
            </>
          )}
        </div>

        {/* Loading Overlay - keeping existing code */}
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

        {/* Payment Error Display - keeping existing code */}
        {paymentError && (
          <div className="fixed top-4 right-4 z-50 bg-red-900/90 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 text-red-300 max-w-sm">
            <p className="text-sm">
              {paymentError.message || "Payment failed. Please try again."}
            </p>
            <button
              onClick={() => dispatch(resetPaymentState())}
              className="text-xs text-red-400 hover:text-red-300 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Success Toast Enhancement - keeping existing code */}
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
      </div>
    </>
  );
};

export default Search;
