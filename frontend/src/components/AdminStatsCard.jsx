import { FaUserAlt, FaCompactDisc, FaMusic } from 'react-icons/fa';

const AdminStatsCard = ({ artists, albums, songs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-300 text-sm">Total Artists</p>
            <h3 className="text-3xl font-bold mt-2">{artists.length}</h3>
          </div>
          <div className="bg-blue-700 p-3 rounded-full">
            <FaUserAlt className="text-blue-300 text-xl" />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-300 text-sm">Total Albums</p>
            <h3 className="text-3xl font-bold mt-2">{albums.length}</h3>
          </div>
          <div className="bg-blue-700 p-3 rounded-full">
            <FaCompactDisc className="text-blue-300 text-xl" />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-300 text-sm">Total Songs</p>
            <h3 className="text-3xl font-bold mt-2">{songs.length}</h3>
          </div>
          <div className="bg-blue-700 p-3 rounded-full">
            <FaMusic className="text-blue-300 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCard;