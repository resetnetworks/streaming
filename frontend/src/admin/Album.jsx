import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch } from 'react-icons/fa';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllAlbums());
  }, [dispatch]);

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
    } catch (err) {
      toast.error(err?.message || "Failed to delete album");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearEditingAlbum());
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Loading Skeleton */}
      {loading ? (
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
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
