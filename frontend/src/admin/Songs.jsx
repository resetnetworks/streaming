import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaMusic, FaPlus, FaSearch, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import AdminSongCard from '../components/admin/AdminSongCard';
import SongFormModal from '../components/admin/SongFormModal';
import UploadProgressToast from '../components/admin/UploadProgressToast';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ✅ Background upload tracking
  const [backgroundUploads, setBackgroundUploads] = useState([]);
  
  // ✅ NEW: Track modal submission state to prevent multiple submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FIXED: Correct parameterized selector usage
  const isPageCached = useSelector(state => selectIsPageCached(currentPage)(state)) || false;
  const cachedPageData = useSelector(state => selectCachedPageData(currentPage)(state)) || null;
  const cachedPages = useSelector(selectCachedPages) || [];
  const isCacheValid = useSelector(selectIsCacheValid) || false;

  // Generate unique ID for uploads
  const generateUploadId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (pagination?.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const isCachedForCurrentLimit = isPageCached && cachedPageData && 
          cachedPageData.pagination?.limit === itemsPerPage;

        if (isCachedForCurrentLimit && isCacheValid) {
          dispatch(loadFromCache(currentPage));
        } else {
          const result = await dispatch(fetchAllSongs({ page: currentPage, limit: itemsPerPage }));
          
          if (result.payload?.songs) {
            dispatch(setCachedData({
              page: currentPage,
              songs: result.payload.songs,
              pagination: result.payload.pagination || { 
                page: currentPage, 
                limit: itemsPerPage, 
                total: 0, 
                totalPages: 1 
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error loading songs data:', error);
        toast.error('Failed to load songs');
      }
    };

    loadData();
  }, [dispatch, currentPage, itemsPerPage, isPageCached, cachedPageData, isCacheValid]);

  const handleDelete = async (songId) => {
    const confirm = window.confirm("Are you sure you want to delete this song?");
    if (!confirm) return;
    
    try {
      await dispatch(deleteSong(songId)).unwrap();
      toast.success('Song deleted successfully');
      
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

  // ✅ FIXED: Background upload handler with proper state management
  const handleAddOrUpdateSong = async (formData) => {
    // ✅ Prevent multiple submissions
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingSong) {
        // For updates, keep the modal open until completion
        await dispatch(updateSong({ id: editingSong._id, formData })).unwrap();
        toast.success('Song updated successfully');
        
        // ✅ Reset states after successful update
        setIsModalOpen(false);
        setEditingSong(null);
        setIsSubmitting(false);
        
        dispatch(fetchAllSongs({ page: currentPage, limit: itemsPerPage }));
      } else {
        // For new songs, start background upload
        const uploadId = generateUploadId();
        const songTitle = formData.get('title') || 'New Song';
        const audioFile = formData.get('audioFile');
        const fileSize = audioFile?.size || 0;
        
        // Add to background uploads
        setBackgroundUploads(prev => [...prev, {
          id: uploadId,
          title: songTitle,
          status: 'uploading',
          progress: 0,
          fileSize: fileSize,
          uploadSpeed: '0 KB/s',
          startTime: Date.now()
        }]);

        // ✅ Close modal and reset states immediately for new songs
        setIsModalOpen(false);
        setEditingSong(null);
        setIsSubmitting(false); // ✅ Reset submission state immediately

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setBackgroundUploads(prev => 
            prev.map(upload => {
              if (upload.id === uploadId && upload.status === 'uploading' && upload.progress < 90) {
                const newProgress = Math.min(upload.progress + Math.random() * 15, 90);
                const elapsed = (Date.now() - upload.startTime) / 1000;
                const uploadedBytes = (newProgress / 100) * upload.fileSize;
                const speed = uploadedBytes / elapsed;
                
                return {
                  ...upload,
                  progress: Math.round(newProgress),
                  uploadSpeed: formatUploadSpeed(speed)
                };
              }
              return upload;
            })
          );
        }, 500);

        // ✅ Start upload in background (async, don't wait for it)
        dispatch(createSong(formData))
          .unwrap()
          .then((result) => {
            // Clear progress interval
            clearInterval(progressInterval);
            
            // Update upload status to success
            setBackgroundUploads(prev => 
              prev.map(upload => 
                upload.id === uploadId 
                  ? { 
                      ...upload, 
                      status: 'success', 
                      progress: 100,
                      uploadTime: Math.round((Date.now() - upload.startTime) / 1000)
                    }
                  : upload
              )
            );

            // Refresh current page if we're on page 1
            if (currentPage === 1) {
              dispatch(fetchAllSongs({ page: currentPage, limit: itemsPerPage }));
            }

            // Remove from background uploads after delay
            setTimeout(() => {
              setBackgroundUploads(prev => prev.filter(upload => upload.id !== uploadId));
            }, 5000);
          })
          .catch((error) => {
            // Clear progress interval
            clearInterval(progressInterval);
            
            // Update upload status to error
            setBackgroundUploads(prev => 
              prev.map(upload => 
                upload.id === uploadId 
                  ? { ...upload, status: 'error', error: error.message }
                  : upload
              )
            );

            // Update toast to error
            toast.error(`Failed to upload "${songTitle}": ${error?.message || 'Unknown error'}`, {
              id: uploadId,
              duration: 5000
            });

            // Remove from background uploads after delay
            setTimeout(() => {
              setBackgroundUploads(prev => prev.filter(upload => upload.id !== uploadId));
            }, 8000);
          });
      }
    } catch (error) {
      setIsSubmitting(false); // ✅ Reset submission state on error
      
      if (editingSong) {
        toast.error(error?.message || 'Failed to save song');
      }
    }
  };

  // Helper function to format upload speed
  const formatUploadSpeed = (bytesPerSecond) => {
    if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${Math.round(bytesPerSecond / 1024)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  // ✅ FIXED: Reset submission state when closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
    setIsSubmitting(false); // ✅ Reset submission state
  };

  // ✅ FIXED: Reset submission state when opening modal for new song
  const handleOpenAddModal = () => {
    setEditingSong(null);
    setIsSubmitting(false); // ✅ Reset submission state
    setIsModalOpen(true);
  };

  // Rest of your existing methods remain the same...
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

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    dispatch(clearCache());
  };

  const filteredSongs = (songs || []).filter(song =>
    song?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song?.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song?.album?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination?.totalPages || 1;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - maxVisiblePages + 1;
      }
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
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
      {/* Background Upload Status Bar */}
      {backgroundUploads.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 max-h-screen overflow-y-auto">
          {backgroundUploads.map((upload) => (
            <UploadProgressToast
              key={upload.id}
              upload={upload}
              showDetails={true}
            />
          ))}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Songs</h2>
          {/* Background upload counter */}
          {backgroundUploads.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                {backgroundUploads.filter(u => u.status === 'uploading').length} uploading
              </span>
              {backgroundUploads.filter(u => u.status === 'success').length > 0 && (
                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                  {backgroundUploads.filter(u => u.status === 'success').length} completed
                </span>
              )}
              {backgroundUploads.filter(u => u.status === 'error').length > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                  {backgroundUploads.filter(u => u.status === 'error').length} failed
                </span>
              )}
            </div>
          )}
        </div>

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

          {/* ✅ FIXED: Use the new handler */}
          <button
            onClick={handleOpenAddModal}
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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

      {/* ✅ FIXED: Pass isSubmitting to modal to prevent form resubmission */}
      <SongFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateSong}
        artists={artists}
        initialAlbums={albums}
        songToEdit={editingSong}
        isSubmitting={isSubmitting} // ✅ Pass submission state to modal
      />
    </div>
  );
};

export default Songs;
