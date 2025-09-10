// src/pages/GenrePage.jsx (corrected pagination)
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  fetchSongsByGenre,
  setGenreCachedData,
  loadGenreFromCache,
  clearGenreSongs, // Add this action
} from "../features/songs/songSlice";
import {
  selectSongsStatus,
  selectGenreSongs,
  selectGenreSongsPages,
  selectGenreSongsTotal,
  selectIsGenreCacheValid,
  selectIsGenrePageCached,
  selectGenreCachedPageData,
} from "../features/songs/songSelectors";
import UserHeader from "../components/user/UserHeader";
import GenreSongRow from "../components/user/GenreSongRow";
import SubscribeModal from "../components/user/SubscribeModal";
import LoadingOverlay from "../components/user/Home/LoadingOverlay";
import { hasArtistSubscriptionInPurchaseHistory } from "../utills/subscriptions";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { useRazorpayPayment } from "../hooks/useRazorpayPayment";
import {useInfiniteScroll} from "../hooks/useInfiniteScroll";

const genreAssets = {
  electronic: { label: "Electronic" },
  ambient: { label: "Ambient" },
  idm: { label: "IDM" },
  experimental: { label: "Experimental" },
  "avant-garde": { label: "Avant Garde" },
  noise: { label: "Noise" },
  downtempo: { label: "Downtempo" },
  soundtrack: { label: "Soundtrack" },
  industrial: { label: "Industrial" },
  ebm: { label: "EBM" },
  electro: { label: "Electro" },
  techno: { label: "Techno" },
  dance: { label: "Dance" },
  electronica: { label: "Electronica" },
  "sound-art": { label: "Sound Art" },
  jazz: { label: "Jazz" },
  classical: { label: "Classical" },
  "classical-crossover": { label: "Classical Crossover" },
  soundscapes: { label: "Soundscapes" },
  "field-recordings": { label: "Field Recordings" },
};

