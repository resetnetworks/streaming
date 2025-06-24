import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaMusic, FaPlus, FaSearch } from 'react-icons/fa';
import AdminSongCard from '../components/AdminSongCard';
import SongFormModal from '../components/SongFormModal';
import {
  fetchAllSongs,
  deleteSong,
  updateSong,
} from '../features/songs/songSlice';
import {
  selectAllSongs,
  selectSongsStatus,
} from '../features/songs/songSelectors';
import { toast } from 'sonner';

const Songs = ({ artists = [], albums = [] }) => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const status = useSelector(selectSongsStatus);

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleUpdate = async (songId, formData) => {
    try {
      await dispatch(updateSong({ id: songId, formData })).unwrap();
      toast.success('Song updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to update song');
    }
  };

  const handleAddSong = async (formData) => {
    // Implement song creation API here if needed
    console.log('TODO: Create song with formData:', formData);
    setIsModalOpen(false);
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
            onClick={() => setIsModalOpen(true)}
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
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      <SongFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSong}
        artists={artists}
        albums={albums}
      />
    </div>
  );
};

export default Songs;
