import {
  FaMusic, FaTrash, FaUserAlt, FaCompactDisc
} from 'react-icons/fa';
import { MdAccessTime, MdDateRange } from 'react-icons/md';
import { RiPriceTag3Fill } from 'react-icons/ri';
import { formatDuration } from '../../utills/helperFunctions';

const AdminSongCard = ({ song, onDelete, onEdit }) => {
  const displayGenres = Array.isArray(song.genre) ? song.genre : [song.genre];

  const handleDelete = () => {
    const confirmed = window.confirm(`Are you sure you want to delete the song "${song.title}"?`);
    if (confirmed) {
      onDelete(song._id);
    }
  };
  console.log(song);
  

  return (
    <div className="bg-gray-800 rounded-md overflow-hidden shadow-md border border-gray-700 text-sm w-full mx-auto">
      
      {/* Cover */}
      <div className="h-36 bg-gray-700 relative">
        {song.coverImage ? (
          <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <FaMusic className="text-3xl" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-base font-medium text-white truncate mb-1">
          {song.title}
        </h3>

        <div className="text-xs text-gray-400 space-y-1 mb-2">
          <div className="flex items-center">
            <FaUserAlt className="mr-1" /> {song.artist?.name || 'Unknown Artist'}
          </div>
          {song.album?.title && (
            <div className="flex items-center">
              <FaCompactDisc className="mr-1" /> {song.album.title}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-300 space-y-2 mb-3">
          <div className="flex items-center">
            <MdAccessTime className="mr-1" />
            Duration: {formatDuration(song.duration)}
          </div>

          <div className="flex items-center">
            <MdDateRange className="mr-1" />
            {new Date(song.releaseDate).toLocaleDateString()}
          </div>

          <div>
            Genres: {displayGenres.filter(Boolean).map((g, i) => (
              <span key={i} className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded mr-1">{g}</span>
            ))}
          </div>

          <div>
            Access: <span className="text-white">{song.accessType === 'purchase-only' ? 'Purchase Only' : 'Subscription'}</span>
            {song.accessType === 'purchase-only' && (
              <span className="ml-3 flex items-center">
                <RiPriceTag3Fill className="mr-1" /> ${song.price?.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onEdit(song)}
            className="text-blue-500 hover:text-blue-400 text-xs"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 text-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSongCard;