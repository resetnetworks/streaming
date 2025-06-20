import { FaUserAlt } from 'react-icons/fa';
import AdminDataTable from "../components/AdminDataTable"

const Artists = ({ artists }) => {
  const columns = ['ID', 'Name', 'Songs', 'Albums', 'Actions'];
  
  const formattedArtists = artists.map(artist => ({
    id: artist.id,
    name: artist.name,
    songs: artist.songs,
    albums: artist.albums,
    actions: '' // Placeholder for actions column
  }));

  return (
    <AdminDataTable
      title="Artists"
      columns={columns}
      data={formattedArtists}
      addButton={
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <FaUserAlt className="mr-2" /> Add Artist
        </button>
      }
    />
  );
};

export default Artists;