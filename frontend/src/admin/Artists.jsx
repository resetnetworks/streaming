import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserAlt, FaSearch } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import AdminDataTable from "../components/admin/AdminDataTable";
import CreateArtistModal from '../components/admin/CreateArtistModal';

import {
  fetchAllArtistsNoPagination,
  deleteArtist
} from '../features/artists/artistsSlice';

import {
  selectFullArtistList,
  selectArtistLoading,
  selectArtistError
} from '../features/artists/artistsSelectors';

const Artists = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const hasFetchedRef = useRef(false);

  const artists = useSelector(selectFullArtistList);
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchAllArtistsNoPagination());
    }
  }, [dispatch]);

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

  const handleViewPayments = (artistId) => {
    navigate(`/admin/payments/${artistId}`);
  };

  return (
    <div className="p-6">
      {/* Top bar always visible */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Artists</h2>

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaUserAlt className="mr-2" /> Add Artist
        </button>
      </div>

      {/* Main Section */}
      {loading ? (
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="space-y-4">
            <Skeleton height={60} count={5} />
          </div>
        </SkeletonTheme>
      ) : error ? (
        <div className="text-red-400 text-sm text-center mb-4">
          Error: {error}
        </div>
      ) : formattedArtists.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No artists found. Click "Add Artist" to create one.
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