import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import AdminAlbumCard from '../components/admin/AdminAlbumCard';
import AlbumFormModal from '../components/admin/AlbumFormModal';

import {
  fetchAllAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbumById,
  setEditingAlbum,
  clearEditingAlbum,
} from '../features/albums/albumsSlice';

import {
  selectAllAlbums,
  selectAlbumsLoading,
  selectAlbumsError,
  selectEditingAlbum,
  selectAlbumPagination,
} from '../features/albums/albumsSelector';

import { selectFullArtistList } from '../features/artists/artistsSelectors';
import { toast } from 'sonner';

const Album = () => {
  const dispatch = useDispatch();

  const albums = useSelector(selectAllAlbums);
  const loading = useSelector(selectAlbumsLoading);
  const error = useSelector(selectAlbumsError);
  const artists = useSelector(selectFullArtistList);
  const editingAlbum = useSelector(selectEditingAlbum);
  const pagination = useSelector(selectAlbumPagination);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize with current pagination state from Redux
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(pagination.limit || 10);

  // Sync with Redux pagination
  useEffect(() => {
    if (pagination.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
    if (pagination.limit && pagination.limit !== itemsPerPage) {
      setItemsPerPage(pagination.limit);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    dispatch(fetchAllAlbums({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleAddOrUpdateAlbum = async (formData) => {
    try {
      if (editingAlbum) {
        await dispatch(updateAlbum({ albumId: editingAlbum._id, formData })).unwrap();
        toast.success('Album updated successfully');
      } else {
        await dispatch(createAlbum(formData)).unwrap();
        toast.success('Album created successfully');
      }
      setIsModalOpen(false);
      dispatch(clearEditingAlbum());
      // Refresh the current page after adding/updating
      dispatch(fetchAllAlbums({ page: currentPage, limit: itemsPerPage }));
    } catch (err) {
      toast.error(err?.message || 'Failed to save album');
    }
  };

  const handleEditAlbum = (album) => {
    dispatch(setEditingAlbum(album));
    setIsModalOpen(true);
  };

  const handleDeleteAlbum = async (albumId) => {
    const confirm = window.confirm("Are you sure you want to delete this album?");
    if (!confirm) return;
    try {
      await dispatch(deleteAlbumById(albumId)).unwrap();
      toast.success("Album deleted successfully");
      // Refresh the current page after deletion
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (albums.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        dispatch(fetchAllAlbums({ page: currentPage, limit: itemsPerPage }));
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete album");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearEditingAlbum());
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < pagination.totalPages) {
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate page numbers for pagination with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const { totalPages } = pagination;
    
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
        <h2 className="text-2xl font-bold text-white">Albums</h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded"
            />
          </div>

          <button
            onClick={() => {
              dispatch(clearEditingAlbum());
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Album
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
            <option value={8}>8</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={80}>80</option>
          </select>
          <span className="text-gray-400 ml-2">per page</span>
        </div>
        <div className="text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, pagination.total)} of{' '}
          {pagination.total} albums
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index}>
                <Skeleton height={200} />
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : error ? (
        <p className="text-red-500 text-center mb-4">Error: {error}</p>
      ) : filteredAlbums.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No albums found. Click "Add Album" to create one.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAlbums.map((album) => (
              <AdminAlbumCard
                key={album._id}
                album={album}
                onDelete={() => handleDeleteAlbum(album._id)}
                onUpdate={() => handleEditAlbum(album)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
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
                    } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
                    disabled={typeof page !== 'number'}
                    aria-current={page === currentPage ? 'page' : undefined}
                    aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={nextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <FaAngleRight />
                </button>
                <button
                  onClick={() => goToPage(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
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
      <AlbumFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateAlbum}
        artists={artists}
        initialData={editingAlbum}
        isEdit={!!editingAlbum}
      />
    </div>
  );
};

export default Album;