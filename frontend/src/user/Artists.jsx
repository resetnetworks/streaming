import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
import {
  selectAllArtists,
  selectArtistLoading,
  selectArtistError,
  selectArtistPagination,
} from "../features/artists/artistsSelectors";
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Artists = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const artists = useSelector(selectAllArtists);
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);
  const pagination = useSelector(selectArtistPagination);

  useEffect(() => {
    dispatch(fetchAllArtists({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.page]);

  const handleArtistClick = (slug) => {
    navigate(`/artist/${slug}`);
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      dispatch(fetchAllArtists({ page: pagination.page - 1, limit: pagination.limit }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      dispatch(fetchAllArtists({ page: pagination.page + 1, limit: pagination.limit }));
    }
  };

  return (
    <UserLayout>
      <UserHeader />
      <div className="p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Artists</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton
                  height={160}
                  className="rounded-lg"
                  baseColor="#1F2937"
                  highlightColor="#374151"
                />
                <Skeleton
                  width="75%"
                  height={20}
                  baseColor="#1F2937"
                  highlightColor="#374151"
                />
                <Skeleton
                  count={2}
                  height={12}
                  baseColor="#1F2937"
                  highlightColor="#374151"
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {artists.map((artist) => (
                <div
                  key={artist._id}
                  onClick={() => handleArtistClick(artist.slug)}
                  className="group bg-gray-800/80 hover:bg-gray-700/80 p-4 rounded-xl shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl border border-gray-700 hover:border-indigo-500 overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
                    {artist.image ? (
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-4xl text-gray-500">🎤</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white truncate">
                    {artist.name}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                    {artist.bio || "No bio available"}
                  </p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded-full">
                      {artist.subscriptionPrice ? `$${artist.subscriptionPrice}` : "Free"}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition-colors">
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                ← Prev
              </button>
              <span className="text-white text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Artists;
