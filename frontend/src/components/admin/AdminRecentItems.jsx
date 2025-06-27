import { FaUserAlt, FaCompactDisc } from 'react-icons/fa';

const AdminRecentItems = ({ artists, albums }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Artists</h3>
        <ul className="space-y-4">
          {artists.slice(0, 3).map(artist => (
            <li key={artist.id} className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-full mr-4">
                <FaUserAlt className="text-blue-400" />
              </div>
              <div>
                <p className="font-medium">{artist.name}</p>
                <p className="text-sm text-gray-400">
                  {artist.songs} songs • {artist.albums} albums
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Albums</h3>
        <ul className="space-y-4">
          {albums.slice(0, 3).map(album => (
            <li key={album.id} className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-full mr-4">
                <FaCompactDisc className="text-blue-400" />
              </div>
              <div>
                <p className="font-medium">{album.title}</p>
                <p className="text-sm text-gray-400">
                  {album.artist} • {album.year}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminRecentItems;