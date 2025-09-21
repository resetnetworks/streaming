import { useState, useRef, useEffect } from 'react';
import {
  FaTimes, FaCompactDisc, FaLock, FaSearch,
  FaCloudUploadAlt, FaSpinner
} from 'react-icons/fa';
import { RiPriceTag3Fill } from 'react-icons/ri';

const AlbumFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  artists = [],
  isLoading = false,
  error = null,
  initialData = null,
  isEdit = false
}) => {
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    artist: '',
    artistId: '',
    coverImage: null,
    releaseDate: new Date().toISOString().split('T')[0],
    price: { currency: 'USD', amount: 0 },
    accessType: 'subscription',
    coverImageUrl: '',
    genre: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      // Parse the price from backend format
      let priceData = { currency: 'USD', amount: 0 };
      
      if (initialData.basePrice) {
        priceData = {
          currency: initialData.basePrice.currency || 'USD',
          amount: initialData.basePrice.amount || 0
        };
      } else if (initialData.price) {
        // Handle case where price might be a simple number
        priceData = {
          currency: 'USD',
          amount: typeof initialData.price === 'object' 
            ? initialData.price.amount 
            : initialData.price
        };
      }

      setNewAlbum({
        title: initialData.title || '',
        description: initialData.description || '',
        artist: initialData.artist?.name || '',
        artistId: initialData.artist?._id || '',
        coverImage: null,
        releaseDate: initialData.releaseDate
          ? new Date(initialData.releaseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        price: priceData,
        accessType: initialData.accessType || 'subscription',
        coverImageUrl: initialData.coverImage || '',
        genre: Array.isArray(initialData.genre)
          ? initialData.genre.join(', ')
          : initialData.genre || ''
      });
      setSearchTerm(initialData.artist?.name || '');
    } else if (isOpen) {
      setNewAlbum({
        title: '',
        description: '',
        artist: '',
        artistId: '',
        coverImage: null,
        releaseDate: new Date().toISOString().split('T')[0],
        price: { currency: 'USD', amount: 0 },
        accessType: 'subscription',
        coverImageUrl: '',
        genre: ''
      });
      setSearchTerm('');
    }
  }, [initialData, isOpen, isEdit]);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'priceAmount') {
      setNewAlbum((prev) => ({
        ...prev,
        price: {
          ...prev.price,
          amount: parseFloat(value) || 0
        }
      }));
    } else {
      setNewAlbum((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAlbum((prev) => ({
        ...prev,
        coverImage: file,
        coverImageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleArtistSelect = (artist) => {
    setNewAlbum((prev) => ({
      ...prev,
      artist: artist.name,
      artistId: artist._id
    }));
    setSearchTerm(artist.name);
    setShowArtistDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newAlbum.title);
    formData.append('description', newAlbum.description);
    formData.append('artist', newAlbum.artistId);
    formData.append('releaseDate', new Date(newAlbum.releaseDate).toISOString());
    formData.append('accessType', newAlbum.accessType);
    formData.append('genre', newAlbum.genre);

    if (newAlbum.accessType === 'purchase-only') {
      // Append price as a JSON string
      formData.append('basePrice', JSON.stringify(newAlbum.price));
    }

    if (newAlbum.coverImage) {
      formData.append('coverImage', newAlbum.coverImage);
    } else if (isEdit && newAlbum.coverImageUrl && !newAlbum.coverImage) {
      formData.append('keepExistingImage', 'true');
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <FaCompactDisc className="mr-2 text-blue-400" />
            {isEdit ? 'Edit Album' : 'Add New Album'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Cover Image Upload */}
            <div>
              <label className="block text-gray-300 mb-2">Cover Image</label>
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition"
                onClick={() => !isLoading && fileInputRef.current.click()}
              >
                {newAlbum.coverImageUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={newAlbum.coverImageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-md mb-2" />
                    {newAlbum.coverImage && <span className="text-sm text-gray-400">{newAlbum.coverImage.name}</span>}
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-gray-300 mb-2">Title*</label>
              <input
                type="text"
                name="title"
                value={newAlbum.title}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                required
              />
            </div>

            {/* Artist Search */}
            <div className="relative">
              <label className="block text-gray-300 mb-2">Artist*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowArtistDropdown(true);
                  }}
                  onFocus={() => setShowArtistDropdown(true)}
                  className="w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded"
                  placeholder="Search artist..."
                  required
                  disabled={isLoading || isEdit}
                  readOnly={isEdit}
                />
              </div>
              {showArtistDropdown && filteredArtists.length > 0 && !isLoading && !isEdit && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredArtists.map((artist) => (
                    <div
                      key={artist._id}
                      className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleArtistSelect(artist)}
                    >
                      {artist.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={newAlbum.description}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                rows="3"
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-gray-300 mb-2">Release Date*</label>
              <input
                type="date"
                name="releaseDate"
                value={newAlbum.releaseDate}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                required
              />
            </div>

            {/* Access Type Dropdown */}
            <div>
              <label className="block text-gray-300 mb-2">Access Type*</label>
              <select
                name="accessType"
                value={newAlbum.accessType}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                required
                disabled={isLoading}
              >
                <option value="subscription">Subscription</option>
                <option value="purchase-only">Purchase Only</option>
              </select>
            </div>

            {/* Price */}
            {newAlbum.accessType === 'purchase-only' && (
              <div>
                <label className="block text-gray-300 mb-2">Price (USD)*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <RiPriceTag3Fill className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="priceAmount"
                    value={newAlbum.price.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded"
                    required
                    
                  />
                </div>
              </div>
            )}

            {/* Genre */}
            <div>
              <label className="block text-gray-300 mb-2">Genres (comma-separated)</label>
              <input
                type="text"
                name="genre"
                value={newAlbum.genre}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                placeholder="e.g., Pop, Jazz"
              />
            </div>

            {/* Error */}
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-gray-300 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center min-w-24 justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FaCompactDisc className="mr-2" />
                  {isEdit ? 'Update Album' : 'Add Album'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumFormModal;