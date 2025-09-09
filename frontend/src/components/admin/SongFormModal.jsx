import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaMusic, FaCloudUploadAlt } from 'react-icons/fa';
import { MdAudiotrack } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { getAlbumsByArtist } from '../../features/albums/albumsSlice';
import { toast } from 'sonner';
import FixedGenreSelector from './FixedGenreSelector';

const SongFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  artists = [],
  initialAlbums = [],
  songToEdit = null,
}) => {
  const dispatch = useDispatch();
  const [albums, setAlbums] = useState(initialAlbums);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fixed, pre-seeded list of allowed genres
const fixedGenres = [
  // core electronic and experimental
  'electronic',
  'idm',
  'ambient',
  'experimental',
  'avant garde',
  'noise',
  'downtempo',
  'soundtrack',
  'industrial',
  'ebm',
  'electro',
  'techno',
  'dance',
  'electronica',
  'sound art',

  // cinematic and soundtrack
  'jazz',

  // downtempo and chill
  'classical',
  'classical crossover',
  'soundscape',
  'field recordings',

  // instruments/arrangements
  'noise',
];



  const [genresArray, setGenresArray] = useState([]);

  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    artistId: '',
    album: '',
    albumId: '',
    duration: 0,
    coverImage: null,
    audioFile: null,
    genre: '',
    price: '',
    accessType: 'subscription',
    albumOnly: false,
    releaseDate: new Date().toISOString().split('T')[0],
  });

  const [searchTermArtist, setSearchTermArtist] = useState('');
  const [searchTermAlbum, setSearchTermAlbum] = useState('');
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [showAlbumDropdown, setShowAlbumDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coverImageRef = useRef(null);
  const audioFileRef = useRef(null);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchTermArtist.toLowerCase())
  );

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchTermAlbum.toLowerCase())
  );

  // Initialize edit mode + genresArray from songToEdit
  useEffect(() => {
    if (songToEdit) {
      setIsEditMode(true);
      const initialGenres = Array.isArray(songToEdit.genre)
        ? songToEdit.genre
        : (songToEdit.genre || '')
            .split(',')
            .map(g => g.trim())
            .filter(Boolean);

      setGenresArray(initialGenres);

      setNewSong({
        title: songToEdit.title,
        artist: songToEdit.artist?.name || '',
        artistId: songToEdit.artist?._id || '',
        album: songToEdit.album?.title || '',
        albumId: songToEdit.album?._id || '',
        duration: songToEdit.duration || 0,
        coverImage: songToEdit.coverImage || null,
        audioFile: songToEdit.audioFile || null,
        genre: initialGenres.join(', '),
        price: songToEdit.price || '',
        accessType: songToEdit.accessType || 'subscription',
        albumOnly: songToEdit.albumOnly || false,
        releaseDate: songToEdit.releaseDate || new Date().toISOString().split('T')[0],
      });
      setSearchTermArtist(songToEdit.artist?.name || '');
      setSearchTermAlbum(songToEdit.album?.title || '');

      if (songToEdit.artist?._id) {
        dispatch(getAlbumsByArtist({ artistId: songToEdit.artist._id, limit: 100 }))
          .unwrap()
          .then((result) => {
            setAlbums(result.albums);
          });
      }
    } else {
      setIsEditMode(false);
      setGenresArray([]);
    }
  }, [songToEdit, dispatch]);

  // Fetch albums on artist change
  useEffect(() => {
    if (newSong.artistId) {
      dispatch(getAlbumsByArtist({ artistId: newSong.artistId, limit: 100 }))
        .unwrap()
        .then((result) => setAlbums(result.albums))
        .catch(() => setAlbums([]));
    } else {
      setAlbums(initialAlbums);
    }
  }, [newSong.artistId, dispatch, initialAlbums]);

  // Reflect genresArray into newSong.genre (comma-separated)
  useEffect(() => {
    setNewSong(prev => ({
      ...prev,
      genre: genresArray.join(', ')
    }));
  }, [genresArray]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSong((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setNewSong((prev) => ({ ...prev, coverImage: file }));
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setNewSong((prev) => ({
          ...prev,
          duration: Math.floor(audio.duration),
          audioFile: file,
        }));
      };
    }
  };

  const handleArtistSelect = (artist) => {
    setNewSong((prev) => ({
      ...prev,
      artist: artist.name,
      artistId: artist._id,
      album: '',
      albumId: '',
    }));
    setSearchTermArtist(artist.name);
    setSearchTermAlbum('');
    setShowArtistDropdown(false);
  };

  const handleAlbumSelect = (album) => {
    const albumReleaseDate = album.releaseDate 
      ? new Date(album.releaseDate).toISOString().split('T')[0]
      : newSong.releaseDate;

    setNewSong((prev) => ({
      ...prev,
      album: album.title,
      albumId: album._id,
      releaseDate: albumReleaseDate,
    }));
    
    setSearchTermAlbum(album.title);
    setShowAlbumDropdown(false);

    if (album.releaseDate) {
      const formattedDate = new Date(album.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      toast.success(`Release date auto-filled from album: ${formattedDate}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { title, artistId, audioFile, accessType, price, albumOnly } = newSong;

    if (!title || !artistId) {
      toast.error('Title and artist are required');
      setIsSubmitting(false);
      return;
    }

    if (!isEditMode && !audioFile) {
      toast.error('Audio file is required');
      setIsSubmitting(false);
      return;
    }

    if (accessType === 'purchase-only' && !albumOnly && (!price || parseFloat(price) <= 0)) {
      toast.error('Purchase-only songs must have a valid price (unless album-only)');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', newSong.title);
    formData.append('artist', newSong.artistId);
    if (newSong.albumId) formData.append('album', newSong.albumId);
    formData.append('duration', newSong.duration);
    formData.append('releaseDate', newSong.releaseDate);
    formData.append('accessType', newSong.accessType);
    formData.append('albumOnly', newSong.albumOnly);

    if (newSong.accessType === 'purchase-only') {
      if (newSong.albumOnly) {
        formData.append('price', 0);
      } else {
        formData.append('price', parseFloat(newSong.price) || 0);
      }
    }

    // Use genresArray to append genre[] accurately
    const genres = Array.isArray(genresArray) ? genresArray : [];
    genres.forEach((g) => formData.append('genre[]', g));

    if (newSong.coverImage) formData.append('coverImage', newSong.coverImage);
    if (newSong.audioFile) formData.append('audio', newSong.audioFile);

    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setNewSong({
        title: '',
        artist: '',
        artistId: '',
        album: '',
        albumId: '',
        duration: 0,
        coverImage: null,
        audioFile: null,
        genre: '',
        price: '',
        accessType: 'subscription',
        albumOnly: false,
        releaseDate: new Date().toISOString().split('T')[0],
      });
      setSearchTermArtist('');
      setSearchTermAlbum('');
      setShowArtistDropdown(false);
      setShowAlbumDropdown(false);
      setAlbums(initialAlbums);
      setGenresArray([]);
      if (coverImageRef.current) coverImageRef.current.value = '';
      if (audioFileRef.current) audioFileRef.current.value = '';
    }
  }, [isOpen, initialAlbums]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center text-blue-400">
            <FaMusic className="mr-2" /> 
            {isEditMode ? 'Edit Song' : 'Add New Song'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Title */}
          <div className="col-span-2">
            <label className="text-gray-300">Title*</label>
            <input
              type="text"
              name="title"
              value={newSong.title}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
              required
            />
          </div>

          {/* Artist */}
          <div className="col-span-1 relative">
            <label className="text-gray-300">Artist*</label>
            <input
              type="text"
              value={searchTermArtist}
              onChange={(e) => {
                setSearchTermArtist(e.target.value);
                setShowArtistDropdown(true);
              }}
              onFocus={() => setShowArtistDropdown(true)}
              placeholder="Search artist..."
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
              required
            />
            {showArtistDropdown && filteredArtists.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow max-h-60 overflow-auto">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist._id}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => {
                      setNewSong((prev) => ({
                        ...prev,
                        artist: artist.name,
                        artistId: artist._id,
                        album: '',
                        albumId: '',
                      }));
                      setSearchTermArtist(artist.name);
                      setSearchTermAlbum('');
                      setShowArtistDropdown(false);
                    }}
                  >
                    {artist.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Album */}
          <div className="col-span-1 relative">
            <label className="text-gray-300">
              Album <span className="text-xs text-blue-400 ml-1">(auto-fills release date)</span>
            </label>
            <input
              type="text"
              value={searchTermAlbum}
              onChange={(e) => {
                setSearchTermAlbum(e.target.value);
                setShowAlbumDropdown(true);
              }}
              onFocus={() => setShowAlbumDropdown(true)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
              disabled={!newSong.artistId}
              placeholder={!newSong.artistId ? "Select artist first" : ""}
            />
            {showAlbumDropdown && filteredAlbums.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow max-h-60 overflow-auto">
                {filteredAlbums.map((album) => (
                  <div
                    key={album._id}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleAlbumSelect(album)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{album.title}</span>
                      {album.releaseDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(album.releaseDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Access Type */}
          <div className="col-span-1">
            <label className="text-gray-300">Access Type</label>
            <select
              name="accessType"
              value={newSong.accessType}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
              required
            >
              <option value="subscription">Subscription</option>
              <option value="purchase-only">Purchase Only</option>
            </select>
          </div>

          {/* Release Date (moved next to Access Type) */}
          <div className="col-span-1">
            <label className="text-gray-300">
              Release Date {newSong.albumId && (
                <span className="text-xs text-green-400 ml-1">(from album)</span>
              )}
            </label>
            <input
              type="date"
              name="releaseDate"
              value={newSong.releaseDate}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
            />
          </div>

          {/* Album Only Checkbox */}
          {newSong.accessType === 'purchase-only' && (
            <div className="col-span-1">
              <label className="text-gray-300 flex items-center">
                <input
                  type="checkbox"
                  name="albumOnly"
                  checked={newSong.albumOnly}
                  onChange={handleChange}
                  className="mr-2"
                />
                Album Only (cannot be purchased individually)
              </label>
            </div>
          )}

          {/* Price */}
          {newSong.accessType === 'purchase-only' && !newSong.albumOnly && (
            <div className="col-span-1">
              <label className="text-gray-300">Price*</label>
              <input
                type="number"
                name="price"
                value={newSong.price}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                step="0.01"
                min="0"
                required
              />
            </div>
          )}

          {/* Cover Image */}
          <div className="col-span-2">
            <label className="text-gray-300">Cover Image</label>
            <div
              className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
              onClick={() => !isSubmitting && coverImageRef.current.click()}
            >
              {newSong.coverImage ? (
                typeof newSong.coverImage === 'string' ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={newSong.coverImage}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded mb-2"
                    />
                    <span className="text-sm text-gray-400">Current cover image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(newSong.coverImage)}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded mb-2"
                    />
                    <span className="text-sm text-gray-400">{newSong.coverImage.name}</span>
                  </div>
                )
              ) : (
                <>
                  <FaCloudUploadAlt className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Click to upload only .jpg .jpeg .avif</p>
                </>
              )}
              <input
                type="file"
                ref={coverImageRef}
                onChange={handleImageUpload}
                accept=".jpg, .jpeg, .avif"
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Audio Upload */}
          <div className="col-span-2">
            <label className="text-gray-300">
              Audio File{!isEditMode && '*'}
            </label>
            <div
              className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
              onClick={() => !isSubmitting && audioFileRef.current.click()}
            >
              {newSong.audioFile ? (
                typeof newSong.audioFile === 'string' ? (
                  <div className="flex flex-col items-center">
                    <MdAudiotrack className="text-3xl text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">Current audio file</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <MdAudiotrack className="text-3xl text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">{newSong.audioFile.name}</span>
                  </div>
                )
              ) : (
                <>
                  <MdAudiotrack className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Click to upload audio</p>
                </>
              )}
              <input
                type="file"
                ref={audioFileRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Genre: moved near bottom */}
          <div className="col-span-2">
            <label className="text-gray-300">Genre</label>
            <FixedGenreSelector
              value={genresArray}
              onChange={setGenresArray}
              options={fixedGenres}
              disabled={isSubmitting}
              maxTags={6}
            />
            <p className="mt-1 text-xs text-gray-400">
              Select from predefined genres. Creation is disabled.
            </p>
          </div>

          {/* Submit */}
          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Saving...') 
                : (isEditMode ? 'Update Song' : 'Add Song')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongFormModal;
