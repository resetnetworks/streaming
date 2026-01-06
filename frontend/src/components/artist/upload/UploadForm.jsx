import React, { useState, useEffect, useRef } from "react";
import {
  FiCalendar,
  FiMusic,
  FiUpload,
  FiTrash2,
  FiEdit2,
  FiClock,
  FiCheck,
  FiX,
  FiPlus,
  FiTag,
  FiHash,
  FiDollarSign,
  FiChevronDown, // Add this import
} from "react-icons/fi";
import GenreModal from "./GenreModal";

// Access type options array
const ACCESS_TYPE_OPTIONS = [
  {
    value: "subscription",
    label: "Subscription",
    icon: FiMusic,
    description: "Only for premium subscribers",
    color: "blue",
  },
  {
    value: "purchase-only",
    label: "Purchase Only",
    icon: FiDollarSign,
    description: "Users must purchase individually",
    color: "yellow",
  },
];

const UploadForm = ({
  type = "song",
  initialData = {},
  onCancel,
  onSubmit,
  isSubmitting = false,
}) => {
  // --- Basic Info State ---
  const [coverImage, setCoverImage] = useState(initialData.coverImage || null);
  const [title, setTitle] = useState(initialData.title || "");
  const [date, setDate] = useState(initialData.date || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [isrc, setIsrc] = useState(initialData.isrc || "");

  // --- Access Type and Price State ---
  const [accessType, setAccessType] = useState(
    initialData.accessType || "subscription"
  );
  const [price, setPrice] = useState(initialData.price || "");
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);

  // --- Genre State ---
  const [selectedGenres, setSelectedGenres] = useState(
    initialData.genres || []
  );
  const [showGenreModal, setShowGenreModal] = useState(false);

  // --- Tracks State (Single track only) ---
  const [tracks, setTracks] = useState(initialData.tracks || []);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editTrackName, setEditTrackName] = useState("");

  const hiddenDateInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const accessDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accessDropdownRef.current &&
        !accessDropdownRef.current.contains(event.target)
      ) {
        setShowAccessDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current selected access type object
  const getSelectedAccessType = () => {
    return (
      ACCESS_TYPE_OPTIONS.find((option) => option.value === accessType) ||
      ACCESS_TYPE_OPTIONS[1]
    );
  };

  const selectedAccessType = getSelectedAccessType();
  const IconComponent = selectedAccessType.icon;

  // --- Date Logic ---
  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [date]);

  // --- Price Validation ---
  const validatePrice = (priceValue) => {
    if (!priceValue) return false;
    const numPrice = parseFloat(priceValue);
    return !isNaN(numPrice) && numPrice > 0;
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverImage(file);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d{0,4}(-\d{0,2}){0,2}$/.test(val)) {
      setDate(val);
    }
  };

  const openCalendar = () => {
    if (hiddenDateInputRef.current) {
      hiddenDateInputRef.current.showPicker?.() ||
        hiddenDateInputRef.current.focus();
    }
  };

  // --- Genre Functions ---
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  const removeGenre = (genre) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const clearAllGenres = () => {
    setSelectedGenres([]);
  };

  const openGenreModal = () => {
    setShowGenreModal(true);
  };

  const closeGenreModal = () => {
    setShowGenreModal(false);
  };

  // --- Audio Duration Function ---
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedTime = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;
        resolve(formattedTime);
      };

      audio.onerror = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve("00:00");
      };

      audio.src = URL.createObjectURL(file);
    });
  };

  // --- Track Upload Logic with Audio Duration ---
  const handleTrackUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Only allow one file for single upload
    const file = files[0];

    // First add track with loading state
    const tempTrack = {
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      file: file,
      duration: "Loading...",
      order: 1,
    };

    setTracks([tempTrack]);

    // Then update with actual duration
    const duration = await getAudioDuration(file);
    setTracks([{ ...tempTrack, duration }]);
  };

  const removeTrack = (id) => {
    setTracks([]);
  };

  // --- Track Name Editing Functions ---
  const startEditingTrack = (track) => {
    setEditingTrackId(track.id);
    setEditTrackName(track.name);
  };

  const saveTrackName = (trackId) => {
    if (editTrackName.trim() === "") {
      setEditingTrackId(null);
      return;
    }

    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, name: editTrackName.trim() } : track
      )
    );
    setEditingTrackId(null);
  };

  const cancelEditing = () => {
    setEditingTrackId(null);
    setEditTrackName("");
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle access type selection
  const handleAccessTypeSelect = (value) => {
    setAccessType(value);
    setShowAccessDropdown(false);

    // Reset price if switching from purchase-only
    if (value !== "purchase-only") {
      setPrice("");
    }
  };

// --- Submit Logic ---
const handleSubmit = (e) => {
  e.preventDefault();

  // Prevent submission if already submitting
  if (isSubmitting) return;


  // Validate required fields
  if (!title.trim()) {
    alert(`Please enter ${type === "album" ? "album" : "song"} title!`);
    return;
  }

  if (selectedGenres.length === 0) {
    alert("Please select at least one genre!");
    return;
  }

  // Validate price for purchase-only
  if (accessType === "purchase-only") {
    if (!validatePrice(price)) {
      alert("Please enter a valid price greater than 0!");
      return;
    }
  }

  // Only check track for song upload
  if (type === "song") {
    if (tracks.length === 0) {
      alert("Please upload an audio file!");
      return;
    }
  }

  // Prepare data for API
  let formData = {
    title: title.trim(),
    date: date,
    description: description,
    isrc: isrc,
    genres: selectedGenres,
    coverImage: coverImage,
    accessType: accessType,
    // Only include basePrice if purchase-only
    ...(accessType === "purchase-only" && {
      basePrice: {
        amount: parseFloat(price),
        currency: "USD",
      },
    }),
  };

  // Add track data only for songs, not for albums
  if (type === "song" && tracks.length > 0) {
    const track = tracks[0];
    formData.tracks = [
      {
        name: track.name,
        file: track.file,
        duration: track.duration,
      },
    ];
  }

  onSubmit?.(formData);
};

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 flex flex-col gap-8">
      {/* SECTION 1: Basic Info (Cover, Title, Date) */}
      <div className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-800 pb-8">
        {/* Left Side: Image Upload */}
        <div className="w-full md:w-[250px] shrink-0">
          <div className="h-[250px]">
            <input
              type="file"
              accept="image/*"
              id="cover-upload"
              onChange={handleCoverImageChange}
              className="hidden"
            />
            <label
              htmlFor="cover-upload"
              className="cursor-pointer block w-full h-full relative overflow-hidden group rounded-md"
            >
              {coverImage ? (
                <img
                  src={
                    typeof coverImage === "string"
                      ? coverImage
                      : URL.createObjectURL(coverImage)
                  }
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative border border-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-30">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] bg-white"
                        style={{ height: `${Math.random() * 50 + 20}%` }}
                      ></div>
                    ))}
                  </div>
                  <span className="relative z-10 text-white/70 font-mono text-base lowercase tracking-widest bg-black/40 px-3 py-1 rounded">
                    Upload Art
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Right Side: Inputs */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Title Input */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-gray-400 text-base lowercase tracking-wide">
                {type === "album" ? "Album" : "Song"} Title
              </label>
              <input
                type="text"
                placeholder="Enter song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600"
                required
              />
            </div>

            {/* Date Input */}
            <div className="flex-1 flex flex-col gap-2 relative">
              <label className="text-gray-400 text-base lowercase tracking-wide">
                Release Date
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChange={handleDateChange}
                  className="w-full bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600 pr-10"
                />
                <input
                  type="date"
                  ref={hiddenDateInputRef}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute top-0 right-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  onClick={openCalendar}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                >
                  <FiCalendar size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Access Type Selection - UPDATED WITH DROPDOWN */}
          <div className="flex flex-col gap-2" ref={accessDropdownRef}>
            <label className="text-gray-400 text-base lowercase tracking-wide">
              Access Type
            </label>

            {/* Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAccessDropdown(!showAccessDropdown)}
                className="w-full bg-[#121214] border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedAccessType.color === "green"
                        ? "bg-green-500/10 text-green-400"
                        : selectedAccessType.color === "blue"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    <IconComponent size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-white text-sm">
                      {selectedAccessType.label}
                    </div>
                    <div className="text-gray-500 text-base">
                      {selectedAccessType.description}
                    </div>
                  </div>
                </div>
                <FiChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    showAccessDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showAccessDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121214] border border-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                  {ACCESS_TYPE_OPTIONS.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAccessTypeSelect(option.value)}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-900 transition-colors ${
                          accessType === option.value ? "bg-gray-900" : ""
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            option.color === "green"
                              ? "bg-green-500/10 text-green-400"
                              : option.color === "blue"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          <OptionIcon size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm">
                            {option.label}
                          </div>
                          <div className="text-gray-500 text-base">
                            {option.description}
                          </div>
                        </div>
                        {accessType === option.value && (
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-gray-500 text-base">
              How users can access this {type === "album" ? "album" : "song"}
            </p>
          </div>

          {/* Price Input (only for purchase-only) */}
          {accessType === "purchase-only" && (
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-base lowercase tracking-wide">
                Price (USD)
              </label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiDollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    placeholder="Amount in USD"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only positive numbers
                      if (
                        value === "" ||
                        (!isNaN(value) && parseFloat(value) >= 0)
                      ) {
                        setPrice(value);
                      }
                    }}
                    className="w-full bg-[#121214] text-white pl-10 pr-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors"
                    min="0"
                    step="0.01"
                    required={accessType === "purchase-only"}
                  />
                </div>
                <div className="w-32 bg-[#1a1a1d] text-gray-400 px-4 py-3 rounded-lg border border-gray-800 flex items-center justify-center">
                  USD ($)
                </div>
              </div>
              <p className="text-gray-500 text-base">
                Set price for individual purchase (USD only)
              </p>
            </div>
          )}

          {/* ISRC Number */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-base lowercase tracking-wide flex items-center gap-2">
              <FiHash size={12} />
              {type === "album" ? "upc" : "isrc"} number
              <span className="text-blue-400 text-base font-normal normal-case">
                (Optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., US-ABC-12-34567"
              value={isrc}
              onChange={(e) => setIsrc(e.target.value.tolowercase())}
              className="w-full bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>

          {/* Description */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-gray-400 text-base lowercase tracking-wide">
              Description
            </label>
            <textarea
              placeholder="Tell us about this song..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[125px] bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ADD TRACK */}
      {type === "album" ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-300 text-lg font-normal lowercase tracking-wide">
              upload track
            </h3>
            {tracks.length > 0 && (
              <div className="text-blue-400 text-sm">
                {tracks.length} file selected
              </div>
            )}
          </div>

          {/* Upload Banner */}
          <div className="w-full bg-[#050507] rounded-xl border border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50"></div>

            <div className="flex items-center gap-5 z-10">
              <div className="w-16 h-16 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <div className="relative">
                  <FiMusic size={24} className="-ml-1" />
                  <FiUpload
                    size={14}
                    className="absolute -bottom-1 -right-2 bg-[#050507] rounded-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-white text-lg font-medium lowercase">
                  upload audio file
                </h4>
                <p className="text-gray-500 text-sm max-w-md">
                  Choose one audio file to upload. Only 1 track allowed for
                  singles.
                </p>
                <p className="text-blue-500/60 text-base mt-1">
                  Supported file types: .wav, .aif, .flac, .mp3
                </p>
              </div>
            </div>

            <div className="z-10">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleTrackUpload}
                accept=".wav,.aif,.aiff,.flac,.mp3"
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileUpload}
                className="px-6 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-800 transition-all text-sm lowercase tracking-wider"
                disabled={tracks.length > 0}
              >
                {tracks.length > 0 ? "File Selected" : "Choose File"}
              </button>
            </div>
          </div>

          {/* Track Details */}
          {tracks.length > 0 &&
            tracks.map((track) => (
              <div
                key={track.id}
                className="bg-[#0a0a0b] rounded-lg border border-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-medium">
                    Track Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeTrack(track.id)}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                  >
                    <FiTrash2 size={14} />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Track Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-base lowercase">
                      Track Name
                    </label>
                    {editingTrackId === track.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTrackName}
                          onChange={(e) => setEditTrackName(e.target.value)}
                          className="flex-1 bg-[#1a1a1d] text-white px-3 py-2 rounded border border-blue-500/50 focus:outline-none focus:border-blue-500 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTrackName(track.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => saveTrackName(track.id)}
                          className="text-green-500 hover:text-green-400"
                        >
                          <FiCheck size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{track.name}</span>
                        <button
                          type="button"
                          onClick={() => startEditingTrack(track)}
                          className="text-gray-400 hover:text-white"
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-base lowercase">
                      Duration
                    </label>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-blue-500" size={16} />
                      <span
                        className={`text-white text-sm ${
                          track.duration === "Loading..."
                            ? "text-yellow-500"
                            : ""
                        }`}
                      >
                        {track.duration}
                      </span>
                    </div>
                  </div>

                  {/* File Size */}
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-base lowercase">
                      File Size
                    </label>
                    <span className="text-white text-sm">
                      {track.file
                        ? `${(track.file.size / (1024 * 1024)).toFixed(2)} MB`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* SECTION 3: GENRE SELECTION */}
      <div className="mt-6 border-t border-gray-800 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-300 text-lg font-normal lowercase tracking-wide">
              select genres
            </h3>
            <div className="text-gray-500 text-base">
              {selectedGenres.length}/3 selected
            </div>
          </div>

          {/* Selected Genres Display */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedGenres.length === 0 ? (
              <div className="text-gray-600 text-sm italic py-2">
                No genres selected yet. Click the button below to add.
              </div>
            ) : (
              selectedGenres.map((genre, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-2 rounded-lg group"
                >
                  <FiTag size={12} className="text-blue-400" />
                  <span className="text-blue-300 text-sm">{genre}</span>
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Genre Button */}
          <button
            type="button"
            onClick={openGenreModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors group"
          >
            <FiPlus size={18} className="group-hover:text-blue-400" />
            <span className="text-sm">Add Genres</span>
          </button>

          <p className="text-gray-500 text-base mt-1">
            Select up to 3 genres that best describe your music
          </p>
        </div>
      </div>

      {/* Genre Modal */}
      <GenreModal
        isOpen={showGenreModal}
        onClose={closeGenreModal}
        selectedGenres={selectedGenres}
        onToggleGenre={toggleGenre}
        onClearAll={clearAllGenres}
        maxSelections={3}
      />

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`text-gray-400 hover:text-white px-6 py-2 transition-colors rounded-lg ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            isSubmitting ||
            selectedGenres.length === 0 ||
            !title.trim() ||
            (accessType === "purchase-only" && !validatePrice(price)) ||
            (type === "song" && tracks.length === 0)
          }
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            `${type === "album" ? "create album" : "upload song"}`
          )}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;
