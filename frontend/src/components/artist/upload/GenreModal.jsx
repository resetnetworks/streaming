import React, { useState, useRef, useEffect } from "react";
import { FiX, FiCheck, FiSearch } from "react-icons/fi";

const GenreModal = ({
  isOpen,
  onClose,
  selectedGenres,
  onToggleGenre,
  onClearAll,
  maxSelections = 3
}) => {
  const [genreSearch, setGenreSearch] = useState("");
  const modalRef = useRef(null);

  // Default genres
  const defaultGenres = [
    "Hip Hop / Rap",
    "Electronic",
    "Rock",
    "Pop",
    "R&B / Soul",
    "Jazz",
    "Classical",
    "Reggae",
    "Country",
    "Metal",
    "Folk",
    "Blues",
    "World Music",
    "Experimental",
    "Ambient",
    "Lo-Fi",
    "Indie",
    "Punk",
    "Funk",
    "Disco",
    "House",
    "Techno",
    "Trance",
    "Drum & Bass",
    "Dubstep",
    "Trap",
    "Alternative",
    "Singer-Songwriter",
    "Gospel",
    "Latin"
  ];

  // Filtered genres based on search
  const filteredGenres = defaultGenres.filter(genre =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-[#121214] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-xl font-medium lowercase">select genres</h3>
              <p className="text-gray-500 text-sm mt-1">choose up to {maxSelections} genres</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="mt-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="search genres..."
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="w-full bg-[#1a1a1d] text-white pl-10 pr-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-400 text-sm">
              {selectedGenres.length} of {maxSelections} selected
            </div>
            {selectedGenres.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                clear all
              </button>
            )}
          </div>
        </div>

        {/* Genre List */}
        <div className="p-2 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {filteredGenres.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                no genres found matching "{genreSearch}"
              </div>
            ) : (
              filteredGenres.map((genre, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedGenres.includes(genre)
                      ? "bg-blue-500/20 border border-blue-500/40"
                      : "hover:bg-[#1a1a1d] border border-transparent"
                  } ${selectedGenres.length >= maxSelections && !selectedGenres.includes(genre) ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (selectedGenres.length < maxSelections || selectedGenres.includes(genre)) {
                      onToggleGenre(genre);
                    }
                  }}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedGenres.includes(genre)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-600"
                  }`}>
                    {selectedGenres.includes(genre) && (
                      <FiCheck size={12} className="text-white" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    selectedGenres.includes(genre)
                      ? "text-blue-300"
                      : "text-gray-300"
                  }`}>
                    {genre}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-800 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition-all"
          >
            done
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenreModal;