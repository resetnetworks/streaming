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

  const defaultGenres = [
    "electronic",
    "idm",
    "ambient",
    "experimental",
    "avant garde",
    "noise",
    "downtempo",
    "soundtrack",
    "industrial",
    "ebm",
    "electro",
    "techno",
    "dance",
    "electronica",
    "sound art",
    "jazz",
    "classical",
    "classical crossover",
    "soundscapes",
    "field recordings"
  ];

  const filteredGenres = defaultGenres.filter(genre =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        ref={modalRef}
        className="
          bg-[#121214] border border-gray-800 shadow-2xl
          w-full
          flex flex-col
          /* Mobile: slides up from bottom, fills most of screen height */
          rounded-t-2xl sm:rounded-xl
          max-h-[92dvh] sm:max-h-[85vh]
          sm:max-w-2xl
          /* Make sure it never overflows viewport */
          min-h-0
        "
      >
        {/* ── Sticky Header ── */}
        <div className="flex-shrink-0 border-b border-gray-800 p-4 sm:p-6">
          {/* Mobile drag handle */}
          <div className="flex justify-center mb-3 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-700" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg sm:text-xl font-medium lowercase">
                select genres
              </h3>
              <p className="text-gray-500 text-sm mt-0.5">
                choose up to {maxSelections} genres
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-3">
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                type="text"
                placeholder="search genres..."
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="w-full bg-[#1a1a1d] text-white pl-10 pr-4 py-2.5 rounded-lg outline-none border border-gray-700 focus:border-blue-500 transition-colors placeholder-gray-600 text-sm"
              />
            </div>
          </div>

          {/* Selected count */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-400 text-xs">
              {selectedGenres.length} of {maxSelections} selected
            </span>
            {selectedGenres.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-red-400 hover:text-red-300 text-xs transition-colors"
              >
                clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable Genre List ── */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredGenres.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-500 text-sm">
                no genres found matching &quot;{genreSearch}&quot;
              </div>
            ) : (
              filteredGenres.map((genre, index) => {
                const isSelected = selectedGenres.includes(genre);
                const isDisabled =
                  selectedGenres.length >= maxSelections && !isSelected;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!isDisabled) onToggleGenre(genre);
                    }}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                      border
                      ${isSelected
                        ? "bg-blue-500/20 border-blue-500/40"
                        : "hover:bg-[#1a1a1d] border-transparent"
                      }
                      ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center transition-colors
                        ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600"}
                      `}
                    >
                      {isSelected && <FiCheck size={11} className="text-white" />}
                    </div>
                    <span
                      className={`text-sm ${isSelected ? "text-blue-300" : "text-gray-300"}`}
                    >
                      {genre}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Sticky Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-800 p-4 flex items-center justify-between gap-3">
          <span className="text-gray-500 text-xs">
            {maxSelections - selectedGenres.length > 0
              ? `${maxSelections - selectedGenres.length} more can be selected`
              : "max selections reached"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-6 py-2 rounded-full text-sm font-medium transition-all"
          >
            done
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenreModal;