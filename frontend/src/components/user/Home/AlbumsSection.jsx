import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";

import AlbumCard from "../AlbumCard";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { fetchAllAlbums } from "../../../features/albums/albumsSlice";
import CurrencySelectionModal from "../CurrencySelectionModal";

const AlbumsSection = ({ 
  onPurchaseClick, 
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [albumsPage, setAlbumsPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const albumsStatus = useSelector((state) => state.albums.loading);
  const albumsTotalPages = useSelector((state) => state.albums.pagination.totalPages);
  const allAlbums = useSelector((state) => state.albums.allAlbums);

  // STRING TRUNCATION HELPER FUNCTION - YAHAN ADD KIYA GAYA HAI
  const truncateTitle = (title, maxLength = 50) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  const { lastElementRef } = useInfiniteScroll({
    hasMore: albumsPage < (albumsTotalPages || 1),
    loading: albumsStatus || loadingMore,
    onLoadMore: () => {
      if (albumsPage < (albumsTotalPages || 1) && !loadingMore) {
        setLoadingMore(true);
        setAlbumsPage(prev => prev + 1);
      }
    }
  });

  useEffect(() => {
    dispatch(fetchAllAlbums({ page: albumsPage, limit: 10 }))
      .then(() => {
        setLoadingMore(false);
      });
  }, [dispatch, albumsPage]);

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
        currency: currency.currency, amount: currency.amount, symbol: getCurrencySymbol(currency.currency)
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
    if (currentUser?.purchasedAlbums?.includes(album._id)) {
      return "Purchased";
    }

    if (album.accessType === "subscription") {
      return <span className="text-blue-400 text-xs font-semibold">subs..</span>;
    }

    if (album.accessType === "purchase-only") {
      if (album.basePrice && album.basePrice.amount > 0) {
        const basePrice = album.basePrice;
        const symbol = getCurrencySymbol(basePrice.currency);
        
        return (
          <button
            className={`text-white sm:text-xs text-[10px] sm:mt-0 px-3 py-1 rounded transition-colors relative ${
              processingPayment || paymentLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            onClick={() => handleAlbumPurchaseClick(album)}
            disabled={processingPayment || paymentLoading}
          >
            {processingPayment || paymentLoading ? "..." : `Buy ${symbol}${basePrice.amount}`}
          </button>
        );
      }
      
      if (album.basePrice && album.basePrice.amount === 0) {
        return "Free";
      }
    }

    return null;
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
        {albumsStatus && allAlbums.length === 0
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
                key={album._id}
                ref={idx === allAlbums.length - 1 ? lastElementRef : null}
              >
                <AlbumCard
                  tag={truncateTitle(album.title || "Album")} // YAHAN CHANGE KIYA GAYA HAI
                  artists={album.artist?.name || "Various Artists"}
                  image={album.coverImage || "/images/placeholder.png"}
                  price={getAlbumPriceDisplay(album)}
                  onClick={() => navigate(`/album/${album.slug}`)}
                />
              </div>
            ))}
        
        {loadingMore && albumsPage < albumsTotalPages && (
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
