import { FaUserAlt } from 'react-icons/fa';
import AdminDataTable from "../components/AdminDataTable";
import { Link } from 'react-router-dom';

const Artists = ({ artists }) => {
  const columns = ['ID', 'Name', 'Songs', 'Albums', 'Actions'];
  
  const formattedArtists = artists.map((artist, index) => ({
    id: index + 1,
    name: artist.name,
    songs: artist.songs?.length || 0, // Ensure this is a number/string
    albums: artist.albums?.length || 0, // Ensure this is a number/string
    _id: artist._id
  }));

  return (
    <AdminDataTable
      title="Artists"
      columns={columns}
      data={formattedArtists}
      addButton={
        <Link to="/admin/create-artist" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <FaUserAlt className="mr-2" /> Add Artist
        </Link>
      }
    />
  );
};

export default Artists;