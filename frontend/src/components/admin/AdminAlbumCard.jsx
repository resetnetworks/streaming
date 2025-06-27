import { useState } from 'react';
import { FaCompactDisc, FaEdit, FaTrash, FaLock, FaLockOpen } from 'react-icons/fa';
import { MdDateRange } from 'react-icons/md';
import { RiPriceTag3Fill } from 'react-icons/ri';

const AdminAlbumCard = ({ album, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlbum, setEditedAlbum] = useState({
    title: album.title,
    description: album.description || '',
    coverImage: album.coverImage || '',
    releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
    price: album.price || 0,
    isPremium: album.isPremium || false
  });

  const handleUpdate = () => {
    // In a real app, this would call your API first
    const albumToUpdate = {
      ...editedAlbum,
      releaseDate: editedAlbum.releaseDate ? new Date(editedAlbum.releaseDate) : new Date()
    };
    
    onUpdate(album._id, albumToUpdate);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAlbum(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditedAlbum(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700">
      {/* Cover Image */}
      <div className="h-48 bg-gray-700 relative">
        {album.coverImage ? (
          <img 
            src={album.coverImage} 
            alt={album.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <FaCompactDisc className="text-4xl" />
          </div>
        )}
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <input
              type="text"
              name="coverImage"
              value={editedAlbum.coverImage}
              onChange={handleChange}
              placeholder="Image URL"
              className="bg-gray-800 text-white px-3 py-2 rounded w-4/5"
            />
          </div>
        )}
      </div>
      
      {/* Album Details */}
      <div className="p-4">
        {/* Title */}
        <div className="flex items-center mb-3">
          <div className="bg-blue-900 p-2 rounded-full mr-3">
            <FaCompactDisc className="text-blue-400 text-lg" />
          </div>
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedAlbum.title}
              onChange={handleChange}
              className="bg-gray-700 text-white px-3 py-1 rounded flex-1 font-semibold"
              required
            />
          ) : (
            <h3 className="text-lg font-semibold flex-1">
              {album.title}
              {album.isPremium && (
                <span className="ml-2 text-yellow-400 text-sm">
                  <FaLock className="inline" /> Premium
                </span>
              )}
            </h3>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          {isEditing ? (
            <textarea
              name="description"
              value={editedAlbum.description}
              onChange={handleChange}
              className="bg-gray-700 text-white px-3 py-2 rounded w-full"
              rows="3"
              placeholder="Album description"
            />
          ) : (
            <p className="text-gray-400 text-sm">
              {album.description || 'No description available'}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center text-gray-300">
            <MdDateRange className="mr-2" />
            {isEditing ? (
              <input
                type="date"
                name="releaseDate"
                value={editedAlbum.releaseDate}
                onChange={handleChange}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              />
            ) : (
              <span>
                {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'No date'}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-gray-300">
            <RiPriceTag3Fill className="mr-2" />
            {isEditing ? (
              <input
                type="number"
                name="price"
                value={editedAlbum.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="bg-gray-700 text-white px-2 py-1 rounded w-20"
              />
            ) : (
              <span>${album.price?.toFixed(2) || '0.00'}</span>
            )}
          </div>
        </div>

        {/* Premium Toggle */}
        <div className="flex items-center mb-4">
          {isEditing ? (
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={editedAlbum.isPremium}
                  onChange={handleCheckboxChange}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full ${editedAlbum.isPremium ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                    editedAlbum.isPremium ? 'transform translate-x-4' : ''
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-gray-300">
                {editedAlbum.isPremium ? <FaLock className="text-yellow-400" /> : <FaLockOpen />}
                <span className="ml-1">Premium Album</span>
              </div>
            </label>
          ) : (
            <div className="text-gray-300">
              <span className="ml-1">
                {album.isPremium ? 'Premium Album' : 'Subscription'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-300 hover:text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
              >
                <FaEdit className="mr-1" /> Update
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-400 px-3 py-1 rounded flex items-center"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              <button 
                onClick={() => onDelete(album._id)}
                className="text-red-800 hover:text-red-400 px-3 py-1 rounded flex items-center"
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAlbumCard;