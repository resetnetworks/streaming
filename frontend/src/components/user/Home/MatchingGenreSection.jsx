import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LuSquareChevronRight, LuSquareChevronLeft } from 'react-icons/lu';
import { BsSoundwave } from "react-icons/bs";
import Skeleton from 'react-loading-skeleton';
import { toast } from "sonner";

import MatchingGenreSong from '../MatchingGenreSong';
import { 
  fetchSongsMatchingUserGenres,
  loadMatchingGenreFromCache,
  setMatchingGenreCachedData 
} from '../../../features/songs/songSlice';
import { 
  selectMatchingGenreSongs,
  selectMatchingGenres,
  selectSongsStatus,
  selectIsMatchingGenreCacheValid,
  selectIsMatchingGenrePageCached,
  selectMatchingGenreCachedPageData,
  selectMatchingGenrePagination
} from '../../../features/songs/songSelectors';

import { handlePlaySong } from "../../../utills/songHelpers";
import CurrencySelectionModal from '../CurrencySelectionModal';

const getSongPriceDisplay = (
  song, 
  currentUser, 
  onSongPurchaseClick, 
  onSubscribeRequired, 
  processingPayment, 
  paymentLoading
) => {
  if (currentUser?.purchasedSongs?.includes(song._id)) {
    return <span className="text-green-400 text-xs font-semibold">Purchased</span>;
  }
  if (song.accessType === "subscription") {
    return <span className="text-blue-300 text-xs font-semibold">Subs..</span>;
  }
  if (song.accessType === "purchase-only" && song?.basePrice?.amount > 0) {
    return (
      <button
        className={`text-white text-xs mt-2 px-3 py-1 rounded-full transition-colors ${
          processingPayment || paymentLoading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSongPurchaseClick(song);
        }}
        disabled={processingPayment || paymentLoading}
        type="button"
      >
        {processingPayment || paymentLoading ? "..." : `Buy $${song?.basePrice?.amount}`}
      </button>
    );
  }
  if (song?.accessType === "purchase-only" && song?.convertedPrices[0]?.amount === 0) {
    return <span className="text-blue-300 text-xs font-semibold">album</span>;
  }
  return <span className="text-blue-300 text-xs font-semibold">Free</span>;
};

const MatchingGenreSection = ({ 
  onSubscribeRequired,
  onPurchaseClick, 
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  // Keep a stable, append-only merged list to avoid blinking
  const [merged, setMerged] = useState([]); // [{...song}]
  const [pageLoaded, setPageLoaded] = useState(new Set()); // track which pages loaded
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Fix: Currency selection modal states - different variable name
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedSongForPurchase, setSelectedSongForPurchase] = useState(null);

  // Preserve scroll position across renders/appends
  const pendingScrollLeftRef = useRef(null);

  // Current page and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Redux selectors
  const reduxSongs = useSelector(selectMatchingGenreSongs); // may be last fetched set
  const matchingGenres = useSelector(selectMatchingGenres);
  const status = useSelector(selectSongsStatus);
  const pagination = useSelector(selectMatchingGenrePagination);

  const currentUser = useSelector((state) => state.auth.user);
  // Fix: Different variable name to avoid conflict
  const currentlyPlayingSong = useSelector((state) => state.player.selectedSong);

  const isCacheValid = useSelector(selectIsMatchingGenreCacheValid);
  const isPageCached = useSelector(selectIsMatchingGenrePageCached(currentPage));
  const cachedPageData = useSelector(selectMatchingGenreCachedPageData(currentPage));

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

  // Handle song purchase with currency selection
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
    if (selectedSongForPurchase && selectedCurrency) {
      onPurchaseClick(selectedSongForPurchase, "song", {
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

  // Unique by _id helper
  const mergeUnique = useCallback((prev, next) => {
    const seen = new Set(prev.map(s => s._id));
    const out = [...prev];
    for (const s of next) {
      if (!seen.has(s._id)) {
        seen.add(s._id);
        out.push(s);
      }
    }
    return out;
  }, []);

  // Load a page with cache awareness
  const loadPage = useCallback(async (page) => {
    if (!currentUser) return;
    if (pageLoaded.has(page)) return; // already merged this page into local
    setLoadingMore(true);

    try {
      if (isPageCached && isCacheValid && cachedPageData && page === currentPage && hasInitialLoad) {
        // hydrate from redux cache to local merged
        const fromCache = cachedPageData.songs || [];
        setMerged(prev => mergeUnique(prev, fromCache));
        setPageLoaded(prev => new Set(prev).add(page));
        setLoadingMore(false);
        return;
      }

      const result = await dispatch(fetchSongsMatchingUserGenres({ page, limit })).unwrap();

      // write page to redux cache
      dispatch(setMatchingGenreCachedData({
        page,
        songs: result.songs,
        pagination: result.pagination,
        matchingGenres: result.matchingGenres
      }));

      // append to local merged
      setMerged(prev => mergeUnique(prev, result.songs));
      setPageLoaded(prev => new Set(prev).add(page));
      setHasInitialLoad(true);
    } catch (error) {
      toast.error(`Failed to load songs: ${error}`);
    } finally {
      setLoadingMore(false);
    }
  }, [
    currentUser,
    pageLoaded,
    isPageCached,
    isCacheValid,
    cachedPageData,
    currentPage,
    hasInitialLoad,
    dispatch,
    limit,
    mergeUnique
  ]);

  // Initial load
  useEffect(() => {
    setMerged([]); // reset when user changes
    setPageLoaded(new Set());
    setCurrentPage(1);
    setHasInitialLoad(false);
  }, [currentUser._id]);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  // Preserve scrollLeft around merges
  useEffect(() => {
    if (!scrollRef.current) return;
    if (pendingScrollLeftRef.current == null) return;
    const target = pendingScrollLeftRef.current;
    pendingScrollLeftRef.current = null;
    // Use rAF to ensure DOM updated
    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollLeft = target;
    });
  }, [merged]);

  const onPlaySong = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      onSubscribeRequired?.(song.artist, "play", song);
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch, onSubscribeRequired]);

  const handleScrollArrows = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  // IntersectionObserver for infinite load (sentinel)
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const root = scrollRef.current || null;

    const io = new IntersectionObserver(
      (entries) => {
        const last = entries[0];
        if (last.isIntersecting && !loadingMore && pagination && currentPage < (pagination.totalPages || Infinity)) {
          // preserve current scrollLeft before appending
          if (scrollRef.current) {
            pendingScrollLeftRef.current = scrollRef.current.scrollLeft;
          }
          setCurrentPage(p => p + 1);
        }
      },
      {
        root,
        rootMargin: '200px', // prefetch a bit earlier
        threshold: 0.1
      }
    );

    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [loadingMore, pagination, currentPage]);

  // Also support manual infinite load via scroll end
  const onHorizontalScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    // Save position so back navigation feels natural
    // No state update to avoid re-render; ref only
    // If near end, trigger next page
    const nearEnd = scrollLeft + clientWidth >= scrollWidth - 10;
    if (nearEnd && !loadingMore && pagination && currentPage < (pagination.totalPages || Infinity)) {
      pendingScrollLeftRef.current = scrollLeft;
      setCurrentPage(p => p + 1);
    }
  };

  // Loading skeleton for very first load only
  if (!currentUser) {
    return (
      <div className="w-full py-0">
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/30 rounded-xl p-6 text-center backdrop-blur-sm">
          <div className="text-white text-lg font-semibold mb-2">AI Personalized Music</div>
          <p className="text-gray-400">Please log in to see personalized song recommendations</p>
        </div>
      </div>
    );
  }

  if (status === 'failed' && !hasInitialLoad) {
    return (
      <div className="w-full py-6">
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6 text-center backdrop-blur-sm">
          <h3 className="text-red-400 text-lg font-semibold mb-2">Failed to Load</h3>
          <p className="text-gray-400 mb-4">Unable to fetch personalized recommendations</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if ((status === 'loading' && !hasInitialLoad) || (merged.length === 0 && status === 'loading')) {
    return (
      <section className="w-full py-0">
        <div className="w-full flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg" />
            <div>
              <Skeleton width={200} height={24} baseColor="#1a2238" highlightColor="#243056" />
              <Skeleton width={150} height={16} baseColor="#1a2238" highlightColor="#243056" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, idx) => (
            <div key={`matching-skeleton-${idx}`} className="flex-shrink-0">
              <Skeleton 
                height={240} 
                width={180} 
                className="rounded-xl" 
                baseColor="#1a2238"
                highlightColor="#243056"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full py-0">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg backdrop-blur-md border border-white/10">
              <img
                src={`${window.location.origin}/icon.png`}
                alt="AI Recommendations"
                className="w-6 h-6"
              />
            </div>
            <div>
              <h2 className="md:text-xl text-lg font-semibold text-white">
                Created For You
              </h2>
              <p className="text-gray-400 text-sm">
                Based on your music taste • {matchingGenres?.slice(0, 3).join(', ') || 'Loading...'}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleScrollArrows('left')}
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              type="button"
            >
              <LuSquareChevronLeft />
            </button>
            <button
              onClick={() => handleScrollArrows('right')}
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              type="button"
            >
              <LuSquareChevronRight />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-6">
          <BsSoundwave className="text-blue-400 text-lg animate-pulse" />
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 via-indigo-500/50 to-blue-500/30" />
          <BsSoundwave className="text-blue-400 text-lg animate-pulse" />
        </div>

        {/* Songs */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar"
            style={{ scrollSnapType: "x mandatory" }}
            onScroll={onHorizontalScroll}
          >
            {merged.map((song, index) => (
              <MatchingGenreSong
                key={`matching-song-${song._id}-${index}`}
                title={song.title}
                artist={song.artist}
                album={song.album}
                image={song.coverImage || song.album?.coverImage}
                duration={song.duration}
                price={getSongPriceDisplay(
                  song, 
                  currentUser, 
                  handleSongPurchaseClick, 
                  onSubscribeRequired, 
                  processingPayment, 
                  paymentLoading
                )}
                onPlay={() => onPlaySong(song)}
                isPlaying={currentlyPlayingSong?._id === song._id}
                isSelected={currentlyPlayingSong?._id === song._id}
              />
            ))}

            {/* Loading spinner while appending more */}
            {loadingMore && (
              <div className="flex-shrink-0 flex items-center justify-center min-w-[100px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} className="w-1 h-1" />
          </div>
        </div>
      </section>

      {/* Currency Selection Modal */}
      <CurrencySelectionModal
        open={showCurrencyModal}
        onClose={handleCloseCurrencyModal}
        onSelectCurrency={handleCurrencySelect}
        item={selectedSongForPurchase}
        itemType="song"
      />
    </>
  );
};

export default MatchingGenreSection;
