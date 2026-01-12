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
  FiChevronDown,
} from "react-icons/fi";
import GenreModal from "./GenreModal";
import { toast } from "sonner";

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

const removeTrack = () => {
  setTracks([]);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
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

    // ❗ COVER IMAGE VALIDATION
  if (!coverImage) {
    toast.error("Please upload a cover image!");
    return;
  }

    // Validate required fields
    if (!title.trim()) {
      toast.error(`Please enter ${type === "album" ? "album" : "song"} title!`);
      return;
    }

    if (selectedGenres.length === 0) {
      toast.error("Please select at least one genre!");
      return;
    }

    // Validate price for purchase-only
    if (accessType === "purchase-only") {
      if (!validatePrice(price)) {
        toast.error("Please enter a valid price greater than 0!");
        return;
      }
    }

    // Only check track for song upload
    if (type === "song") {
      if (tracks.length === 0) {
        toast.error("Please upload an audio file!");
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

  // Helper function to get type-specific text
  const getTypeText = () => {
    return {
      titleLabel: type === "album" ? "Album" : "Song",
      titlePlaceholder: type === "album" ? "Enter album title" : "Enter song title",
      descriptionPlaceholder: type === "album" ? "Tell us about this album..." : "Tell us about this song...",
      accessDescription: `How users can access this ${type === "album" ? "album" : "song"}`,
      isrcLabel: type === "album" ? "UPC" : "ISRC",
      isrcPlaceholder: type === "album" ? "e.g., 123456789012" : "e.g., US-ABC-12-34567",
      isrcDescription: type === "album" ? "Universal Product Code" : "International Standard Recording Code",
      descriptionLabel: `Share the story or inspiration behind this ${type === "album" ? "album" : "song"}`,
      submitButton: type === "album" ? "create album" : "upload song"
    };
  };

  const typeText = getTypeText();

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 md:p-6 flex flex-col gap-8">
  {/* SECTION 1: Basic Info (Cover, Title, Date) */}
<div
  className={`flex flex-col lg:flex-row gap-6 items-start pb-8 ${
    type !== "album" ? "border-b border-gray-700" : ""
  }`}
>

    {/* Left Side: Image Upload */}
<div className="w-full lg:w-[250px] shrink-0">
  <div className="h-[250px]">
    <input
      type="file"
      accept="image/*"
      id="cover-upload"
      required
      onChange={handleCoverImageChange}
      className="hidden"
    />

    <label
      htmlFor="cover-upload"
      className="cursor-pointer block w-full h-full relative overflow-hidden group rounded-xl 
        bg-gradient-to-br from-gray-800 to-gray-900 
        border border-gray-700 hover:border-gray-600 transition-colors"
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
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <div className="text-gray-500 text-4xl mb-2 group-hover:text-gray-400 transition-colors">
            +
          </div>

          <span className="text-gray-500 text-sm font-medium group-hover:text-gray-400 transition-colors">
            Upload Cover Art <span className="text-red-400">*</span>
          </span>

          <span className="text-gray-600 text-xs mt-1 text-center group-hover:text-gray-500 transition-colors">
            Click to browse or drag & drop
          </span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {coverImage ? "Change Image" : "Upload Cover Image"}
        </span>
      </div>
    </label>
  </div>

  {/* REQUIRED FIELD MESSAGE */}
  {!coverImage && (
    <p className="mt-2 text-xs text-gray-400 font-medium">
      Cover image is a required field.
    </p>
  )}
</div>


    {/* Right Side: Inputs */}
    <div className="flex-1 flex flex-col gap-5 w-full">
      {/* Title and Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title Input */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-200 text-sm font-medium flex items-center gap-1">
            {typeText.titleLabel} Title
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder={typeText.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-500"
            required
          />
        </div>

        {/* Date Input */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-200 text-sm font-medium flex items-center gap-1">
            Release Date
            <span className="text-red-400">*</span>
          </label>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={date}
              onChange={handleDateChange}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-500 pr-10"
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
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-white transition-colors"
            >
              <FiCalendar size={18} />
            </div>
          </div>
          <div className="text-gray-400 text-xs">Format: YYYY-MM-DD</div>
        </div>
      </div>

      {/* Access Type Selection */}
      <div className="flex flex-col gap-2" ref={accessDropdownRef}>
        <label className="text-gray-200 text-sm font-medium flex items-center gap-1">
          Access Type
          <span className="text-red-400">*</span>
        </label>

        {/* Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccessDropdown(!showAccessDropdown)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  selectedAccessType.color === "green"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : selectedAccessType.color === "blue"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                <IconComponent size={16} />
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">
                  {selectedAccessType.label}
                </div>
                <div className="text-gray-400 text-xs">
                  {selectedAccessType.description}
                </div>
              </div>
            </div>
            <FiChevronDown
              size={18}
              className={`text-gray-500 transition-transform ${
                showAccessDropdown ? "rotate-180 text-gray-300" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showAccessDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20 overflow-hidden">
              {ACCESS_TYPE_OPTIONS.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAccessTypeSelect(option.value)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-700/80 transition-colors ${
                      accessType === option.value ? "bg-gray-700/80" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        option.color === "green"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : option.color === "blue"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      <OptionIcon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {option.label}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {option.description}
                      </div>
                    </div>
                    {accessType === option.value && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="text-gray-400 text-xs">
          {typeText.accessDescription}
        </div>
      </div>

      {/* Price Input (only for purchase-only) */}
      {accessType === "purchase-only" && (
        <div className="flex flex-col gap-2">
          <label className="text-gray-200 text-sm font-medium flex items-center gap-1">
            Price (USD)
            <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiDollarSign size={16} />
              </div>
              <input
                type="number"
                placeholder="0.00"
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
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-500"
                min="0"
                step="0.01"
                required={accessType === "purchase-only"}
              />
            </div>
            <div className="w-32 bg-gray-800 text-gray-400 px-4 py-3 rounded-lg border border-gray-700 flex items-center justify-center text-sm">
              USD ($)
            </div>
          </div>
          <div className="text-gray-400 text-xs">
            Set price for individual purchase (USD only)
          </div>
        </div>
      )}

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-200 text-sm font-medium flex items-center gap-1">
          Description
          <span className="text-blue-400 text-xs font-normal ml-1">(Optional)</span>
        </label>
        <textarea
          placeholder={typeText.descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-[120px] bg-gray-800 text-white px-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-500 resize-none"
        />
        <div className="text-gray-400 text-xs">
          {typeText.descriptionLabel}
        </div>
      </div>
    </div>
  </div>

  {/* SECTION 2: ADD TRACK */}
{type !== "album" && (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-200 text-lg font-medium lowercase tracking-wide">upload track</h3>
      {tracks.length > 0 && (
        <div className="text-blue-400 text-sm font-medium">{tracks.length} file selected</div>
      )}
    </div>

    {/* Big Clickable Upload Area */}
    <label className={`relative overflow-hidden group border-2 border-dashed transition-all cursor-pointer rounded-2xl min-h-[180px] flex flex-col items-center justify-center p-8 text-center
      ${tracks.length > 0 
        ? "opacity-50 pointer-events-none border-gray-700 bg-gray-800/20" 
        : "bg-gray-800/40 border-blue-500 hover:bg-gray-800/60 shadow-xl"}`}>
      
      <input type="file" ref={fileInputRef} onChange={handleTrackUpload} accept=".wav,.aif,.aiff,.flac" className="hidden" disabled={tracks.length > 0} />
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

      {/* Center Icon Section */}
      <div className="mb-5 w-20 h-20 rounded-full border border-blue-500/30 bg-blue-500/5 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
        <div className="relative">
          <FiMusic size={32} />
          <div className="absolute -bottom-2 -right-2">
            <FiUpload size={16} />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <h4 className="text-white text-xl font-semibold tracking-tight">
          {tracks.length > 0 ? "Track Successfully Selected" : "Click anywhere to upload track"}
        </h4>
        <p className="text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
          {tracks.length > 0 
            ? "Remove existing track to upload a new one" 
            : "WAV, AIFF, or FLAC supported. Max 1 track for singles."}
        </p>
      </div>

      {/* Decorative pulse effect when no track is selected */}
      {!tracks.length && (
        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-2xl animate-pulse -z-10 group-hover:hidden"></div>
      )}
    </label>

    {/* Track Details List */}
    {tracks.map((track) => (
      <div key={track.id} className="bg-gray-800/30 rounded-xl border border-gray-700 p-5 mt-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] opacity-60">Track Details</h4>
          </div>
          <button onClick={() => removeTrack(track.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1.5 px-3 py-1 bg-red-400/10 rounded-full transition-all">
            <FiTrash2 size={14} /> remove
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-gray-500 text-xs font-bold uppercase">Track Name</label>
            {editingTrackId === track.id ? (
              <div className="flex items-center gap-2">
                <input autoFocus type="text" value={editTrackName} onChange={(e) => setEditTrackName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" ? saveTrackName(track.id) : e.key === "Escape" && cancelEditing()}
                  className="flex-1 bg-gray-900/50 text-white px-4 py-2 rounded-lg border border-blue-500/50 outline-none text-sm" />
                <button onClick={() => saveTrackName(track.id)} className="text-emerald-400 p-2"><FiCheck size={18}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/name cursor-pointer" onClick={() => startEditing(track.id, track.name)}>
                <span className="text-white text-base font-medium group-hover:text-blue-400 transition-colors">{track.name}</span>
                <FiEdit2 size={14} className="text-gray-500 opacity-0 group-hover/name:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Duration Field */}
          <div className="space-y-2">
            <label className="text-gray-500 text-xs font-bold uppercase">Duration</label>
            <div className="flex items-center gap-2.5 text-white text-base">
              <FiClock className="text-blue-500" size={18} />
              <span className={track.duration === "Loading..." ? "animate-pulse text-amber-400" : "font-mono"}>
                {track.duration}
              </span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

  {/* SECTION 3: GENRE SELECTION */}
  <div className="mt-6 border-t border-gray-700 pt-6">
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-200 text-lg font-medium lowercase tracking-wide">
          select genres<span className="text-red-400">*</span>
        </h3>
        <div className="text-gray-300 text-base font-medium">
          {selectedGenres.length}/3 selected
        </div>
      </div>

      {/* Selected Genres Display */}
    <div className="flex flex-wrap gap-2">
  {selectedGenres.map((genre, index) => (
    <div
      key={index}
      className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-2 rounded-lg group hover:border-blue-500/50 transition-colors"
    >
      <FiTag size={12} className="text-blue-400" />
      <span className="text-blue-300 text-sm font-medium">
        {genre}
      </span>
      <button
        type="button"
        onClick={() => removeGenre(genre)}
        className="text-gray-400 hover:text-red-400 transition-colors ml-1 p-0.5"
      >
        <FiX size={14} />
      </button>
    </div>
  ))}
</div>


      {/* Add Genre Button */}
      <button
        type="button"
        onClick={openGenreModal}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/30 transition-colors group font-medium"
        disabled={selectedGenres.length >= 3}
      >
        <FiPlus size={18} className="group-hover:text-blue-400 transition-colors" />
        <span className="text-sm">
          {selectedGenres.length >= 3 ? "Maximum genres selected" : "Add Genres"}
        </span>
      </button>

      <p className="text-gray-400 text-sm mt-1">
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
  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className={`text-gray-400 hover:text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:bg-gray-800/50 ${
        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      Cancel
    </button>
    <button
      type="submit"
      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-2.5 rounded-full font-medium transition-all shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      disabled={
        isSubmitting ||
        !coverImage||
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
        typeText.submitButton
      )}
    </button>
  </div>
</form>
  );
};

export default UploadForm;