import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
import {
  selectAllArtists,
  selectArtistLoading,
  selectArtistError,
  selectArtistPagination,
} from "../features/artists/artistsSelectors";
import UserHeader from "../components/user/UserHeader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Helmet } from "react-helmet";
import { FaPlay, FaMicrophone } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

const Artists = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ SAFE: Redux selectors with fallbacks
  const artists = useSelector(selectAllArtists) || [];
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);
  const pagination = useSelector(selectArtistPagination) || { page: 1, totalPages: 1, limit: 12 };
  
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  useEffect(() => {
    if (!initialFetchDone) {
      dispatch(fetchAllArtists({ page: 1, limit: 12 }));
      setInitialFetchDone(true);
    }
  }, [dispatch, initialFetchDone]);

  // ✅ SAFE: Navigation handler
  const handleArtistClick = (slug) => {
    if (slug) {
      navigate(`/artist/${slug}`);
    }
  };

  // ✅ SAFE: Pagination handlers
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      dispatch(fetchAllArtists({ page: newPage, limit: 12 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      const newPage = pagination.page + 1;
      dispatch(fetchAllArtists({ page: newPage, limit: 12 }));
    }
  };

  // ✅ SAFE: Get artist gradient
  const getArtistGradient = (index) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-cyan-500 to-blue-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
    ];
    return gradients[index % gradients.length];
  };

  // ✅ SAFE: Get artist name initial
  const getArtistInitial = (name) => {
    if (!name || typeof name !== 'string') return 'A';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Artists | RESET Music Streaming Platform</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Explore music artists on RESET. Discover experimental, instrumental, and ambient music creators." />
      </Helmet>

      <UserHeader />
      
      <div className="min-h-screen">
        {/* ✨ Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* 🎵 Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <HiSpeakerWave className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ARTISTS
              </h1>
              <FaMicrophone className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-gray-400 text-lg">Discover Amazing Artists</p>
          </div>

          {/* ❌ Error State */}
          {error && (
            <div className="mb-8 mx-auto max-w-lg">
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-red-400">Failed to load artists. Please try again.</p>
              </div>
            </div>
          )}

          {/* 🎵 Artists Grid */}
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
                  <Skeleton
                    width="80%"
                    height={16}
                    baseColor="#1F2937"
                    highlightColor="#374151"
                  />
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
              {(artists || []).map((artist, index) => {
                if (!artist || !artist._id) return null;

                return (
                  <div
                    key={artist._id}
                    onClick={() => handleArtistClick(artist.slug)}
                    className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                  >
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                      
                      {/* 🖼️ Artist Image */}
                      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
                        {artist.image ? (
                          <img
                            src={artist.image}
                            alt={artist.name || 'Artist'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getArtistGradient(index)} flex items-center justify-center`}>
                            <span className="text-3xl font-bold text-white">
                              {getArtistInitial(artist.name)}
                            </span>
                          </div>
                        )}
                        
                        {/* 🎵 Play Overlay */}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <FaPlay className="text-white text-sm ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* 📝 Artist Info - MINIMAL */}
                      <div className="text-center space-y-2">
                        <h3 className="text-white font-semibold text-sm truncate group-hover:text-purple-300 transition-colors">
                          {artist.name || 'Unknown Artist'}
                        </h3>
                        
                        {/* 💰 Price Badge */}
                        <div className="flex justify-center">
                          {artist.subscriptionPrice ? (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
                              ₹{artist.subscriptionPrice}/mo
                            </span>
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
              }).filter(Boolean)}
            </div>
          )}

          {/* 🎛️ Pagination */}
          {!loading && artists.length > 0 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={pagination.page <= 1}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-purple-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                ← Prev
              </button>

              <div className="px-4 py-2 bg-gray-800/80 rounded-lg border border-gray-700/50">
                <span className="text-white text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
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

          {/* 📭 Empty State */}
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