const toGenreKey = (v) =>
  (v || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/%20/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const GenrePage = () => {
  const { genre: rawParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  
  // Use the same Razorpay hook as Home
  const {
    handlePurchaseClick,
    processingPayment,
    paymentLoading,
  } = useRazorpayPayment();
  
  // Modal state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const limit = 20;
  
  // Redux selectors
  const status = useSelector(selectSongsStatus);
  const songs = useSelector(selectGenreSongs);
  const totalPages = useSelector(selectGenreSongsPages);
  const total = useSelector(selectGenreSongsTotal);
  
  const { displayTitle, headerLabel } = useMemo(() => {
    let decoded = "";
    try {
      decoded = decodeURIComponent(rawParam || "");
    } catch {
      decoded = rawParam || "";
    }
    const key = toGenreKey(decoded);
    const fromStateTitle = location.state?.title;
    const titleCase = decoded
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const mapped = genreAssets[key];
    return {
      displayTitle: fromStateTitle || titleCase,
      headerLabel: fromStateTitle || mapped?.label || titleCase,
    };
  }, [location.state, rawParam]);

  // Reset state when genre changes
  useEffect(() => {
    setCurrentPage(1);
    setHasInitialLoad(false);
    setIsLoadingMore(false);
    // Clear existing songs when genre changes
    dispatch(clearGenreSongs());
  }, [displayTitle, dispatch]);

  // Load initial page
  useEffect(() => {
    if (!displayTitle || hasInitialLoad) return;
    
    let cancelled = false;
    
    const loadInitialData = async () => {
      try {
        const result = await dispatch(
          fetchSongsByGenre({ 
            genre: displayTitle, 
            page: 1, 
            limit,
            append: false // First load, don't append
          })
        ).unwrap();
        
        if (cancelled) return;
        
        dispatch(
          setGenreCachedData({
            genre: displayTitle,
            page: 1,
            songs: result.songs,
            pagination: result.pagination,
          })
        );
        
        setHasInitialLoad(true);
      } catch (error) {
        console.error("Failed to load initial genre data:", error);
      }
    };

    loadInitialData();
    
    return () => {
      cancelled = true;
    };
  }, [displayTitle, hasInitialLoad, dispatch, limit]);

  // Load more function for infinite scroll
  const loadMore = useCallback(async () => {
    if (!displayTitle || isLoadingMore || !hasInitialLoad) return;
    if (currentPage >= totalPages) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await dispatch(
        fetchSongsByGenre({ 
          genre: displayTitle, 
          page: nextPage, 
          limit,
          append: true // Append to existing songs
        })
      ).unwrap();
      
      dispatch(
        setGenreCachedData({
          genre: displayTitle,
          page: nextPage,
          songs: result.songs,
          pagination: result.pagination,
        })
      );
      
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Failed to load more songs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [displayTitle, currentPage, totalPages, isLoadingMore, hasInitialLoad, dispatch, limit]);

  // Infinite scroll setup
  const hasMore = totalPages > 0 && currentPage < totalPages;
  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    loading: isLoadingMore || status === "loading",
    onLoadMore: loadMore,
  });

  const loadingInitial = (status === "loading" && !hasInitialLoad) || (!hasInitialLoad && songs.length === 0);

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleSubscribeDecision = useCallback(
    (artist, type, data) => {
      const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);
      if (type === "purchase") {
        if (alreadySubscribed) {
          handlePurchaseClick(data, "song");
          return;
        }
        setModalArtist(artist);
        setModalType(type);
        setModalData(data);
        setSubscribeModalOpen(true);
        return;
      }
      if (type === "play") {
        if (alreadySubscribed) {
          setSubscribeModalOpen(false);
          return;
        }
        setModalArtist(artist);
        setModalType(type);
        setModalData(data);
        setSubscribeModalOpen(true);
        return;
      }
      setModalArtist(artist);
      setModalType(type);
      setModalData(data);
      setSubscribeModalOpen(true);
    },
    [currentUser, handlePurchaseClick]
  );

  const handlePlay = useCallback(
    (song) => {
      const purchased = currentUser?.purchasedSongs?.includes(song._id);
      const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);
      
      if (song.accessType === "subscription" && !alreadySubscribed) {
        handleSubscribeDecision(song.artist, "play", song);
        return;
      }
      if (song.accessType === "purchase-only" && song.price > 0 && !purchased) {
        if (alreadySubscribed) {
          handlePurchaseClick(song, "song");
        } else {
          handleSubscribeDecision(song.artist, "purchase", song);
        }
        return;
      }
      dispatch(setSelectedSong(song));
      dispatch(play());
    },
    [currentUser, dispatch, handleSubscribeDecision, handlePurchaseClick]
  );

  return (
    <>
      <UserHeader />
      
      {/* Header */}
      <div className="w-full">
        <div className="relative w-full h-40 sm:h-52 md:h-64 lg:h-72 overflow-hidden bg-black flex items-center justify-center text-center">
          <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22)_0%,rgba(0,0,0,0.0)_55%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_2px,transparent_2px,transparent_8px)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#10153e8f] to-[#0E43CA]" />
          <div className="relative z-10 px-4">
            <h1 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
              {headerLabel}
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1">{total} tracks</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 py-4">
        {loadingInitial ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`sk-${i}`} className="h-12 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No tracks found in this genre.</div>
        ) : (
          <>
            <div className="divide-y divide-gray-800 rounded-lg overflow-hidden border border-gray-800">
              {songs.map((song, index) => {
                const purchased = currentUser?.purchasedSongs?.includes(song._id);
                const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);
                
                // Apply lastElementRef to the last item for infinite scroll
                const isLastItem = index === songs.length - 1;
                
                return (
                  <div
                    key={song._id}
                    ref={isLastItem ? lastElementRef : null}
                  >
                    <GenreSongRow
                      song={song}
                      seekTime={song.durationLabel || song.duration || ""}
                      isSelected={false}
                      onPlay={handlePlay}
                      onSubscribeRequired={(artist, type, data) => {
                        handleSubscribeDecision(artist, type, data);
                      }}
                      onPurchaseClick={(item) => {
                        handlePurchaseClick(item, "song");
                      }}
                      processingPayment={processingPayment}
                      paymentLoading={paymentLoading}
                      purchased={purchased}
                      alreadySubscribed={alreadySubscribed}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Loading indicator for more items */}
            {isLoadingMore && (
              <div className="w-full py-4 flex justify-center">
                <div className="w-40 h-8 bg-gray-800 rounded animate-pulse" />
              </div>
            )}
            
            {/* End of list indicator */}
            {hasInitialLoad && !hasMore && songs.length > 0 && (
              <div className="text-center text-gray-500 py-8 text-sm">
                You've reached the end of the list
              </div>
            )}
          </>
        )}
      </div>

      <LoadingOverlay show={processingPayment || paymentLoading} />
      
      <SubscribeModal
        open={subscribeModalOpen}
        artist={modalArtist}
        type={modalType}
        itemData={modalData}
        onClose={handleSubscribeModalClose}
        onNavigate={() => {
          setSubscribeModalOpen(false);
          if (modalArtist?.slug) navigate(`/artist/${modalArtist.slug}`);
        }}
      />
    </>
  );
};

export default GenrePage;
