import { useState } from 'react';
import {
  FaMusic, FaEdit, FaTrash, FaLock, FaLockOpen, FaUserAlt, FaCompactDisc
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
    isPremium: true,
    includeInSubscription: true,
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
    isPremium: song.isPremium || false,
    includeInSubscription: song.includeInSubscription !== false,
    genre: Array.isArray(song.genre) ? song.genre.join(', ') : '',
    releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedSong(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      const durationInSeconds = Math.floor(audio.duration);
      setEditedSong(prev => ({
        ...prev,
        duration: durationInSeconds
      }));
    };
  };

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append('title', editedSong.title);
    formData.append('duration', editedSong.duration);
    formData.append('price', editedSong.price);
    formData.append('isPremium', editedSong.isPremium);
    formData.append('includeInSubscription', editedSong.includeInSubscription);
    formData.append('genre', editedSong.genre);
    formData.append('releaseDate', editedSong.releaseDate);

    if (coverFile) formData.append('coverImage', coverFile);
    if (audioFile) formData.append('audioFile', audioFile);

    onUpdate(song._id, formData);
    setIsEditing(false);
  };

  const displayCover = coverFile
    ? URL.createObjectURL(coverFile)
    : song.coverImage;

  return (
    <div className="bg-gray-800 rounded-md overflow-hidden shadow-md border border-gray-700 text-sm w-full mx-auto">
      {/* Cover Image */}
      <div className="h-36 bg-gray-700 relative">
        {displayCover ? (
          <img
            src={displayCover}
            alt={song.title}
            className="w-full h-full object-cover"
          />
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
            <h3 className="text-base font-medium text-white truncate">
              {song.title}
              {song.isPremium && (
                <span className="ml-2 text-yellow-400 text-xs">
                  <FaLock className="inline" /> Premium
                </span>
              )}
            </h3>
          )}
        </div>

        {/* Artist / Album */}
        {!isEditing && (
          <div className="text-xs text-gray-400 mb-2 space-y-1">
            <div className="flex items-center">
              <FaUserAlt className="mr-1" />
              {song.artist?.name || 'Unknown Artist'}
            </div>
            {song.album?.title && (
              <div className="flex items-center">
                <FaCompactDisc className="mr-1" />
                {song.album.title}
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center text-gray-300 mb-2">
          <MdAccessTime className="mr-2 text-sm" />
          <span>{editedSong.duration}s</span>
        </div>

        {/* Audio File */}
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
                <a href={song.audioUrl} target="_blank" rel="noreferrer" className="underline">
                  Audio File
                </a>
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
                <span key={i} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
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
          <div className="flex items-center">
            <RiPriceTag3Fill className="mr-1" />
            {isEditing ? (
              <input
                type="number"
                name="price"
                value={editedSong.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="bg-gray-700 text-white px-1 py-0.5 rounded w-full"
              />
            ) : (
              <span>${song.price?.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-1 mb-3 text-xs text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPremium"
              checked={editedSong.isPremium}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {editedSong.isPremium ? 'Premium Song' : 'Free Song'}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="includeInSubscription"
              checked={editedSong.includeInSubscription}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {editedSong.includeInSubscription ? 'Included in Subscription' : 'Not in Subscription'}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-300 hover:text-white text-xs"
              >
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
