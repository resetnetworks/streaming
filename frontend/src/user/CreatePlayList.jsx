import { useState, useRef, useEffect } from "react";
import { FiPlus, FiMusic, FiX, FiSearch, FiCheck } from "react-icons/fi";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import UserLayout from "../components/UserLayout";

const CreatePlayList = () => {
  // State management
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [suggestedSongs, setSuggestedSongs] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef(null);

  const allSongs = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
    { id: 2, title: "Save Your Tears", artist: "The Weeknd", duration: "3:35" },
    { id: 3, title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
    {
      id: 4,
      title: "Stay",
      artist: "The Kid LAROI, Justin Bieber",
      duration: "2:21",
    },
    { id: 5, title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58" },
    { id: 6, title: "Montero", artist: "Lil Nas X", duration: "2:17" },
    { id: 7, title: "Peaches", artist: "Justin Bieber", duration: "3:18" },
    {
      id: 8,
      title: "Kiss Me More",
      artist: "Doja Cat ft. SZA",
      duration: "3:28",
    },
  ];

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestedSongs([]);
      return;
    }

    const filtered = allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestedSongs(filtered);
  }, [searchQuery]);

  // Handle song selection
  const handleSelectSong = (song) => {
    if (!selectedSongs.some((s) => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
    setSearchQuery("");
    setSuggestedSongs([]);
  };

  // Remove song from selection
  const handleRemoveSong = (songId) => {
    setSelectedSongs(selectedSongs.filter((song) => song.id !== songId));
  };

  // Handle cover image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    const playlistData = {
      name: playlistName,
      description: playlistDescription,
      songs: selectedSongs,
      isPublic,
      coverImage,
    };
    console.log("Playlist created:", playlistData);
    // Reset form
    setPlaylistName("");
    setPlaylistDescription("");
    setSelectedSongs([]);
    setCoverImage(null);
    setCoverPreview(null);
    alert("Playlist created successfully!");
  };

  return (
    <UserLayout>
    <div className="bg-image min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <MdOutlinePlaylistAdd className="mr-2" /> Create New Playlist
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image Upload */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div
                className="relative aspect-square bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-600 transition"
                onClick={() => fileInputRef.current.click()}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Playlist cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <RiImageAddLine className="text-4xl mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400">Add Cover Image</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Playlist Info */}
            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <label
                  htmlFor="playlistName"
                  className="block text-sm font-medium mb-1"
                >
                  Playlist Name *
                </label>
                <input
                  type="text"
                  id="playlistName"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  required
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0E43CA]"
                  placeholder="My Awesome Playlist"
                />
              </div>

              <div>
                <label
                  htmlFor="playlistDescription"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="playlistDescription"
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0E43CA] min-h-[100px]"
                  placeholder="What's this playlist about?"
                />
              </div>

              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E43CA]"></div>
                  <span className="ml-3 text-sm font-medium">
                    {isPublic ? "Public Playlist" : "Private Playlist"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Song Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Songs</h2>
              <span className="text-sm text-gray-400">
                {selectedSongs.length}{" "}
                {selectedSongs.length === 1 ? "song" : "songs"} selected
              </span>
            </div>

            {/* Search and add songs */}
            <div className="relative">
              <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
                <FiSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full focus:outline-none"
                  placeholder="Search for songs to add..."
                />
              </div>

              {/* Search results dropdown */}
              {suggestedSongs.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestedSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleSelectSong(song)}
                    >
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-400">
                          {song.artist}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {song.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected songs list */}
            {selectedSongs.length > 0 ? (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {selectedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <FiMusic className="text-[#0E43CA] mr-3" />
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-400">
                          {song.artist}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-3">
                        {song.duration}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSong(song.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-800 rounded-lg">
                <FiMusic className="mx-auto text-4xl text-gray-600 mb-2" />
                <p className="text-gray-400">No songs added yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Search for songs to add to your playlist
                </p>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!playlistName || selectedSongs.length === 0}
              className={`w-full py-3 rounded-full font-bold flex items-center justify-center ${
                !playlistName || selectedSongs.length === 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#275BE0] hover:bg-[#0E43CA]"
              }`}
            >
              <FiCheck className="mr-2" /> Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
    </UserLayout>
  );
};

export default CreatePlayList;
