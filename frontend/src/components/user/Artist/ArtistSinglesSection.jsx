// src/components/user/Artist/ArtistSinglesSection.jsx
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import RecentPlays from "../RecentPlays";
import { 
  selectSinglesByArtist, 
  selectHasArtistSingles,
  selectSinglesByArtistPagination 
} from "../../../features/songs/songSelectors";
import { fetchSinglesSongByArtist } from "../../../features/songs/songSlice";
import { setSelectedSong, play } from "../../../features/playback/playerSlice";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import CurrencySelectionModal from "../CurrencySelectionModal";

const getArtistColor = (name) => {
  if (!name) return "bg-blue-600";
  const colors = [
    "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-red-600",
    "bg-orange-600", "bg-yellow-600", "bg-green-600", "bg-teal-600", "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

const ArtistSinglesSection = ({ 
  artistId, 
  currentUser, 
  onPurchaseClick, 
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const singlesScrollRef = useRef(null);

  // Currency modal states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedSong, setSelectedSongForPurchase] = useState(null);

  const currentSelectedSong = useSelector((state) => state.player.selectedSong);
  
  // ✅ Updated selectors for singles by artist
  const artistSinglesData = useSelector(
    (state) => selectSinglesByArtist(state, artistId),
    shallowEqual
  );

  const hasArtistSingles = useSelector(
    (state) => selectHasArtistSingles(state, artistId)
  );

  const singlesPagination = useSelector(
    (state) => selectSinglesByArtistPagination(state, artistId),
    shallowEqual
  );

  const singlesStatus = useSelector((state) => state.songs.status);

  const {
    songs: artistSingles = [],
    pages: totalPages = 1,
  } = artistSinglesData || {};

  // ✅ Fetch singles on component mount
  useEffect(() => {
    if (artistId && !hasArtistSingles) {
      dispatch(fetchSinglesSongByArtist({ 
        artistId, 
        page: 1, 
        limit: 20 
      }));
    }
  }, [dispatch, artistId, hasArtistSingles]);

  const { lastElementRef: singlesLastRef } = useInfiniteScroll({
    hasMore: singlesPagination.hasMore,
    loading: singlesStatus === "loading",
    onLoadMore: () => {
      if (singlesPagination.hasMore && singlesStatus !== "loading") {
        dispatch(fetchSinglesSongByArtist({ 
          artistId, 
          page: singlesPagination.page + 1, 
          limit: 20 
        }));
      }
    }
  });

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const handleScroll = (direction = "right") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    singlesScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Currency helper functions - same as AlbumsSection
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr',
      'NZD': 'NZ$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
      'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R'
    };
    return symbols[currency] || currency;
  };

  const getAvailableCurrencies = (song) => {
    if (!song.basePrice || !song.convertedPrices) return [];
    
    const currencies = [
      { currency: song.basePrice.currency, amount: song.basePrice.amount, isBaseCurrency: true },
      ...song.convertedPrices.map(price => ({
        currency: price.currency, amount: price.amount, isBaseCurrency: false
      }))
    ];
    
    return currencies;
  };

  const handleSongPurchaseClick = (song) => {
    const availableCurrencies = getAvailableCurrencies(song);
    
    if (availableCurrencies.length > 1) {
      setSelectedSongForPurchase(song);
      setShowCurrencyModal(true);
    } else if (availableCurrencies.length === 1) {
      const currency = availableCurrencies[0];
      onPurchaseClick(song, "song", {
        currency: currency.currency, 
        amount: currency.amount, 
        symbol: getCurrencySymbol(currency.currency)
      });
    }
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setShowCurrencyModal(false);
    if (selectedSong && selectedCurrency) {
      onPurchaseClick(selectedSong, "song", {
        currency: selectedCurrency.currency, 
        amount: selectedCurrency.amount, 
        symbol: getCurrencySymbol(selectedCurrency.currency)
      });
    }
    setSelectedSongForPurchase(null);
  };

  const handleCloseCurrencyModal = () => {
    setShowCurrencyModal(false);
    setSelectedSongForPurchase(null);
  };

  // Song price display logic
  const getSongPriceDisplay = (song) => {
    // Priority 1: Agar user ne song pehle se khareed liya hai
    if (currentUser?.purchasedSongs?.includes(song._id)) {
      return "Purchased";
    }

    // Priority 2: Agar access type 'subscription' hai
    if (song.accessType === "subscription") {
      return <span className="text-blue-400 text-xs font-semibold">subs..</span>;
    }

    // Priority 3: Agar access type 'purchase-only' hai
    if (song.accessType === "purchase-only") {
      // Check karein ki price valid hai aur 0 se zyada hai
      if (song.basePrice && song.basePrice.amount > 0) {
        const basePrice = song.basePrice;
        const symbol = getCurrencySymbol(basePrice.currency);
        
        return (
          <button
            className={`text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 rounded transition-colors relative ${
              processingPayment || paymentLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            onClick={() => handleSongPurchaseClick(song)}
            disabled={processingPayment || paymentLoading}
          >
            {processingPayment || paymentLoading ? "..." : `Buy ${symbol}${basePrice.amount}`}
          </button>
        );
      }
      
      // Agar purchase-only hai lekin price 0 hai, to "album" dikhayein (part of album)
      if (song.basePrice && song.basePrice.amount === 0) {
        return "album";
      }
    }

    // Default case
    return "Free";
  };

  const renderCoverImage = (imageUrl, title, size = "w-full h-40", artistName) => {
    const artistColor = getArtistColor(artistName);
    return imageUrl ? (
      <img
        src={imageUrl}
        alt={title || "Cover"}
        className={`${size} object-cover`}
      />
    ) : (
      <div
        className={`${size} ${artistColor} flex items-center justify-center text-white font-bold text-2xl`}
      >
        {title ? title.charAt(0).toUpperCase() : "C"}
      </div>
    );
  };

  // Don't render if no singles available
  if (!hasArtistSingles && singlesStatus !== "loading" && artistSingles.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Singles</h2>
        <div className="flex items-center gap-2">
          <LuSquareChevronLeft
            className="text-white cursor-pointer hover:text-blue-800 text-lg"
            onClick={() => handleScroll("left")}
          />
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800 text-lg"
            onClick={() => handleScroll("right")}
          />
        </div>
      </div>
      
      <div
        ref={singlesScrollRef}
        className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
      >
        {singlesStatus === "loading" && artistSingles.length === 0
          ? [...Array(5)].map((_, idx) => (
              <div key={`single-skeleton-${idx}`} className="min-w-[160px]">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={120} height={16} className="mt-2" />
              </div>
            ))
          : artistSingles.map((song, idx) => (
              <RecentPlays
                ref={idx === artistSingles.length - 1 ? singlesLastRef : null}
                key={song._id}
                title={song.title}
                singer={song.singer}
                image={
                  song.coverImage
                    ? song.coverImage
                    : renderCoverImage(null, song.title, "w-full h-40", song.artist?.name)
                }
                onPlay={() => handlePlaySong(song)}
                isSelected={currentSelectedSong?._id === song._id}
                price={getSongPriceDisplay(song)}
              />
            ))}
        
        {/* Show loading indicator for pagination */}
        {singlesStatus === "loading" && artistSingles.length > 0 && (
          <div className="min-w-[160px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Currency Selection Modal */}
      <CurrencySelectionModal
        open={showCurrencyModal}
        onClose={handleCloseCurrencyModal}
        onSelectCurrency={handleCurrencySelect}
        item={selectedSong}
        itemType="song"
      />
    </>
  );
};

export default ArtistSinglesSection;
