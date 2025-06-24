import { useState } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import AdminDataTable from "../components/AdminDataTable";
import CreateArtistModal from '../components/CreateArtistModal';

const Artists = ({ artists }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = ['ID', 'Name', 'Songs', 'Albums', 'Actions'];

  const formattedArtists = artists.map((artist, index) => ({
    id: index + 1,
    name: artist.name,
    songs: artist.songs?.length || 0,
    albums: artist.albums?.length || 0,
    _id: artist._id
  }));

  return (
    <>
      <AdminDataTable
        title="Artists"
        columns={columns}
        data={formattedArtists}
        addButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaUserAlt className="mr-2" /> Add Artist
          </button>
        }
      />

      <CreateArtistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Artists;
