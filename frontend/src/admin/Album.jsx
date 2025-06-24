import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import AdminAlbumCard from '../components/AdminAlbumCard';
import AlbumFormModal from '../components/AlbumFormModal';
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
import { selectAllArtists } from '../features/artists/artistsSelectors';
import { toast } from 'sonner';

const Album = () => {
  const dispatch = useDispatch();

  const albums = useSelector(selectAllAlbums);
  const loading = useSelector(selectAlbumsLoading);
  const error = useSelector(selectAlbumsError);
  const artists = useSelector(selectAllArtists);
  const editingAlbum = useSelector(selectEditingAlbum);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
      toast.error(err || 'Failed to save album');
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
      toast.error(err || "Failed to delete album");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearEditingAlbum());
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Albums</h2>
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

      {loading && <p className="text-gray-300">Loading albums...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {albums.map((album) => (
          <AdminAlbumCard
            key={album._id}
            album={album}
            onDelete={() => handleDeleteAlbum(album._id)}
            onUpdate={() => handleEditAlbum(album)}
          />
        ))}
      </div>

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
