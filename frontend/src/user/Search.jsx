import React, { useState, useEffect, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserHeader from "../components/user/UserHeader";
import RecentPlays from "../components/user/RecentPlays";
import AlbumCard from "../components/user/AlbumCard";
import PaymentMethodModal from "../components/user/PaymentMethodModal"; // ✅ Added import
import {
  fetchUnifiedSearchResults,
  clearSearchResults,
} from "../features/search/searchSlice";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { resetPaymentState } from "../features/payments/paymentSlice";
import {
  selectPaymentLoading,
  selectPaymentError,
} from "../features/payments/paymentSelectors";
import { usePaymentGateway } from "../hooks/usePaymentGateway";
import { hasArtistSubscriptionInPurchaseHistory } from "../utills/subscriptions";
import { toast } from "sonner";

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
  const debouncedQuery = useDebounce(query, 400); // 400ms delay

  const { results, loading, error } = useSelector((state) => state.search);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const currentUser = useSelector((state) => state.auth.user);
  
  // Payment state from Redux
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);

  // ✅ Use Payment Gateway Hook (same as Home page)
  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect,
    closePaymentOptions
  } = usePaymentGateway();

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

  // ✅ Updated Purchase Handler with Payment Method Selection
  const handlePurchaseClick = useCallback((item, type) => {
    if (!currentUser) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }

    if (paymentLoading) {
      toast.info("Payment already in progress...");
      return;
    }

    // ✅ Check subscription status for songs
    if (type === "song" && item.accessType === "purchase-only") {
      const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, item.artist);
      
      if (!alreadySubscribed) {
        toast.error("You need to subscribe to this artist first!");
        navigate(`/artist/${item.artist?.slug}`);
        return;
      }
    }

    // ✅ Open payment method selection modal
    openPaymentOptions(item, type);
  }, [currentUser, paymentLoading, navigate, openPaymentOptions]);

  // ✅ Updated function with payment method selection
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
            paymentLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handlePurchaseClick(song, "song");
          }}
          disabled={paymentLoading}
        >
          {paymentLoading ? "..." : `Buy ₹${song.price}`}
        </button>
      ) : // Then check if it's a free album song (purchase-only with price = 0)
      song.accessType === "purchase-only" && song.price === 0 ? (
        "album"
      ) : (
        "Free"
      )
    );
  };

  // ✅ Updated function with payment method selection
  const getAlbumPriceComponent = (album) => {
    if (album.price === 0) {
      return "subs..";
    } else if (currentUser?.purchasedAlbums?.includes(album._id)) {
      return "Purchased";
    } else {
      return (
        <button
          className={`text-white sm:text-xs text-[10px] sm:px-2 px-1 sm:mt-0 py-1 rounded transition-colors ${
            paymentLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handlePurchaseClick(album, "album");
          }}
          disabled={paymentLoading}
        >
          {paymentLoading ? "..." : `₹${album.price}`}
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

        {/* Result Section - Updated to remove "Discover" section */}
        <div className="flex flex-col items-start mt-10 px-6">
          {loading && <p className="text-white mt-4">Loading...</p>}
          {error && <p className="text-red-400 mt-4">{error}</p>}

          {/* ✅ REMOVED: Discover New Songs section - now shows nothing when empty */}
          {!query.trim() ? (
            // ✅ Clean empty state with just a simple message or nothing
            <div className="w-full text-center py-20">
              <div className="text-gray-400 space-y-2">
                <FiSearch className="mx-auto text-4xl mb-4 text-gray-500" />
                <p className="text-lg">Start typing to search</p>
                <p className="text-sm text-gray-500">Find your favorite songs, artists, and albums</p>
              </div>
            </div>
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
                  <div className="w-full text-center py-20">
                    <div className="text-gray-400 space-y-2">
                      <FiSearch className="mx-auto text-4xl mb-4 text-gray-500" />
                      <p className="text-lg">No results found for "{debouncedQuery}"</p>
                      <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        {/* ✅ Loading Overlay - Updated */}
        {paymentLoading && (
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

      {/* ✅ Payment Method Selection Modal */}
      <PaymentMethodModal
        open={showPaymentOptions}
        onClose={closePaymentOptions}
        onSelectMethod={handlePaymentMethodSelect}
        item={pendingPayment?.item}
        itemType={pendingPayment?.itemType}
      />
    </>
  );
};

export default Search;
