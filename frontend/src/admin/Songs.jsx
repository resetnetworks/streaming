import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaMusic, FaPlus, FaSearch, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import AdminSongCard from '../components/admin/AdminSongCard';
import SongFormModal from '../components/admin/SongFormModal';
import {
  fetchAllSongs,
  deleteSong,
  updateSong,
  createSong,
  loadFromCache,
  setCachedData,
  clearCache,
} from '../features/songs/songSlice';
import {
  selectAllSongs,
  selectSongsStatus,
  selectSongsError,
  selectSongsPagination,
  // ✅ Cache selectors
  selectIsPageCached,
  selectCachedPageData,
  selectCachedPages,
  selectIsCacheValid,
} from '../features/songs/songSelectors';
import { selectFullArtistList } from '../features/artists/artistsSelectors';
import { selectAllAlbums } from '../features/albums/albumsSelector';
import { toast } from 'sonner';

const Songs = () => {
  const dispatch = useDispatch();
  
  const songs = useSelector(selectAllSongs);
  const status = useSelector(selectSongsStatus);
  const error = useSelector(selectSongsError);
  
  // ✅ Safe pagination selector with default values
  const pagination = useSelector(selectSongsPagination) || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  };
  
  const artists = useSelector(selectFullArtistList);
  const albums = useSelector(selectAllAlbums);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Initialize with safe default values
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ✅ Cache selectors for current page with safe defaults
  const isPageCached = useSelector(selectIsPageCached(currentPage)) || false;
  const cachedPageData = useSelector(selectCachedPageData(currentPage)) || null;
  const cachedPages = useSelector(selectCachedPages) || [];
  const isCacheValid = useSelector(selectIsCacheValid) || false;

  // ✅ FIXED: Remove currentPage from dependencies to prevent infinite loop
  useEffect(() => {
    if (pagination?.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page]); // ← Fixed: Removed currentPage from dependencies

  // ✅ Main fetch effect with proper cache handling
  useEffect(() => {
    const isCachedForCurrentLimit = isPageCached && cachedPageData && 
      cachedPageData.pagination?.limit === itemsPerPage;

    if (isCachedForCurrentLimit && isCacheValid) {
      // Load from cache only if limit matches
      dispatch(loadFromCache(currentPage));
    } else {
      // Always fetch from server if cache doesn't match current limit
      dispatch(fetchAllSongs({ page: currentPage, limit: itemsPerPage }))
        .then((res) => {
          if (res.payload?.songs) {
            // Cache the data
            dispatch(setCachedData({
              page: currentPage,
              songs: res.payload.songs,
              pagination: res.payload.pagination || { 
                page: currentPage, 
                limit: itemsPerPage, 
                total: 0, 
                totalPages: 1 
              }
            }));
          }
        });
    }
  }, [dispatch, currentPage, itemsPerPage, isPageCached, cachedPageData, isCacheValid]);

  const handleDelete = async (songId) => {
    const confirm = window.confirm("Are you sure you want to delete this song?");
    if (!confirm) return;
    
    try {
      await dispatch(deleteSong(songId)).unwrap();
      toast.success('Song deleted successfully');
      
      // Refresh the current page after deletion
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (songs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        dispatch(fetchAllSongs({ page: currentPage, limit: itemsPerPage }));
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to delete song');
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateSong = async (formData) => {
    try {
      if (editingSong) {
        await dispatch(updateSong({ id: editingSong._id, formData })).unwrap();
        toast.success('Song updated successfully');
      } else {
        await dispatch(createSong(formData)).unwrap();
        toast.success('Song created successfully');
      }
      setIsModalOpen(false);
      setEditingSong(null);
      
      // Refresh the current page after adding/updating
      dispatch(fetchAllSongs({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      toast.error(error?.message || 'Failed to save song');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  // Pagination handlers with safe checks
  const goToPage = (page) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < (pagination?.totalPages || 1)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ✅ Fixed items per page handler
  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
    
    // ✅ Clear cache when changing page size to force fresh fetch
    dispatch(clearCache());
  };

  const filteredSongs = (songs || []).filter(song =>
    song?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song?.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song?.album?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Generate page numbers with safe pagination access
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination?.totalPages || 1;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end pages
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - maxVisiblePages + 1;
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">
          Songs
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, artist or album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded"
            />
          </div>

          <button
            onClick={() => {
              setEditingSong(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Song
          </button>
        </div>
      </div>

      {/* Items per page selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Show:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={100}>100</option>
          </select>
          <span className="text-gray-400 ml-2">per page</span>
        </div>
        <div className="text-gray-400 flex items-center gap-2">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} of{' '}
            {pagination?.total || 0} songs
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {status === 'loading' ? (
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index}>
                <Skeleton height={300} />
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : error ? (
        <p className="text-red-500 text-center mb-4">Error: {error}</p>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          {searchTerm ? (
            <>
              No songs found matching "{searchTerm}".
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 ml-2 underline"
              >
                Clear search
              </button>
            </>
          ) : (
            "No songs found. Click 'Add Song' to create one."
          )}
        </div>
      ) : (
        <>
          {/* Show filtered results info */}
          {searchTerm && (
            <div className="mb-4 text-gray-400">
              Showing {filteredSongs.length} of {songs?.length || 0} songs on this page
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSongs.map((song) => (
              <AdminSongCard
                key={song._id}
                song={song}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {(pagination?.totalPages || 0) > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex items-center space-x-1">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="First page"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <FaAngleLeft />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? goToPage(page) : null}
                    className={`px-3 py-1 rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-700'
                    } ${typeof page !== 'number' ? 'cursor-default' : ''} ${
                      typeof page === 'number' && cachedPages.includes(page) 
                        ? 'ring-1 ring-green-500/30' 
                        : ''
                    }`}
                    disabled={typeof page !== 'number'}
                    aria-current={page === currentPage ? 'page' : undefined}
                    aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={nextPage}
                  disabled={currentPage === (pagination?.totalPages || 1)}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <FaAngleRight />
                </button>
                <button
                  onClick={() => goToPage(pagination?.totalPages || 1)}
                  disabled={currentPage === (pagination?.totalPages || 1)}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Last page"
                >
                  <FaAngleDoubleRight />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <SongFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateSong}
        artists={artists}
        initialAlbums={albums}
        songToEdit={editingSong}
      />
    </div>
  );
};

export default Songs;
