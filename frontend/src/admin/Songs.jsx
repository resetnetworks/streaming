import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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

  // Background upload tracking
  const [backgroundUploads, setBackgroundUploads] = useState([]);
  
  // Track modal submission state to prevent multiple submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Use useRef to track if data has been loaded for current page/limit combination
  const loadedRef = useRef(new Set());

  // ✅ COMPLETELY FIXED: Remove problematic selectors that cause infinite loops
  const cachedPages = useSelector(selectCachedPages) || [];

  // Generate unique ID for uploads
  const generateUploadId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // ✅ FIXED: Completely remove the problematic first useEffect
  // The pagination sync should only happen when pagination actually changes from Redux
  useEffect(() => {
    // Only sync if pagination page is different and it's a valid change
    if (pagination?.page && pagination.page !== currentPage && pagination.page > 0) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page]);

  // ✅ FIXED: Simplified data loading effect without problematic dependencies
  useEffect(() => {
    const loadKey = `${currentPage}-${itemsPerPage}`;
    
    // Prevent duplicate loads
    if (loadedRef.current.has(loadKey)) {
      return;
    }

    const loadData = async () => {
      try {
        // Mark as loading to prevent duplicate requests
        loadedRef.current.add(loadKey);

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
      } catch (error) {
        // Remove from loaded set on error so it can be retried
        loadedRef.current.delete(loadKey);
        console.error('Error loading songs data:', error);
        toast.error('Failed to load songs');
      }
    };

    loadData();
  }, [dispatch, currentPage, itemsPerPage]);

  // ✅ Clean up loaded ref when items per page changes
  useEffect(() => {
    loadedRef.current.clear();
  }, [itemsPerPage]);

  const handleDelete = useCallback(async (songId) => {
    const confirm = window.confirm("Are you sure you want to delete this song?");
    if (!confirm) return;
    
    try {
      await dispatch(deleteSong(songId)).unwrap();
      toast.success('Song deleted successfully');
      
      // Clear the loaded cache for current page since data changed
      const loadKey = `${currentPage}-${itemsPerPage}`;
      loadedRef.current.delete(loadKey);
      
      if (songs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Reload current page
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
      toast.error(error?.message || 'Failed to delete song');
    }
  }, [dispatch, songs.length, currentPage, itemsPerPage]);

  const handleEdit = useCallback((song) => {
    setEditingSong(song);
    setIsModalOpen(true);
  }, []);

  const handleAddOrUpdateSong = useCallback(async (formData) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingSong) {
        await dispatch(updateSong({ id: editingSong._id, formData })).unwrap();
        toast.success('Song updated successfully');
        
        setIsModalOpen(false);
        setEditingSong(null);
        setIsSubmitting(false);
        
        // Clear cache and reload current page
        const loadKey = `${currentPage}-${itemsPerPage}`;
        loadedRef.current.delete(loadKey);
        
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
      } else {
        const uploadId = generateUploadId();
        const songTitle = formData.get('title') || 'New Song';
        const audioFile = formData.get('audioFile');
        const fileSize = audioFile?.size || 0;
        
        setBackgroundUploads(prev => [...prev, {
          id: uploadId,
          title: songTitle,
          status: 'uploading',
          progress: 0,
          fileSize: fileSize,
          uploadSpeed: '0 KB/s',
          startTime: Date.now()
        }]);

        setIsModalOpen(false);
        setEditingSong(null);
        setIsSubmitting(false);

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

        dispatch(createSong(formData))
          .unwrap()
          .then((result) => {
            clearInterval(progressInterval);
            
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

            if (currentPage === 1) {
              // Clear cache and reload page 1
              const loadKey = `1-${itemsPerPage}`;
              loadedRef.current.delete(loadKey);
              
              dispatch(fetchAllSongs({ page: 1, limit: itemsPerPage })).then((result) => {
                if (result.payload?.songs) {
                  dispatch(setCachedData({
                    page: 1,
                    songs: result.payload.songs,
                    pagination: result.payload.pagination || { 
                      page: 1, 
                      limit: itemsPerPage, 
                      total: 0, 
                      totalPages: 1 
                    }
                  }));
                }
              });
            }

            setTimeout(() => {
              setBackgroundUploads(prev => prev.filter(upload => upload.id !== uploadId));
            }, 5000);
          })
          .catch((error) => {
            clearInterval(progressInterval);
            
            setBackgroundUploads(prev => 
              prev.map(upload => 
                upload.id === uploadId 
                  ? { ...upload, status: 'error', error: error.message }
                  : upload
              )
            );

            toast.error(`Failed to upload "${songTitle}": ${error?.message || 'Unknown error'}`, {
              id: uploadId,
              duration: 5000
            });

            setTimeout(() => {
              setBackgroundUploads(prev => prev.filter(upload => upload.id !== uploadId));
            }, 8000);
          });
      }
    } catch (error) {
      setIsSubmitting(false);
      
      if (editingSong) {
        toast.error(error?.message || 'Failed to save song');
      }
    }
  }, [isSubmitting, editingSong, dispatch, currentPage, itemsPerPage]);

  const formatUploadSpeed = useCallback((bytesPerSecond) => {
    if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${Math.round(bytesPerSecond / 1024)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSong(null);
    setIsSubmitting(false);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingSong(null);
    setIsSubmitting(false);
    setIsModalOpen(true);
  }, []);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      setCurrentPage(page);
    }
  }, [pagination?.totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < (pagination?.totalPages || 1)) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pagination?.totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleItemsPerPageChange = useCallback((e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    dispatch(clearCache());
    // Clear our local cache too
    loadedRef.current.clear();
  }, [dispatch]);

  const filteredSongs = useMemo(() => {
    return (songs || []).filter(song =>
      song?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song?.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song?.album?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [songs, searchTerm]);

  const getPageNumbers = useMemo(() => {
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
  }, [currentPage, pagination?.totalPages]);

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

                {getPageNumbers.map((page, index) => (
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

      <SongFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateSong}
        artists={artists}
        initialAlbums={albums}
        songToEdit={editingSong}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Songs;
