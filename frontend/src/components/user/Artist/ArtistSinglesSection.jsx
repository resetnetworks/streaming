// src/components/user/Artist/ArtistSinglesSection.jsx
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import RecentPlays from "../RecentPlays";
import { setSelectedSong, play } from "../../../features/playback/playerSlice";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import CurrencySelectionModal from "../CurrencySelectionModal";
import { useArtistSingles } from "../../../hooks/api/useSongs";
import { useNavigate } from "react-router-dom";

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
  artist,
  onPurchaseClick, 
  onSubscribeRequired,
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const singlesScrollRef = useRef(null);
  const navigate = useNavigate()

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedSong, setSelectedSongForPurchase] = useState(null);

  const currentSelectedSong = useSelector((state) => state.player.selectedSong);
  
  const {
    data: singlesData,
    isLoading: singlesLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useArtistSingles(artistId, 20);

  const artistSingles = singlesData?.pages?.flatMap(page => page.songs) || [];  
  const singlesPagination = singlesData?.pages?.[0]?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const { lastElementRef: singlesLastRef } = useInfiniteScroll({
    hasMore: !!hasNextPage,
    loading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const handleScroll = (direction = "right") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    singlesScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

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

  const getSongPriceDisplay = (song) => {
    if (currentUser?.purchasedSongs?.includes(song._id)) {
      return "Purchased";
    }

    if (song.accessType === "subscription") {
      return <span className="text-blue-400 text-xs font-semibold">subs..</span>;
    }

    if (song.accessType === "purchase-only") {
      if (song?.price && song?.price?.amount > 0) {
        const basePrice = song?.price;
        const symbol = getCurrencySymbol(basePrice.currency);
        
        return (
          <button
            className={`text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 rounded transition-colors relative ${
              processingPayment || paymentLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSongPurchaseClick(song);
            }}
            disabled={processingPayment || paymentLoading}
          >
            {processingPayment || paymentLoading ? "..." : `Buy ${symbol}${basePrice.amount}`}
          </button>
        );
      }
      
      if (song.basePrice && song.basePrice.amount === 0) {
        return "album";
      }
    }

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

  if (!singlesLoading && artistSingles.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Singles</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Page {singlesPagination.page} of {singlesPagination.totalPages}
          </span>
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
        {singlesLoading && artistSingles.length === 0
          ? [...Array(5)].map((_, idx) => (
              <div key={`single-skeleton-${idx}`} className="min-w-[160px]">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={120} height={16} className="mt-2" />
              </div>
            ))
          : artistSingles.map((song, idx) => (
              <RecentPlays
                onTitleClick={() => navigate(`/song/${song.slug}`)}
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
        
        {isFetchingNextPage && hasNextPage && artistSingles.length > 0 && (
          [...Array(2)].map((_, idx) => (
            <div key={`single-loading-${idx}`} className="min-w-[160px]">
              <Skeleton height={160} width={160} className="rounded-xl" />
              <Skeleton width={120} height={16} className="mt-2" />
            </div>
          ))
        )}
      </div>

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