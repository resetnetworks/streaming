import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";
import RecentPlays from "../components/user/RecentPlays";
import { FiMapPin } from "react-icons/fi";
import { LuSquareChevronRight } from "react-icons/lu";
import { fetchArtistById } from "../features/artists/artistsSlice";
import { selectSelectedArtist } from "../features/artists/artistsSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";
import { getAlbumsByArtist } from "../features/albums/albumsSlice";
import ArtistAboutSection from "../components/user/ArtistAboutSection";
import AlbumCard from "../components/user/AlbumCard";
import axiosInstance from "../utills/axiosInstance";
import OneTimePaymentModal from "../components/payments/OneTimePaymentModal";
import {
  selectArtistAlbums,
  selectArtistAlbumPagination,
  selectArtistInfo,
} from "../features/albums/albumsSelector";
import { fetchSongsByArtist } from "../features/songs/songSlice";
import { selectSongsByArtist } from "../features/songs/songSelectors";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";
import SaveCardModal from "../components/payments/saveCardModal";
import { fetchUserSubscriptions } from "../features/payments/userPaymentSlice";
import { initiateRazorpaySubscription } from "../features/payments/paymentSlice"; // 🆕 NEW

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const recentScrollRef = useRef(null);
  const singlesScrollRef = useRef(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [purchaseType, setPurchaseType] = useState(null);
  const navigate = useNavigate();

  // Selectors
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const currentUser = useSelector((state) => state.auth.user);
  const artist = useSelector(selectSelectedArtist);
  const artistAlbums = useSelector(selectArtistAlbums);
  const artistAlbumPagination = useSelector(selectArtistAlbumPagination);
  const artistInfo = useSelector(selectArtistInfo);
  const artistSongsData = useSelector(
    (state) => selectSongsByArtist(state, artistId),
    shallowEqual
  );

  // ✅ Get subscriptions from Redux
  const userSubscriptions = useSelector(
    (state) => state.userDashboard.subscriptions || []
  );

  const isSubscribed = userSubscriptions.some((sub) => sub.artist.slug === artistId);


  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSaveCardModal, setShowSaveCardModal] = useState(false);
  
  // 🆕 NEW: Gateway selection states
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);

  const {
    songs: artistSongs = [],
    pages: totalPages = 1,
    status: songsStatus = "idle",
  } = artistSongsData || {};

  const [songsPage, setSongsPage] = useState(1);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [albumsStatus, setAlbumsStatus] = useState("idle");
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);

  const songsObserverRef = useRef();
  const albumsObserverRef = useRef();

  const getArtistColor = (name) => {
    if (!name) return "bg-blue-600";
    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-red-600",
      "bg-orange-600",
      "bg-yellow-600",
      "bg-green-600",
      "bg-teal-600",
      "bg-indigo-600",
    ];
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  useEffect(() => {
    if (artistId) {
      dispatch(fetchArtistById(artistId));
      dispatch(fetchUserSubscriptions());
      dispatch(getAlbumsByArtist({ artistId, page: 1, limit: 10 }));
      dispatch(fetchSongsByArtist({ artistId, page: 1, limit: 10 }));
    }
  }, [dispatch, artistId]);

  const fetchAlbums = async (page) => {
    if (albumsStatus === "loading") return;
    setAlbumsStatus("loading");
    try {
      await dispatch(
        getAlbumsByArtist({ artistId, page, limit: 10 })
      ).unwrap();
      if (page >= artistAlbumPagination.totalPages) {
        setHasMoreAlbums(false);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setAlbumsStatus("idle");
    }
  };

  useEffect(() => {
    if (albumsPage > 1 && hasMoreAlbums) {
      fetchAlbums(albumsPage);
    }
  }, [albumsPage, hasMoreAlbums]);

  useEffect(() => {
    if (artistId && songsPage > 1) {
      dispatch(fetchSongsByArtist({ artistId, page: songsPage, limit: 10 }));
    }
  }, [dispatch, artistId, songsPage]);

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const handleScroll = (ref) => {
    ref?.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // 🆕 UPDATED: Handle Subscribe with Gateway Selection
  const handleSubscribe = async () => {
    if (!artist?._id) {
      toast.error("Artist info not loaded.");
      return;
    }

    if (isSubscribed) {
      const confirmUnsub = window.confirm(
        `Are you sure you want to unsubscribe from ${artist.name}?`
      );
      if (!confirmUnsub) return;

      setSubscriptionLoading(true);
      try {
        await axiosInstance.delete(`/subscriptions/artist/${artist._id}`);
        dispatch(fetchUserSubscriptions());
        toast.success(`Unsubscribed from ${artist.name}`);
      } catch (error) {
        toast.error("Failed to unsubscribe");
        console.error(error);
      } finally {
        setSubscriptionLoading(false);
      }
    } else {
      // 🆕 Show gateway selection modal instead of direct SaveCardModal
      setShowGatewayModal(true);
    }
  };

  // 🆕 NEW: Handle Gateway Selection
  const handleGatewaySelection = (gateway) => {
    setSelectedGateway(gateway);
    setShowGatewayModal(false);
    
    if (gateway === 'stripe') {
      setShowSaveCardModal(true);
    } else if (gateway === 'razorpay') {
      handleRazorpaySubscription();
    }
  };

  // 🆕 NEW: Handle Razorpay Subscription
  const handleRazorpaySubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const result = await dispatch(initiateRazorpaySubscription(artist._id)).unwrap();
      
      if (result.subscriptionId) {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            subscription_id: result.subscriptionId,
            name: 'MusicReset',
            description: `Subscribe to ${artist.name}`,
            image: artist.image || '/logo.png',
            handler: function (response) {
              // Handle successful payment
              toast.success(`Successfully subscribed to ${artist.name}!`);
              dispatch(fetchUserSubscriptions());
            },
            prefill: {
              name: currentUser?.name,
              email: currentUser?.email,
            },
            theme: {
              color: '#3b82f6'
            },
            modal: {
              ondismiss: function() {
                toast.info('Subscription cancelled');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        };
      }
    } catch (error) {
      toast.error('Failed to initiate Razorpay subscription');
      console.error(error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handlePurchaseClick = (item, type) => {
    setPurchaseItem(item);
    setPurchaseType(type);
    setShowPurchaseModal(true);
  };

  const songsLastRef = useCallback(
    (node) => {
      if (songsStatus === "loading") return;
      if (songsObserverRef.current) songsObserverRef.current.disconnect();
      songsObserverRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && songsPage < totalPages) {
          setSongsPage((prev) => prev + 1);
        }
      });
      if (node) songsObserverRef.current.observe(node);
    },
    [songsStatus, songsPage, totalPages]
  );

  const albumsLastRef = useCallback(
    (node) => {
      if (albumsStatus === "loading" || !hasMoreAlbums) return;
      if (albumsObserverRef.current) albumsObserverRef.current.disconnect();
      albumsObserverRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreAlbums) {
          setAlbumsPage((prev) => prev + 1);
        }
      });
      if (node) albumsObserverRef.current.observe(node);
    },
    [albumsStatus, hasMoreAlbums]
  );

  const songListView = showAllSongs ? artistSongs : artistSongs.slice(0, 5);
  const subscriptionPrice = artist?.subscriptionPrice || 4.99;
  const artistColor = getArtistColor(artist?.name);

  const renderArtistImage = (imageUrl, name, size = "w-20 h-20") =>
    imageUrl ? (
      <img
        src={imageUrl}
        alt={name || "Artist"}
        className={`${size} rounded-full object-cover border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]`}
      />
    ) : (
      <div
        className={`${size} ${artistColor} rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]`}
      >
        {name ? name.charAt(0).toUpperCase() : "A"}
      </div>
    );

  const renderCoverImage = (imageUrl, title, size = "w-full h-full") =>
    imageUrl ? (
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

  return (
    <>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        {/* Hero Section */}
        <div className="relative h-80 w-full">
          {artist ? (
            <>
              {artist.image ? (
                <img
                  src={artist.image}
                  className="w-full h-full object-cover opacity-80"
                  alt="Artist Background"
                />
              ) : (
                <div className={`w-full h-full ${artistColor} opacity-80`} />
              )}
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
              <div className="absolute bottom-8 left-8 z-30 flex items-center gap-6 text-white">
                {renderArtistImage(artist?.image, artist?.name)}
                <div>
                  <p className="text-sm lowercase tracking-widest text-gray-200">
                    Artist
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-1">
                    {artist?.name || "Unknown Artist"}
                  </h1>
                  <div className="flex items-center mt-1 text-gray-300 text-sm">
                    <FiMapPin className="mr-2 text-blue-600" />
                    <span>{artist?.location || "Unknown City"}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-lg font-semibold text-blue-400">
                      ₹{subscriptionPrice.toFixed(2)}/month
                    </span>
                    <button
                      onClick={handleSubscribe}
                      disabled={subscriptionLoading}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md
                        ${subscriptionLoading ? "opacity-70 cursor-not-allowed" : ""}
                        ${
                          isSubscribed
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      {subscriptionLoading
                        ? "Processing..."
                        : isSubscribed
                        ? "Cancel Subscription"
                        : `Subscribe ₹${subscriptionPrice.toFixed(2)}/mo`}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Skeleton width={200} height={40} />
            </div>
          )}
        </div>

        {/* Rest of your existing JSX content... */}
        {/* All Songs Section */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white">
          <h2>All Songs</h2>
          {artistSongs.length > 5 && (
            <button
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => setShowAllSongs(!showAllSongs)}
            >
              {showAllSongs ? "Show less" : "See all"}
            </button>
          )}
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          {songsStatus === "loading" && artistSongs.length === 0 ? (
            [...Array(5)].map((_, idx) => (
              <div
                key={`song-skeleton-${idx}`}
                className="flex items-center gap-4"
              >
                <Skeleton circle width={50} height={50} />
                <div className="flex-1">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
                <Skeleton width={40} height={16} />
              </div>
            ))
          ) : (
            <>
              {songListView.map((song) => (
                <SongList
                  key={song._id}
                  songId={song._id}
                  img={
                    song.coverImage
                      ? song.coverImage
                      : renderCoverImage(null, song.title, "w-12 h-12")
                  }
                  songName={song.title}
                  singerName={song.singer}
                  seekTime={formatDuration(song.duration)}
                  onPlay={() => handlePlaySong(song)}
                  isSelected={selectedSong?._id === song._id}
                />
              ))}
              {songsStatus === "loading" &&
                songsPage < totalPages &&
                [...Array(5)].map((_, idx) => (
                  <div
                    key={`song-loading-${idx}`}
                    className="flex items-center gap-4"
                  >
                    <Skeleton circle width={50} height={50} />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} />
                      <Skeleton width={80} height={12} />
                    </div>
                    <Skeleton width={40} height={16} />
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Albums */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
          <h2>Albums</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Page {artistAlbumPagination.page} of {artistAlbumPagination.totalPages}
            </span>
            <LuSquareChevronRight
              className="text-white cursor-pointer hover:text-blue-800 text-2xl"
              onClick={() => handleScroll(recentScrollRef)}
            />
          </div>
        </div>
        <div className="px-6 py-2">
          <div
            ref={recentScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[220px]"
          >
            {albumsStatus === "loading" && artistAlbums.length === 0 ? (
              [...Array(5)].map((_, idx) => (
                <div key={`album-skeleton-${idx}`} className="min-w-[160px]">
                  <Skeleton height={160} width={160} className="rounded-xl" />
                  <Skeleton width={120} height={16} className="mt-2" />
                </div>
              ))
            ) : artistAlbums.length > 0 ? (
              <>
                {artistAlbums.map((album) => (
                  <AlbumCard
                    key={album._id}
                    tag={`#${album.title || "music"}`}
                    artists={album.artist?.name || "Various Artists"}
                    image={album.coverImage || "/images/placeholder.png"}
                    price={
                      album.price === 0 ? (
                        "subs.."
                      ) : currentUser?.purchasedAlbums?.includes(album._id) ? (
                        "Purchased"
                      ) : (
                        <button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded"
                          onClick={() => handlePurchaseClick(album, "album")}
                        >
                          Buy for ${album.price}
                        </button>
                      )
                    }
                    onClick={() => navigate(`/album/${album.slug}`)}
                  />
                ))}
                {albumsStatus === "loading" &&
                  hasMoreAlbums &&
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

        {/* Singles */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
          <h2>Singles</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800 text-2xl"
            onClick={() => handleScroll(singlesScrollRef)}
          />
        </div>
        <div
          ref={singlesScrollRef}
          className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
        >
          {songsStatus === "loading" && artistSongs.length === 0
            ? [...Array(5)].map((_, idx) => (
                <div key={`single-skeleton-${idx}`} className="min-w-[160px]">
                  <Skeleton height={160} width={160} className="rounded-xl" />
                  <Skeleton width={120} height={16} className="mt-2" />
                </div>
              ))
            : artistSongs.map((song, idx) => (
                <RecentPlays
                  ref={idx === artistSongs.length - 1 ? songsLastRef : null}
                  key={song._id}
                  title={song.title}
                  singer={song.singer}
                  image={
                    song.coverImage
                      ? song.coverImage
                      : renderCoverImage(null, song.title, "w-full h-40")
                  }
                  onPlay={() => handlePlaySong(song)}
                  isSelected={selectedSong?._id === song._id}
                  price={
                    song.accessType === "purchase-only" ? (
                      currentUser?.purchasedSongs?.includes(song._id) ? (
                        "Purchased"
                      ) : (
                        <button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded"
                          onClick={() => handlePurchaseClick(song, "song")}
                        >
                          Buy for ${song.price}
                        </button>
                      )
                    ) : (
                      "Subs.."
                    )
                  }
                />
              ))}
        </div>

        {/* About Section */}
        <ArtistAboutSection
          artist={artist}
          isSubscribed={isSubscribed}
          subscriptionLoading={subscriptionLoading}
          subscriptionPrice={subscriptionPrice}
          handleSubscribe={handleSubscribe}
          getArtistColor={getArtistColor}
        />

        {/* 🆕 NEW: Gateway Selection Modal */}
        {showGatewayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Choose Payment Method
              </h3>
              <p className="text-gray-300 text-sm mb-6 text-center">
                Subscribe to {artist?.name} for ₹{subscriptionPrice.toFixed(2)}/month
              </p>
              
              <div className="space-y-3">
                {/* Stripe Option */}
                <button
                  onClick={() => handleGatewaySelection('stripe')}
                  className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">S</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Credit/Debit Card</div>
                      <div className="text-blue-200 text-xs">Powered by Stripe</div>
                    </div>
                  </div>
                  <div className="text-blue-200 text-xs">Secure</div>
                </button>

                {/* Razorpay Option */}
                <button
                  onClick={() => handleGatewaySelection('razorpay')}
                  className="w-full flex items-center justify-between p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">R</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">UPI, Cards, Wallets</div>
                      <div className="text-green-200 text-xs">Powered by Razorpay</div>
                    </div>
                  </div>
                  <div className="text-green-200 text-xs">Indian</div>
                </button>
              </div>

              <button
                onClick={() => setShowGatewayModal(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Existing Modals */}
        {showSaveCardModal && (
          <SaveCardModal
            artistId={artist?._id}
            onCardSaved={() => {
              setShowSaveCardModal(false);
              dispatch(fetchUserSubscriptions());
              toast.success(`Subscribed to ${artist?.name}`);
            }}
            onClose={() => setShowSaveCardModal(false)}
          />
        )}

        {showPurchaseModal && purchaseItem && (
          <OneTimePaymentModal
            itemType={purchaseType}
            itemId={purchaseItem._id}
            amount={purchaseItem.price}
            onClose={() => {
              setShowPurchaseModal(false);
              setPurchaseItem(null);
              setPurchaseType(null);
            }}
          />
        )}
      </SkeletonTheme>
    </>
  );
};

export default Artist;
