import { useState } from 'react';
import {
  FaMusic, FaEdit, FaTrash, FaUserAlt, FaCompactDisc
} from 'react-icons/fa';
import { MdAudiotrack, MdAccessTime, MdDateRange } from 'react-icons/md';
import { RiPriceTag3Fill } from 'react-icons/ri';

const AdminSongCard = ({
  song = {
    _id: '1',
    title: 'Demo Song',
    duration: 245,
    audioUrl: '',
    coverImage: '',
    price: 1.99,
    accessType: 'purchase-only',
    genre: ['Pop', 'Indie'],
    releaseDate: new Date().toISOString(),
    artist: { name: 'Demo Artist' },
    album: { title: 'Demo Album' }
  },
  onDelete = () => alert('Delete Clicked'),
  onUpdate = (id, data) => alert(`Update Clicked\nID: ${id}\nData: ${JSON.stringify(Object.fromEntries(data), null, 2)}`)
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const [editedSong, setEditedSong] = useState({
    title: song.title,
    duration: song.duration,
    price: song.price || 0,
    accessType: song.accessType || 'subscription',
    genre: Array.isArray(song.genre) ? song.genre.join(', ') : '',
    releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSong(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    setCoverFile(file);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      setEditedSong(prev => ({
        ...prev,
        duration: Math.floor(audio.duration)
      }));
    };
  };

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append('title', editedSong.title);
    formData.append('duration', editedSong.duration);
    formData.append('price', editedSong.accessType === 'purchase-only' ? editedSong.price : 0);
    formData.append('accessType', editedSong.accessType);
    formData.append('genre', editedSong.genre);
    formData.append('releaseDate', editedSong.releaseDate);
    if (coverFile) formData.append('coverImage', coverFile);
    if (audioFile) formData.append('audio', audioFile);

    onUpdate(song._id, formData);
    setIsEditing(false);
  };

  const displayCover = coverFile
    ? URL.createObjectURL(coverFile)
    : song.coverImage;

  return (
    <div className="bg-gray-800 rounded-md overflow-hidden shadow-md border border-gray-700 text-sm w-full mx-auto">
      {/* Cover */}
      <div className="h-36 bg-gray-700 relative">
        {displayCover ? (
          <img src={displayCover} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <FaMusic className="text-3xl" />
          </div>
        )}
        {isEditing && (
          <div className="absolute bottom-0 w-full px-3 pb-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="text-xs text-white file:bg-blue-700 file:text-white file:rounded file:px-2 file:py-1 file:cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <div className="flex items-center mb-2">
          <FaMusic className="text-blue-400 text-sm mr-2" />
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedSong.title}
              onChange={handleChange}
              className="bg-gray-700 text-white px-2 py-1 rounded w-full"
              required
            />
          ) : (
            <h3 className="text-base font-medium text-white truncate">{song.title}</h3>
          )}
        </div>

        {/* Artist / Album */}
        {!isEditing && (
          <div className="text-xs text-gray-400 mb-2 space-y-1">
            <div className="flex items-center">
              <FaUserAlt className="mr-1" /> {song.artist?.name || 'Unknown Artist'}
            </div>
            {song.album?.title && (
              <div className="flex items-center">
                <FaCompactDisc className="mr-1" /> {song.album.title}
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center text-gray-300 mb-2">
          <MdAccessTime className="mr-2 text-sm" />
          <span>{editedSong.duration}s</span>
        </div>

        {/* Audio */}
        <div className="mb-2">
          {isEditing ? (
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="text-xs text-white file:bg-blue-700 file:text-white file:rounded file:px-2 file:py-1 file:cursor-pointer"
            />
          ) : (
            <div className="text-xs text-gray-400 flex items-center">
              <MdAudiotrack className="mr-2" />
              {song.audioUrl ? (
                <a href={song.audioUrl} target="_blank" rel="noreferrer" className="underline">Audio File</a>
              ) : 'No Audio'}
            </div>
          )}
        </div>

        {/* Genre */}
        <div className="mb-2">
          {isEditing ? (
            <input
              type="text"
              name="genre"
              value={editedSong.genre}
              onChange={handleChange}
              placeholder="Comma-separated genres"
              className="bg-gray-700 text-white px-2 py-1 rounded w-full text-xs"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {(song.genre || []).map((g, i) => (
                <span key={i} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">{g}</span>
              ))}
            </div>
          )}
        </div>

        {/* Release / AccessType / Price */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-300">
          <div className="flex items-center">
            <MdDateRange className="mr-1" />
            {isEditing ? (
              <input
                type="date"
                name="releaseDate"
                value={editedSong.releaseDate}
                onChange={handleChange}
                className="bg-gray-700 text-white px-1 py-0.5 rounded w-full"
              />
            ) : (
              <span>{new Date(song.releaseDate).toLocaleDateString()}</span>
            )}
          </div>
          {isEditing ? (
            <select
              name="accessType"
              value={editedSong.accessType}
              onChange={handleChange}
              className="bg-gray-700 text-white px-2 py-1 rounded w-full"
            >
              <option value="subscription">Subscription</option>
              <option value="purchase-only">Purchase Only</option>
            </select>
          ) : (
            <span className="text-gray-300">
              {song.accessType === 'purchase-only' ? 'Purchase Only' : 'Subscription'}
            </span>
          )}
        </div>

        {/* Price (only if purchase-only) */}
        {editedSong.accessType === 'purchase-only' && (
          <div className="mb-3 text-xs text-gray-300 flex items-center gap-2">
            <RiPriceTag3Fill />
            {isEditing ? (
              <input
                type="number"
                name="price"
                value={editedSong.price}
                onChange={handleChange}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full"
                min="0"
                step="0.01"
              />
            ) : (
              <span>${song.price?.toFixed(2)}</span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="text-gray-300 hover:text-white text-xs">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
              >
                <FaEdit className="inline mr-1" /> Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-400 text-xs"
              >
                <FaEdit className="inline mr-1" /> Edit
              </button>
              <button
                onClick={() => onDelete(song._id)}
                className="text-red-800 hover:text-red-400 text-xs"
              >
                <FaTrash className="inline mr-1" /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSongCard;
