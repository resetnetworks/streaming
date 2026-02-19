import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";

import AlbumCard from "../AlbumCard";
import { useAlbumsInfinite } from "../../../hooks/api/useAlbums";
import CurrencySelectionModal from "../CurrencySelectionModal";

const AlbumsSection = ({ 
  onPurchaseClick, 
  processingPayment, 
  paymentLoading 
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const purchases = useSelector((state) => state.userDashboard.purchases);


  // Use React Query for infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useAlbumsInfinite({ limit: 10 });


  // Flatten all pages into a single array
  const allAlbums = data?.pages?.flatMap(page => page.data || []) || [];



  // STRING TRUNCATION HELPER FUNCTION
  const truncateTitle = (title, maxLength = 50) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Infinite scroll handler
  const lastElementRef = useRef(null);

  const handleScroll = (direction = "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
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

  const getAvailableCurrencies = (album) => {
    if (!album?.basePrice || !album?.convertedPrices) return [];
    
    const currencies = [
      { currency: album?.basePrice?.currency, amount: album?.basePrice?.amount, isBaseCurrency: true },
      ...album?.convertedPrices.map(price => ({
        currency: price?.currency, amount: price?.amount, isBaseCurrency: false
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
        currency: currency?.currency, amount: currency?.amount, symbol: getCurrencySymbol(currency?.currency)
      });
    }
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setShowCurrencyModal(false);
    if (selectedAlbum && selectedCurrency) {
      onPurchaseClick(selectedAlbum, "album", {
        currency: selectedCurrency.currency, amount: selectedCurrency.amount, symbol: getCurrencySymbol(selectedCurrency.currency)
      });
    }
    setSelectedAlbum(null);
  };

  const handleCloseCurrencyModal = () => {
    setShowCurrencyModal(false);
    setSelectedAlbum(null);
  };
  
const getAlbumPriceDisplay = (album) => {
  // Normalize purchased albums array safely
  const purchasedAlbumsArray = Array.isArray(purchases)
    ? purchases
    : purchases?.albums || [];

  // Strict ID comparison (no undefined match possible)
  const isPurchased = purchasedAlbumsArray.some((purchased) => {
    const purchasedId = purchased?._id || purchased?.id;
    const albumId = album?._id || album?.id;

    return purchasedId && albumId && purchasedId === albumId;
  });

  if (isPurchased) {
    return (
      <span className="text-green-400 text-xs font-semibold">
        Purchased
      </span>
    );
  }

  // Subscription albums
  if (album?.accessType === "subscription") {
    return (
      <span className="text-blue-400 text-xs font-semibold">
        subs..
      </span>
    );
  }

  // One-time purchase albums
  if (album?.accessType === "purchase-only") {
    if (album?.basePrice?.amount > 0) {
      const basePrice = album.basePrice;
      const symbol = getCurrencySymbol(basePrice.currency);

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
            : `Buy ${symbol}${basePrice.amount}`}
        </button>
      );
    }

    if (album?.basePrice?.amount === 0) {
      return "Free";
    }
  }

  return null;
};



  // Intersection Observer callback for infinite scroll
  const observerCallback = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Set up intersection observer for the last element
  const setLastElementRef = (node) => {
    if (lastElementRef.current) {
      // Cleanup previous observer
      // (Observer will be cleaned up automatically when element is unmounted)
    }

    if (node) {
      lastElementRef.current = node;
      const observer = new IntersectionObserver(observerCallback, {
        threshold: 0.1,
        root: scrollRef.current,
      });
      observer.observe(node);
    }
  };

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <h2 className="md:text-xl text-lg font-semibold">
          new albums for you
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            title="Back"
          >
            <LuSquareChevronLeft />
          </button>
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            title="Next"
          >
            <LuSquareChevronRight />
          </button>
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[220px]"
      >
        {status === "loading" && allAlbums.length === 0
          ? [...Array(7)].map((_, idx) => (
              <div
                key={`album-skeleton-${idx}`}
                className="min-w-[160px] flex flex-col gap-2 skeleton-wrapper"
              >
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={100} height={12} />
              </div>
            ))
          : allAlbums.map((album, idx) => (
              <div
                key={album?.id || idx}
                ref={idx === allAlbums.length - 1 ? setLastElementRef : null}
              >
                <AlbumCard
                  tag={truncateTitle(album.title || "Album")}
                  artists={album?.artist?.name || "Various Artists"}
                  image={album?.coverImage || "/images/placeholder.png"}
                  price={getAlbumPriceDisplay(album)}
                  onClick={() => navigate(`/album/${album?.slug}`)}
                />
              </div>
            ))}
        
        {isFetchingNextPage && (
          <div className="min-w-[160px] flex flex-col gap-2 skeleton-wrapper">
            <Skeleton height={160} width={160} className="rounded-xl" />
            <Skeleton width={100} height={12} />
          </div>
        )}
      </div>

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

export default AlbumsSection;