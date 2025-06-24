import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserAlt, FaSearch } from 'react-icons/fa';
import AdminDataTable from "../components/AdminDataTable";
import CreateArtistModal from '../components/CreateArtistModal';
import {
  fetchAllArtistsNoPagination,
  deleteArtist
} from '../features/artists/artistsSlice';
import {
  selectFullArtistList,
  selectArtistLoading,
  selectArtistError,
} from '../features/artists/artistsSelectors';

const Artists = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const artists = useSelector(selectFullArtistList);
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);

  useEffect(() => {
    if (artists.length === 0) {
      dispatch(fetchAllArtistsNoPagination());
    }
  }, [dispatch, artists.length]);

  const columns = ['ID', 'Name', 'Songs', 'Albums', 'Actions'];

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artist.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedArtists = filteredArtists.map((artist, index) => ({
    id: index + 1,
    name: artist.name,
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
      dispatch(deleteArtist(artist._id)).then(() => {
        dispatch(fetchAllArtistsNoPagination());
      });
    }
  };

  return (
    <div className="p-6">
      {/* Top bar: Title, Search, Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white">Artists</h2>

        {/* Search bar */}
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

        {/* Add Artist Button */}
        <button
          onClick={() => {
            setEditArtist(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaUserAlt className="mr-2" /> Add Artist
        </button>
      </div>

      {/* Data Table */}
      <AdminDataTable
        title=""
        columns={columns}
        data={formattedArtists}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <CreateArtistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditArtist(null);
        }}
        initialData={editArtist}
      />
    </div>
  );
};

export default Artists;
