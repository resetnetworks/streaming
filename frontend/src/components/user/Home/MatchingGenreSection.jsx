import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LuSquareChevronRight, LuSquareChevronLeft } from 'react-icons/lu';
import { BsSoundwave } from "react-icons/bs";
import { FaRobot } from 'react-icons/fa';
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

const getSongPriceDisplay = (
  song, 
  currentUser, 
  onPurchaseClick, 
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
  if (song.accessType === "purchase-only" && song.price > 0) {
    // Open modal like NewTracksSection, and prevent bubbling
    return (
      <button
        className={`text-white text-xs mt-2 px-3 py-1 rounded-full transition-colors ${
          processingPayment || paymentLoading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSubscribeRequired?.(song.artist, "purchase", song);
        }}
        disabled={processingPayment || paymentLoading}
        type="button"
      >
        {processingPayment || paymentLoading ? "..." : `Buy ₹${song.price}`}
      </button>
    );
  }
  if (song.accessType === "purchase-only" && song.price === 0) {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [debugInfo, setDebugInfo] = useState({});
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const limit = 10;

  const songs = useSelector(selectMatchingGenreSongs);
  const matchingGenres = useSelector(selectMatchingGenres);
  const status = useSelector(selectSongsStatus);
  const pagination = useSelector(selectMatchingGenrePagination);

  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);

  const isCacheValid = useSelector(selectIsMatchingGenreCacheValid);
  const isPageCached = useSelector(selectIsMatchingGenrePageCached(currentPage));
  const cachedPageData = useSelector(selectMatchingGenreCachedPageData(currentPage));

  useEffect(() => {
    const fetchSongs = async () => {
      if (!currentUser) return;

      if (isPageCached && isCacheValid && cachedPageData && hasInitialLoad) {
        dispatch(loadMatchingGenreFromCache(currentPage));
        return;
      }

      try {
        const result = await dispatch(fetchSongsMatchingUserGenres({ 
          page: currentPage, 
          limit 
        })).unwrap();
        
        setDebugInfo(result);
        setHasInitialLoad(true);

        dispatch(setMatchingGenreCachedData({
          page: currentPage,
          songs: result.songs,
          pagination: result.pagination,
          matchingGenres: result.matchingGenres
        }));
      } catch (error) {
        setDebugInfo({ error: error.toString() });
        toast.error(`Failed to load songs: ${error}`);
      }
    };

    fetchSongs();
  }, [dispatch, currentPage, currentUser, isPageCached, isCacheValid, cachedPageData, hasInitialLoad]);

  const onPlaySong = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      onSubscribeRequired?.(song.artist, "play", song);
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch, onSubscribeRequired]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleLoadMore = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full py-6">
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/30 rounded-xl p-6 text-center backdrop-blur-sm">
          <FaRobot className="text-4xl text-blue-400 mx-auto mb-3" />
          <h3 className="text-white text-lg font-semibold mb-2">AI Personalized Music</h3>
          <p className="text-gray-400">Please log in to see personalized song recommendations</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
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

  if (status === 'loading' && songs.length === 0) {
    return (
      <section className="w-full py-6">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
              <FaRobot className="text-white text-xl" />
            </div>
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
    <section className="w-full py-6">
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
            onClick={() => handleScroll('left')}
            className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
          >
            <LuSquareChevronLeft />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
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
          onScroll={(e) => {
            const { scrollLeft, scrollWidth, clientWidth } = e.target;
            if (scrollLeft + clientWidth >= scrollWidth - 10) {
              handleLoadMore();
            }
          }}
        >
          {songs.map((song, index) => (
            <MatchingGenreSong
              key={`matching-song-${song._id}-${index}`}
              title={song.title}
              artist={song.artist}
              album={song.album}
              image={song.coverImage || song.album?.coverImage}
              duration={song.duration}
              genre={song.genre}
              // Important: pass a node for price with stopPropagation and modal open
              price={getSongPriceDisplay(
                song, 
                currentUser, 
                onPurchaseClick, 
                onSubscribeRequired, 
                processingPayment, 
                paymentLoading
              )}
              onPlay={() => onPlaySong(song)}
              isPlaying={selectedSong?._id === song._id}
              isSelected={selectedSong?._id === song._id}
            />
          ))}

          {status === "loading" && songs.length > 0 && (
            <div className="flex-shrink-0 flex items-center justify-center min-w-[100px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MatchingGenreSection;
