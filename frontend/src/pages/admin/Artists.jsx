import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserAlt, FaSearch } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import AdminDataTable from "../../components/admin/AdminDataTable";
import CreateArtistModal from '../../components/admin/CreateArtistModal';

import {
  fetchAllArtistsNoPagination,
  deleteArtist,
  loadFullListFromCache
} from '../../features/artists/artistsSlice';

import {
  selectFullArtistList,
  selectArtistLoading,
  selectArtistError,
  selectIsFullListCached,
  selectIsFullListCacheValid
} from '../../features/artists/artistsSelectors';

const Artists = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const hasFetchedRef = useRef(false);

  // ✅ Redux selectors with cache
  const artists = useSelector(selectFullArtistList) || [];
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);
  const isFullListCached = useSelector(selectIsFullListCached);
  const isFullListCacheValid = useSelector(selectIsFullListCacheValid);

  // ✅ Smart loading with cache system
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      
      // Check if data is cached and valid
      if (isFullListCached && isFullListCacheValid && artists.length > 0) {
        // Load from cache
        dispatch(loadFullListFromCache());
      } else {
        // Fetch from server
        dispatch(fetchAllArtistsNoPagination());
      }
    }
  }, [dispatch, isFullListCached, isFullListCacheValid, artists.length]);

  // ✅ Handle browser refresh - reset fetch flag
  useEffect(() => {
    const handleBeforeUnload = () => {
      hasFetchedRef.current = false;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const columns = ['ID', 'Name', 'Songs', 'Albums', 'Actions'];

  // ✅ Safe filtering with fallback
  const filteredArtists = (artists || []).filter((artist) => {
    if (!artist) return false;
    
    const name = artist.name || '';
    const location = artist.location || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      name.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower)
    );
  });

  const formattedArtists = filteredArtists.map((artist, index) => ({
    id: index + 1,
    name: artist.name || 'Unknown Artist',
    songs: artist.songCount || artist.songs?.length || 0,
    albums: artist.albumCount || artist.albums?.length || 0,
    _id: artist._id,
    artistObj: artist,
  }));

  const handleEdit = (artist) => {
    setEditArtist(artist);
    setIsModalOpen(true);
  };

  const handleDelete = (artist) => {
    if (window.confirm(`Are you sure you want to delete "${artist.name}"?`)) {
      dispatch(deleteArtist(artist._id)).then((result) => {
        if (result.type === 'artists/delete/fulfilled') {
          // No need to manually fetch again as cache will be cleared in reducer
        }
      });
    }
  };

  const handleViewPayments = (artistId) => {
    navigate(`/admin/payments/${artistId}`);
  };

  // ✅ Handle modal close and refresh data if needed
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditArtist(null);
    
    // If cache is invalid after modal operations, refetch
    if (!isFullListCacheValid) {
      dispatch(fetchAllArtistsNoPagination());
    }
  };

  return (
    <div className="p-6">
      {/* Top bar always visible */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Artists</h2>
        
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => {
            setEditArtist(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
        >
          <FaUserAlt className="mr-2" /> Add Artist
        </button>
      </div>

      {/* ✅ Search results info */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredArtists.length} of {artists.length} artists
          {filteredArtists.length !== artists.length && (
            <button
              onClick={() => setSearchTerm('')}
              className="ml-2 text-blue-400 hover:text-blue-300 underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Main Section */}
      {loading ? (
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="space-y-4">
            <Skeleton height={60} count={5} />
          </div>
        </SkeletonTheme>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400 text-sm mb-2">Error: {error}</p>
          <button
            onClick={() => dispatch(fetchAllArtistsNoPagination())}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      ) : formattedArtists.length === 0 ? (
        <div className="text-center py-10">
          {searchTerm ? (
            <div className="text-gray-400">
              <p className="mb-2">No artists found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Clear search to see all artists
              </button>
            </div>
          ) : (
            <div className="text-gray-400">
              <p className="mb-4">No artists found. Click "Add Artist" to create one.</p>
              <button
                onClick={() => {
                  setEditArtist(null);
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <FaUserAlt className="mr-2" /> Add First Artist
              </button>
            </div>
          )}
        </div>
      ) : (
        <AdminDataTable
          title=""
          columns={columns}
          data={formattedArtists}
          loading={false}
          error={null}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewPayments={handleViewPayments}
        />
      )}

      {/* ✅ Enhanced Modal */}
      <CreateArtistModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={editArtist}
      />
    </div>
  );
};

export default Artists;
