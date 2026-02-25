// src/components/user/Artist/ArtistAlbumsSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import AlbumCard from "../AlbumCard";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import CurrencySelectionModal from "../CurrencySelectionModal";
import { useArtistAlbums } from "../../../hooks/api/useAlbums";

const ArtistAlbumsSection = ({ 
  artistId, 
  onPurchaseClick, 
  processingPayment, 
  paymentLoading,
  purchases = [],
}) => {
  const navigate = useNavigate();
  const recentScrollRef = useRef(null);
  
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // React Query hook for artist albums
  const { 
    data: artistAlbumsData,
    isLoading: albumsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useArtistAlbums(artistId, 10);

  // Extract albums from all pages
  const artistAlbums = artistAlbumsData?.pages?.flatMap(page => page.albums) || [];
  
  // Extract pagination info
  const artistAlbumPagination = artistAlbumsData?.pages?.[0]?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  // Use infinite scroll hook
  const { lastElementRef: albumsLastRef } = useInfiniteScroll({
    hasMore: !!hasNextPage,
    loading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const handleScroll = (direction = "right") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    recentScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Currency helper functions
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr',
      'NZD': 'NZ$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
      'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R'
    };
    return symbols[currency] || currency;
  };

  const getAvailableCurrencies = (album) => {
    if (!album.basePrice || !album.convertedPrices) return [];
    
    const currencies = [
      { currency: album.basePrice.currency, amount: album.basePrice.amount, isBaseCurrency: true },
      ...album.convertedPrices.map(price => ({
        currency: price.currency, amount: price.amount, isBaseCurrency: false
      }))
    ];
    
    return currencies;
  };

  const handleAlbumPurchaseClick = (album) => {
    const availableCurrencies = getAvailableCurrencies(album);
    
    if (availableCurrencies.length > 1) {
      setSelectedAlbum(album);
      setShowCurrencyModal(true);
    } else if (availableCurrencies.length === 1) {
      const currency = availableCurrencies[0];
      onPurchaseClick(album, "album", {
        currency: currency.currency, 
        amount: currency.amount, 
        symbol: getCurrencySymbol(currency.currency)
      });
    }
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setShowCurrencyModal(false);
    if (selectedAlbum && selectedCurrency) {
      onPurchaseClick(selectedAlbum, "album", {
        currency: selectedCurrency.currency, 
        amount: selectedCurrency.amount, 
        symbol: getCurrencySymbol(selectedCurrency.currency)
      });
    }
    setSelectedAlbum(null);
  };

  const handleCloseCurrencyModal = () => {
    setShowCurrencyModal(false);
    setSelectedAlbum(null);
  };

  // Album price display logic
const getAlbumPriceDisplay = (album) => {
  const isPurchased = purchases.some((purchase) => {
    return (
      purchase?.itemType === "album" &&
      String(purchase.itemId) === String(album._id)
    );
  });

  if (isPurchased) {
    return (
      <span className="text-green-400 text-xs font-semibold">
        Purchased
      </span>
    );
  }

  if (album.accessType === "subscription") {
    return (
      <span className="text-blue-400 text-xs font-semibold">
        subs..
      </span>
    );
  }

  if (album.accessType === "purchase-only") {
    if (album.basePrice?.amount > 0) {
      const symbol = getCurrencySymbol(album.basePrice.currency);

      return (
        <button
          className={`text-white sm:text-xs text-[10px] px-3 py-1 rounded ${
            processingPayment || paymentLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          onClick={() => handleAlbumPurchaseClick(album)}
          disabled={processingPayment || paymentLoading}
        >
          {processingPayment || paymentLoading
            ? "..."
            : `Buy ${symbol}${album.basePrice.amount}`}
        </button>
      );
    }

    if (album.basePrice?.amount === 0) {
      return "Free";
    }
  }

  return null;
};

  return (
    <>
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Albums</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Page {artistAlbumPagination.page} of {artistAlbumPagination.totalPages}
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
      
      <div className="px-6 py-2">
        <div
          ref={recentScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[220px]"
        >
          {albumsLoading && artistAlbums.length === 0 ? (
            [...Array(5)].map((_, idx) => (
              <div key={`album-skeleton-${idx}`} className="min-w-[160px]">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={120} height={16} className="mt-2" />
              </div>
            ))
          ) : artistAlbums.length > 0 ? (
            <>
              {artistAlbums.map((album, idx) => (
                <AlbumCard
                  key={album._id}
                  ref={idx === artistAlbums.length - 1 ? albumsLastRef : null}
                  tag={`${album.title || "music"}`}
                  artists={album.artist?.name || "Various Artists"}
                  image={album.coverImage || "/images/placeholder.png"}
                  price={getAlbumPriceDisplay(album)}
                  onClick={() => navigate(`/album/${album.slug}`)}
                />
              ))}
              {isFetchingNextPage &&
                hasNextPage &&
                [...Array(2)].map((_, idx) => (
                  <div key={`album-loading-${idx}`} className="min-w-[160px]">
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={120} height={16} className="mt-2" />
                  </div>
                ))}
            </>
          ) : (
            <p className="text-white text-sm">No albums found.</p>
          )}
        </div>
      </div>

      {/* Currency Selection Modal */}
      <CurrencySelectionModal
        open={showCurrencyModal}
        onClose={handleCloseCurrencyModal}
        onSelectCurrency={handleCurrencySelect}
        item={selectedAlbum}
        itemType="album"
      />
    </>
  );
};

export default ArtistAlbumsSection;