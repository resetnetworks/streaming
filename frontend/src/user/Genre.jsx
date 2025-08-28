import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  fetchSongsByGenre,
  setGenreCachedData,
  loadGenreFromCache,
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

const GenrePage = ({
  onSubscribeRequired,
  onPurchaseClick,
  processingPayment,
  paymentLoading,
}) => {
  const { genre: rawParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((s) => s.auth.user);

  // Modal
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Paging
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

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

  const isCacheValid = useSelector(selectIsGenreCacheValid);
  const isPageCached = useSelector(selectIsGenrePageCached(displayTitle, page));
  const cachedPageData = useSelector(selectGenreCachedPageData(displayTitle, page));

  useEffect(() => {
    setPage(1);
  }, [displayTitle]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!displayTitle) return;

      if (isPageCached && isCacheValid && cachedPageData) {
        dispatch(loadGenreFromCache({ genre: displayTitle, page }));
        return;
      }

      const result = await dispatch(
        fetchSongsByGenre({ genre: displayTitle, page, limit })
      ).unwrap();

      if (cancelled) return;

      dispatch(
        setGenreCachedData({
          genre: displayTitle,
          page: result.page,
          songs: result.songs,
          pagination: result.pagination,
        })
      );
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [displayTitle, page, isPageCached, isCacheValid, cachedPageData, dispatch]);

  const loadingInitial = status === "loading" && songs.length === 0;

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleRequireSubscribe = useCallback((artist, type, data) => {
    setModalArtist(artist);
    setModalType(type);
    setModalData(data);
    setSubscribeModalOpen(true);
    onSubscribeRequired?.(artist, type, data);
  }, [onSubscribeRequired]);

  // Play gating + direct payment when subscribed (matches Home/NewTracks)
  const handlePlay = useCallback((song) => {
    const purchased = currentUser?.purchasedSongs?.includes(song._id);
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);

    if (song.accessType === "subscription" && !alreadySubscribed) {
      handleRequireSubscribe(song.artist, "play", song);
      return;
    }

    if (song.accessType === "purchase-only" && song.price > 0 && !purchased) {
      if (alreadySubscribed) {
        onPurchaseClick?.(song, "song");
      } else {
        handleRequireSubscribe(song.artist, "purchase", song);
      }
      return;
    }

    dispatch(setSelectedSong(song));
    dispatch(play());
  }, [currentUser, dispatch, handleRequireSubscribe, onPurchaseClick]);

  // Infinite scroll
  const sentinelRef = useRef(null);
  const canLoadMore = totalPages && page < totalPages;

  useEffect(() => {
    if (!canLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loadingMore || status === "loading") return;

        setLoadingMore(true);
        const nextPage = page + 1;

        try {
          const result = await dispatch(
            fetchSongsByGenre({ genre: displayTitle, page: nextPage, limit })
          ).unwrap();

          dispatch(
            setGenreCachedData({
              genre: displayTitle,
              page: result.page,
              songs: result.songs,
              pagination: result.pagination,
            })
          );

          setPage(nextPage);
        } finally {
          setLoadingMore(false);
        }
      },
      { rootMargin: "200px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [canLoadMore, displayTitle, dispatch, limit, loadingMore, page, status]);

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
              {songs.map((song) => {
                const purchased = currentUser?.purchasedSongs?.includes(song._id);
                const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);

                return (
                  <GenreSongRow
                    key={song._id}
                    song={song}
                    seekTime={song.durationLabel || song.duration || ""}
                    isSelected={false}
                    onPlay={handlePlay}
                    onSubscribeRequired={(artist, type, data) => {
                      const sub = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);
                      if (type === "purchase" && sub) {
                        onPurchaseClick?.(data, "song");
                        return;
                      }
                      setModalArtist(artist);
                      setModalType(type);
                      setModalData(data);
                      setSubscribeModalOpen(true);
                    }}
                    onPurchaseClick={(item) => onPurchaseClick?.(item, "song")}
                    processingPayment={processingPayment}
                    paymentLoading={paymentLoading}
                    purchased={purchased}
                    alreadySubscribed={alreadySubscribed}
                  />
                );
              })}
            </div>

            {canLoadMore && (
              <div ref={sentinelRef} className="w-full py-4 flex justify-center">
                {loadingMore && <div className="w-40 h-8 bg-gray-800 rounded animate-pulse" />}
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
        onClose={() => {
          setSubscribeModalOpen(false);
          setModalType(null);
          setModalArtist(null);
          setModalData(null);
        }}
        onNavigate={() => {
          setSubscribeModalOpen(false);
          setModalType(null);
          if (modalArtist?.slug) navigate(`/artist/${modalArtist.slug}`);
          setModalArtist(null);
          setModalData(null);
        }}
      />
    </>
  );
};

export default GenrePage;
