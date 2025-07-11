import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaMusic, FaPlus, FaSearch } from 'react-icons/fa';
import AdminSongCard from '../components/admin/AdminSongCard';
import SongFormModal from '../components/admin/SongFormModal';
import {
  fetchAllSongs,
  deleteSong,
  updateSong,
  createSong,
} from '../features/songs/songSlice';
import {
  selectAllSongs,
  selectSongsStatus,
} from '../features/songs/songSelectors';
import { selectFullArtistList } from '../features/artists/artistsSelectors';
import { selectAllAlbums } from '../features/albums/albumsSelector';
import { toast } from 'sonner';

const Songs = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const status = useSelector(selectSongsStatus);
  const artists = useSelector(selectFullArtistList);
  const albums = useSelector(selectAllAlbums);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAllSongs({ page: 1, limit: 100 }));
    }
  }, [status, dispatch]);

  const handleDelete = async (songId) => {
    try {
      await dispatch(deleteSong(songId)).unwrap();
      toast.success('Song deleted successfully');
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
    } catch (error) {
      toast.error(error?.message || 'Failed to save song');
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.album?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Songs</h2>

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
              setEditingSong(null); // For add new
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Song
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="text-center text-gray-400">Loading songs...</div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No songs found.
        </div>
      ) : (
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
      )}

      <SongFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSong(null);
        }}
        onSubmit={handleAddOrUpdateSong}
        artists={artists}
        initialAlbums={albums}
        songToEdit={editingSong}
      />
    </div>
  );
};

export default Songs;
