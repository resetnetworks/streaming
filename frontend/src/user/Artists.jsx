// src/pages/Artists.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllArtists, loadFromCache } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
import {
  selectAllArtists,
  selectArtistLoading,
  selectArtistError,
  selectArtistPagination,
  selectIsCached,
  selectCachedPages,
  selectIsPageCached,
  selectCachedPageData,
} from "../features/artists/artistsSelectors";
import UserHeader from "../components/user/UserHeader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageSEO from "../components/SEO/PageSEO";
import { FaPlay, FaMicrophone } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

// Helper: map cycle codes to readable labels
const cycleLabel = (c) => {
  switch (String(c)) {
    case "1m":
      return "Monthly";
    case "3m":
      return "3 Months";
    case "6m":
      return "6 Months";
    case "12m":
      return "Yearly";
    default:
      return c || "";
  }
};

// Format price based on currency
const formatPrice = (amount, currency) => {
  if (typeof amount !== "number") return "";
  try {
    if (currency === "INR") {
      return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
    } else if (currency === "USD") {
      return `$${new Intl.NumberFormat("en-US").format(amount)}`;
    } else {
      return `${amount} ${currency}`;
    }
  } catch {
    return `${amount} ${currency}`;
  }
};

const Artists = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors with cache
  const artists = useSelector(selectAllArtists) || [];
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);
  const pagination = useSelector(selectArtistPagination) || { page: 1, totalPages: 1, limit: 12 };
  const isCached = useSelector(selectIsCached);
  const cachedPages = useSelector(selectCachedPages);

  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Check if current page is cached
  const isPageCached = useSelector(selectIsPageCached(currentPage));
  const cachedPageData = useSelector(selectCachedPageData(currentPage));

  // Initial load with cache check
  useEffect(() => {
    if (!initialFetchDone) {
      if (isPageCached && cachedPageData) {
        dispatch(loadFromCache(currentPage));
      } else {
        dispatch(fetchAllArtists({ page: currentPage, limit: 12 }));
      }
      setInitialFetchDone(true);
    }
  }, [dispatch, initialFetchDone, currentPage, isPageCached, cachedPageData]);

  // Navigation handler
  const handleArtistClick = (slug) => {
    if (slug) {
      navigate(`/artist/${slug}`);
    }
  };

  // Enhanced pagination handlers with cache
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      setCurrentPage(newPage);
      const isNewPageCached = cachedPages.includes(newPage);
      if (isNewPageCached) {
        dispatch(loadFromCache(newPage));
      } else {
        dispatch(fetchAllArtists({ page: newPage, limit: 12 }));
      }
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      const newPage = pagination.page + 1;
      setCurrentPage(newPage);
      const isNewPageCached = cachedPages.includes(newPage);
      if (isNewPageCached) {
        dispatch(loadFromCache(newPage));
      } else {
        dispatch(fetchAllArtists({ page: newPage, limit: 12 }));
      }
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== pagination.page) {
      setCurrentPage(pageNumber);
      const isPageCachedCheck = cachedPages.includes(pageNumber);
      if (isPageCachedCheck) {
        dispatch(loadFromCache(pageNumber));
      } else {
        dispatch(fetchAllArtists({ page: pageNumber, limit: 12 }));
      }
    }
  };

  // Get artist gradient
  const getArtistGradient = (index) => {
    const gradients = [
      "from-blue-500 to-pink-500",
      "from-cyan-500 to-blue-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-blue-500",
      "from-pink-500 to-rose-500",
    ];
    return gradients[index % gradients.length];
  };

  // Get artist name initial
  const getArtistInitial = (name) => {
    if (!name || typeof name !== "string") return "A";
    return name.charAt(0).toUpperCase();
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;
    const currentPageNum = pagination.page;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPageNum - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <>
      <PageSEO 
      title="Artists | RESET Music Streaming Platform"
      description="Explore music artists on RESET. Discover experimental, instrumental, and ambient music creators."
      url={window.location.href}
    />

      <UserHeader />

      <div className="min-h-screen">
        <div className="relative z-10 p-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <HiSpeakerWave className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-blue-900 bg-clip-text text-transparent">
                ARTISTS
              </h1>
              <FaMicrophone className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-gray-400 text-lg">Discover Amazing Artists</p>
          </div>

          {error && (
            <div className="mb-8 mx-auto max-w-lg">
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-red-400">Failed to load artists. Please try again.</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {[...Array(12)].map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-gray-800/50 rounded-2xl p-4">
                  <Skeleton
                    height={140}
                    className="rounded-xl mb-3"
                    baseColor="#1F2937"
                    highlightColor="#374151"
                  />
                  <Skeleton width="80%" height={16} baseColor="#1F2937" highlightColor="#374151" />
                  <Skeleton
                    width="60%"
                    height={12}
                    className="mt-2"
                    baseColor="#1F2937"
                    highlightColor="#374151"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {(artists || [])
                .map((artist, index) => {
                  if (!artist || !artist._id) return null;

                  const plans = Array.isArray(artist.subscriptionPlans)
                    ? artist.subscriptionPlans.filter(Boolean)
                    : [];

                  return (
                    <div
                      key={artist._id}
                      onClick={() => handleArtistClick(artist.slug)}
                      className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                        {/* Artist Image */}
                        <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
                          {artist.image ? (
                            <img
                              loading="lazy"
                              src={artist.image}
                              alt={artist.name || "Artist"}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${getArtistGradient(
                                index
                              )} flex items-center justify-center`}
                            >
                              <span className="text-3xl font-bold text-white">
                                {getArtistInitial(artist.name)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Artist Info */}
                        <div className="text-center space-y-2">
                          <h3 className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">
                            {artist.name || "Unknown Artist"}
                          </h3>

                          {/* Subscription badges */}
                          <div className="flex flex-wrap gap-2 justify-center">
                            {plans.length > 0 ? (
                              plans.map((p, idx) => {
                                const c = p?.cycle;
                                const readable = cycleLabel(c);
                                const amount = p?.basePrice?.amount;
                                const currency = p?.basePrice?.currency;
                                if (!c || amount == null) return null;
                                return (
                                  <span
                                    key={`${artist._id}-plan-${idx}-${c}`}
                                    className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-blue-900 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium"
                                  >
                                    {formatPrice(amount, currency)}/{readable}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300 font-medium">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          )}

          {!loading && artists.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={pagination.page <= 1}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-900 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-2">
                {generatePageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      pageNum === pagination.page
                        ? "bg-gradient-to-r from-blue-600 to-blue-900 text-white shadow-lg"
                        : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700/50"
                    } ${cachedPages.includes(pageNum) ? "ring-2 ring-green-500/30" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-cyan-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next →
              </button>
            </div>
          )}

          {!loading && (!artists || artists.length === 0) && !error && (
            <div className="text-center py-12">
              <FaMicrophone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No Artists Found</h3>
              <p className="text-gray-500">Check back later for new artists.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Artists;
