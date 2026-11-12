import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FiDollarSign,
  FiChevronDown,
  FiImage,
} from "react-icons/fi";
import GenreModal from "./GenreModal";
import { toast } from "sonner";
import { compressCoverImage } from "../../../utills/imageCompression";

// Inner 3D panel style for main containers (matches Analytics Dashboard & Subscription Funnel)
const panelCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow:
    "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.6)",
};

// Reusable sunken input/dropzone style (recessed hole effect matching CardStat / Analytics)
const sunkenInputStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow:
    "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.04)",
};

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
  // New props for external upload progress
  audioUploadProgress = 0,
  coverImageUploadProgress = 0,
  isUploadingAudio = false,
  isUploadingCover = false,
}) => {
  // --- Basic Info State ---
  const [coverImage, setCoverImage] = useState(initialData.coverImage || null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [title, setTitle] = useState(initialData.title || "");
  const [copyright, setCopyright] = useState(initialData.copyright || "");
  const [date, setDate] = useState(
    initialData.date || new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState(initialData.description || "");
  const [isrc, setIsrc] = useState(initialData.isrc || "");

  // --- Access Type and Price State ---
  const [accessType, setAccessType] = useState(
    initialData.accessType || "subscription",
  );
  const [price, setPrice] = useState(initialData.price || "");
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);

  // --- Genre State ---
  const [selectedGenres, setSelectedGenres] = useState(
    initialData.genres || [],
  );
  const [showGenreModal, setShowGenreModal] = useState(false);

  // --- Tracks State (Single track only) ---
  const [tracks, setTracks] = useState(initialData.tracks || []);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editTrackName, setEditTrackName] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const hiddenDateInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
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

  // --- Price Validation ---
  const validatePrice = (priceValue) => {
    if (!priceValue) return false;
    const numPrice = parseFloat(priceValue);
    return !isNaN(numPrice) && numPrice > 0;
  };

  // --- Cover Image Handling ---
  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid image format");
      return;
    }

    if (file.size / 1024 / 1024 > 10) {
      toast.error("Image too large (max 10MB)");
      return;
    }

    try {
      // Compress image
      const compressedBlob = await compressCoverImage(file);

      // 🔥 Blob → File (MIME type preserve)
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, "") + ".webp",
        { type: "image/webp" },
      );

      const previewUrl = URL.createObjectURL(compressedFile);

      setCoverImage(previewUrl);
      setCoverImageFile(compressedFile);
    } catch (err) {
      console.error(err);
      toast.error("Image optimization failed", { id: "image" });
    }
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
      if (selectedGenres.length < 5) {
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

  // --- Track Upload Logic ---
  const handleTrackUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Only allow one file for single upload
    const file = files[0];

    // Validate audio file
    const validTypes = [".wav", ".aif", ".aiff", ".flac"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      toast.error("Invalid audio format. Please upload WAV, AIFF, FLAC");
      return;
    }

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

  const startEditing = (trackId, currentName) => {
    setEditingTrackId(trackId);
    setEditTrackName(currentName);
  };

  const saveTrackName = (trackId) => {
    if (editTrackName.trim() === "") {
      setEditingTrackId(null);
      return;
    }

    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, name: editTrackName.trim() } : track,
      ),
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

  const triggerCoverImageUpload = () => {
    coverImageInputRef.current?.click();
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

  // --- Submit Handler ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent submission if already submitting
    if (isSubmitting || isUploadingAudio || isUploadingCover) return;
    setIsLocked(true);

    // Validate required fields
    if (!coverImageFile) {
      toast.error("Please upload a cover image!");
      return;
    }

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

    // Validate audio track for songs
    if (type === "song" && tracks.length === 0) {
      toast.error("Please upload an audio track!");
      return;
    }

    // Prepare form data to pass to parent
    const formData = {
      type,
      title: title.trim(),
      date,
      description: type === "album" ? description : "",
      copyright: copyright.trim(),
      isrc: isrc.trim(),
      genre: selectedGenres,
      coverImageFile,
      accessType,
      price: accessType === "purchase-only" ? parseFloat(price) : null,
      tracks: tracks.map((track) => ({
        ...track,
        // Convert duration to seconds for backend
        durationInSeconds:
          track.duration === "Loading..."
            ? 180
            : convertDurationToSeconds(track.duration),
      })),
      basePrice:
        accessType === "purchase-only"
          ? {
              amount: parseFloat(price),
              currency: "USD",
            }
          : null,
    };

    // Call parent onSubmit with form data
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Helper to convert duration to seconds
  const convertDurationToSeconds = (durationString) => {
    if (durationString === "Loading..." || !durationString) {
      return 180; // Default 3 minutes
    }

    try {
      const parts = durationString.split(":");
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        return minutes * 60 + seconds;
      }
      return 180;
    } catch (error) {
      console.error("Error converting duration:", error);
      return 180;
    }
  };

  // Helper function to get type-specific text
  const getTypeText = () => {
    return {
      titleLabel: type === "album" ? "Album" : type === "mix" ? "Mix" : "Track",

      titlePlaceholder:
        type === "album"
          ? "Enter album title"
          : type === "mix"
            ? "Enter mix title"
            : "Enter track title",

      descriptionPlaceholder:
        type === "album"
          ? "Tell us about this album..."
          : type === "mix"
            ? "Tell us about this mix..."
            : "Tell us about this track...",

      accessDescription: `How users can access this ${
        type === "album" ? "album" : type === "mix" ? "mix" : "track"
      }`,

      isrcLabel: type === "album" ? "UPC" : type === "mix" ? "Mix ID" : "ISRC",

      isrcPlaceholder:
        type === "album"
          ? "e.g., 123456789012"
          : type === "mix"
            ? "e.g., MIX-001"
            : "e.g., US-ABC-12-34567",

      isrcDescription:
        type === "album"
          ? "Universal Product Code"
          : type === "mix"
            ? "Internal mix identifier"
            : "International Standard Recording Code",

      descriptionLabel: `Share the story behind this ${
        type === "album" ? "album" : type === "mix" ? "mix" : "track"
      }`,

      submitButton:
        type === "album"
          ? "create album"
          : type === "mix"
            ? "upload mix"
            : "upload track",
    };
  };

  const typeText = getTypeText();

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6"
    >
      {/* SECTION 1: Basic Info (Cover, Title, Date) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row gap-7 items-start relative overflow-hidden"
        style={panelCardStyle}
      >
        {/* Left Side: Image Upload */}
        <div className="w-full lg:w-[240px] shrink-0">
          <div className="h-[240px]">
            <input
              type="file"
              accept="image/*"
              id="cover-upload"
              ref={coverImageInputRef}
              onChange={handleCoverImageChange}
              className="hidden"
            />

            <label
              htmlFor="cover-upload"
              className="cursor-pointer block w-full h-full relative overflow-hidden group rounded-2xl transition-all duration-300"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
                border: "1.5px dashed rgba(77, 179, 255, 0.35)",
                boxShadow: "inset 0 3px 8px rgba(0, 0, 0, 0.8)",
              }}
            >
              {coverImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />

                  {/* Upload Progress Overlay */}
                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-14 h-14 mb-2">
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                          <div
                            className="absolute inset-0 rounded-full border-4 border-[#4DB3FF] border-t-transparent animate-spin"
                            style={{
                              transform: `rotate(${coverImageUploadProgress * 3.6}deg)`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-white text-sm font-semibold">
                        {Math.round(coverImageUploadProgress)}%
                      </span>
                    </div>
                  )}

                  {/* Hover Change Overlay */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-white/10 border border-white/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                      Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-[#0459FE]/15 border border-[#4DB3FF]/30 text-[#4DB3FF] flex items-center justify-center text-2xl mb-3 shadow-[0_0_15px_rgba(77,179,255,0.15)] group-hover:border-[#4DB3FF] transition-all">
                    <FiImage />
                  </div>
                  <span className="text-white text-sm font-semibold group-hover:text-[#4DB3FF] transition-colors">
                    Upload Cover Art <span className="text-red-400">*</span>
                  </span>
                  <span className="text-slate-400 text-xs mt-1">
                    Click or drag & drop an image
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Right Side: Inputs */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          {/* Title and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                {typeText.titleLabel} Title
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder={typeText.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={sunkenInputStyle}
                className="w-full text-white px-4 py-3 rounded-xl outline-none focus:border-[#4DB3FF] focus:ring-1 focus:ring-[#4DB3FF]/30 transition-all placeholder:text-slate-500 text-sm font-medium"
                required
                disabled={isSubmitting || isUploadingAudio || isUploadingCover}
              />
            </div>

            {/* Date Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                Release Date
                <span className="text-red-400">*</span>
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChange={handleDateChange}
                  style={sunkenInputStyle}
                  className="w-full text-white px-4 py-3 rounded-xl outline-none focus:border-[#4DB3FF] focus:ring-1 focus:ring-[#4DB3FF]/30 transition-all placeholder:text-slate-500 pr-12 text-sm font-medium"
                  disabled={isSubmitting || isUploadingAudio || isUploadingCover}
                />

                <input
                  type="date"
                  ref={hiddenDateInputRef}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
                />
                <div
                  onClick={openCalendar}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer bg-[#0459FE] hover:bg-[#3380FF] text-white p-2 rounded-lg transition-all shadow-[0_0_12px_rgba(4,89,254,0.4)] flex items-center justify-center active:scale-95"
                >
                  <FiCalendar size={16} />
                </div>
              </div>
              <div className="text-slate-400 text-xs">
                Format: YYYY-MM-DD
              </div>
            </div>
          </div>

          {/* Access Type Selection */}
          <div className="flex flex-col gap-1.5" ref={accessDropdownRef}>
            <label className="text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              Access Type
              <span className="text-red-400">*</span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAccessDropdown(!showAccessDropdown)}
                style={sunkenInputStyle}
                className="w-full rounded-xl px-4 py-3 flex items-center justify-between hover:border-white/20 focus:border-[#4DB3FF] focus:ring-1 focus:ring-[#4DB3FF]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isSubmitting || isUploadingAudio || isUploadingCover}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedAccessType.color === "green"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : selectedAccessType.color === "blue"
                          ? "bg-[#0459FE]/20 text-[#4DB3FF] border border-[#0459FE]/40 shadow-[0_0_10px_rgba(77,179,255,0.15)]"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-white text-sm font-bold">
                      {selectedAccessType.label}
                    </div>
                    <div className="text-slate-400 text-xs font-medium">
                      {selectedAccessType.description}
                    </div>
                  </div>
                </div>
                <FiChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 ${
                    showAccessDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showAccessDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#090e1a] border border-white/15 rounded-xl shadow-2xl shadow-black/90 z-30 overflow-hidden divide-y divide-white/5"
                  >
                    {ACCESS_TYPE_OPTIONS.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = accessType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAccessTypeSelect(option.value)}
                          className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#0459FE]/15 border-l-4 border-[#4DB3FF]"
                              : "hover:bg-white/[0.04] border-l-4 border-transparent"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              option.color === "green"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : option.color === "blue"
                                  ? "bg-[#0459FE]/20 text-[#4DB3FF] border border-[#0459FE]/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            <OptionIcon size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-semibold">
                              {option.label}
                            </div>
                            <div className="text-slate-400 text-xs">
                              {option.description}
                            </div>
                          </div>
                          {isSelected && (
                            <FiCheck className="text-[#4DB3FF] shrink-0" size={18} />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-slate-400 text-xs">
              {typeText.accessDescription}
            </div>
          </div>

          {/* Price Input (only for purchase-only) */}
          {accessType === "purchase-only" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                Price (USD)
                <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
                        setPrice(value);
                      }
                    }}
                    style={sunkenInputStyle}
                    className="w-full text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#4DB3FF] focus:ring-1 focus:ring-[#4DB3FF]/30 transition-all placeholder:text-slate-500 text-sm font-medium"
                    min="0"
                    step="0.01"
                    required={accessType === "purchase-only"}
                    disabled={isSubmitting || isUploadingAudio || isUploadingCover}
                  />
                </div>
                <div
                  style={sunkenInputStyle}
                  className="w-32 text-slate-300 px-4 py-3 rounded-xl flex items-center justify-center text-sm font-semibold tracking-wider font-mono"
                >
                  USD ($)
                </div>
              </div>
              <div className="text-slate-400 text-xs">
                Set price for individual purchase (USD only)
              </div>
            </div>
          )}

          {/* Description (only for album type) */}
          {type === "album" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                Description
              </label>
              <textarea
                placeholder={typeText.descriptionPlaceholder}
                value={description}
                maxLength={300}
                onChange={(e) => setDescription(e.target.value)}
                style={sunkenInputStyle}
                className="w-full h-[120px] text-white px-4 py-3 rounded-xl outline-none focus:border-[#4DB3FF] focus:ring-1 focus:ring-[#4DB3FF]/30 transition-all placeholder:text-slate-500 resize-none text-sm font-medium"
                disabled={isSubmitting || isUploadingAudio || isUploadingCover}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-400">{typeText.descriptionLabel}</span>
                <span
                  className={`font-medium ${
                    description.length > 280 ? "text-amber-300" : "text-slate-400"
                  }`}
                >
                  {description.length}/300
                </span>
              </div>
            </div>
          )}

          {/* Copyright */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-200 text-xs font-bold uppercase tracking-wider">
              Copyright
            </label>
            <input
              type="text"
              placeholder="© Your Name / Label"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              style={sunkenInputStyle}
              className="w-full text-white px-4 py-3 rounded-xl outline-none focus:border-[#4DB3FF] focus:ring-1 focus:ring-[#4DB3FF]/30 transition-all placeholder:text-slate-500 text-sm font-medium"
              disabled={isSubmitting || isUploadingAudio || isUploadingCover}
            />
            <div className="text-slate-400 text-xs">
              Ownership or label info
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: ADD TRACK */}
      {type !== "album" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
          className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden"
          style={panelCardStyle}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white text-base font-bold lowercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#0459FE]" />
              upload track
            </h3>
            {tracks.length > 0 && (
              <div className="text-[#4DB3FF] text-xs font-semibold px-3 py-1 rounded-full bg-[#0459FE]/15 border border-[#4DB3FF]/30 shadow-[0_0_10px_rgba(77,179,255,0.15)]">
                {tracks.length} file selected
              </div>
            )}
          </div>

          {/* Big Clickable Upload Area */}
          <label
            className={`relative overflow-hidden group border-2 border-dashed transition-all duration-300 cursor-pointer rounded-2xl min-h-[170px] flex flex-col items-center justify-center p-7 text-center
            ${
              tracks.length > 0 || isUploadingAudio
                ? "opacity-60 pointer-events-none border-white/10"
                : "border-[#4DB3FF]/40 hover:border-[#4DB3FF] hover:shadow-[0_0_25px_rgba(77,179,255,0.15)]"
            }`}
            style={{
              background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
              boxShadow: "inset 0 3px 8px rgba(0, 0, 0, 0.8)",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleTrackUpload}
              accept=".wav,.aif,.aiff,.flac"
              className="hidden"
              disabled={tracks.length > 0 || isUploadingAudio || isSubmitting}
            />

            {/* Center Icon Section */}
            <div className="mb-4 w-16 h-16 rounded-2xl border border-[#4DB3FF]/30 bg-[#0459FE]/15 flex items-center justify-center text-[#4DB3FF] shadow-[0_0_20px_rgba(77,179,255,0.15)] group-hover:scale-105 transition-transform duration-300">
              {isUploadingAudio ? (
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-[#4DB3FF] border-t-transparent animate-spin"
                    style={{
                      transform: `rotate(${audioUploadProgress * 3.6}deg)`,
                    }}
                  ></div>
                </div>
              ) : (
                <FiUpload size={28} className="text-[#4DB3FF]" />
              )}
            </div>

            {/* Text Content */}
            <div className="space-y-1.5">
              <h4 className="text-white text-lg font-bold tracking-tight">
                {isUploadingAudio
                  ? `Uploading... ${audioUploadProgress}%`
                  : tracks.length > 0
                    ? "File Successfully Selected"
                    : type === "mix"
                      ? "Click anywhere to upload mix"
                      : "Click anywhere to upload track"}
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                {isUploadingAudio
                  ? "Uploading, please wait..."
                  : tracks.length > 0
                    ? "Remove existing file to upload a new one"
                    : type === "mix"
                      ? "WAV, AIFF, FLAC supported. Upload your full DJ mix."
                      : "WAV, AIFF, FLAC supported. Max 1 track for singles."}
              </p>
            </div>

            {/* Progress Bar for Upload */}
            {isUploadingAudio && (
              <div className="w-64 mt-4 bg-gray-800 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-[#0F3272] to-[#3380FF] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${audioUploadProgress}%` }}
                ></div>
              </div>
            )}
          </label>

          {/* Track Details List */}
          {tracks.map((track) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={track.id}
              className="rounded-xl border border-white/10 p-5 mt-2"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#4DB3FF] rounded-full shadow-[0_0_8px_rgba(77,179,255,0.8)] animate-pulse"></div>
                  <h4 className="text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">
                    Track Details
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => removeTrack(track.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSubmitting || isUploadingAudio}
                >
                  <FiTrash2 size={13} /> remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Track Name
                  </label>
                  {editingTrackId === track.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editTrackName}
                        onChange={(e) => setEditTrackName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter"
                            ? saveTrackName(track.id)
                            : e.key === "Escape" && cancelEditing()
                        }
                        className="flex-1 bg-[#070b14] text-white px-3.5 py-2 rounded-lg border border-[#4DB3FF] outline-none text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                        disabled={isSubmitting || isUploadingAudio}
                      />
                      <button
                        type="button"
                        onClick={() => saveTrackName(track.id)}
                        className="text-emerald-400 hover:text-emerald-300 p-2 cursor-pointer"
                      >
                        <FiCheck size={18} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 group/name cursor-pointer py-1"
                      onClick={() => startEditing(track.id, track.name)}
                    >
                      <span className="text-white text-base font-semibold group-hover:text-[#4DB3FF] transition-colors">
                        {track.name}
                      </span>
                      {!(isSubmitting || isUploadingAudio) && (
                        <FiEdit2
                          size={14}
                          className="text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Duration Field */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Duration
                  </label>
                  <div className="flex items-center gap-2.5 text-white text-base font-semibold py-1">
                    <FiClock className="text-[#4DB3FF]" size={18} />
                    <span
                      className={
                        track.duration === "Loading..."
                          ? "animate-pulse text-amber-400"
                          : "font-mono"
                      }
                    >
                      {track.duration}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* SECTION 3: GENRE SELECTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
        className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden"
        style={panelCardStyle}
      >
        <div className="flex flex-col gap-3">
          {/* Header with label and counter */}
          <div className="flex items-center justify-between">
            <h3 className="text-white text-base font-bold lowercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#0459FE]" />
              select genres
              <span className="text-red-400">*</span>
            </h3>
            <div
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                selectedGenres.length === 5
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-white/5 text-slate-300 border border-white/10"
              }`}
            >
              {selectedGenres.length}/5 selected
            </div>
          </div>

          {/* Selected Genres Chips */}
          {selectedGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedGenres.map((genre, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#0459FE]/15 border border-[#4DB3FF]/40 px-3.5 py-1.5 rounded-xl text-[#4DB3FF] shadow-[0_0_12px_rgba(77,179,255,0.12)] group hover:border-[#4DB3FF] transition-all"
                >
                  <FiTag size={13} className="text-[#4DB3FF]" />
                  <span className="text-sm font-semibold">{genre}</span>
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-400/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={isSubmitting || isUploadingAudio || isUploadingCover}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Genre Button */}
          <button
            type="button"
            onClick={openGenreModal}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-dashed rounded-xl font-semibold transition-all cursor-pointer
              ${
                selectedGenres.length >= 5
                  ? "border-white/10 text-slate-500 cursor-not-allowed bg-white/[0.02]"
                  : "border-white/20 text-slate-200 hover:text-white hover:border-[#4DB3FF] hover:bg-[#0459FE]/10 active:scale-[0.99] shadow-sm"
              }`}
            disabled={
              selectedGenres.length >= 5 ||
              isSubmitting ||
              isUploadingAudio ||
              isUploadingCover
            }
          >
            <FiPlus
              size={18}
              className={
                selectedGenres.length >= 5
                  ? "text-slate-500"
                  : "text-[#4DB3FF]"
              }
            />
            <span className="text-sm">
              {selectedGenres.length >= 5
                ? "Maximum genres selected"
                : "Add Genres"}
            </span>
          </button>

          {/* Helper text */}
          <p className="text-slate-400 text-xs">
            Select up to 5 genres that best describe your music
          </p>
        </div>
      </motion.div>

      {/* Genre Modal */}
      <GenreModal
        isOpen={showGenreModal}
        onClose={closeGenreModal}
        selectedGenres={selectedGenres}
        onToggleGenre={toggleGenre}
        onClearAll={clearAllGenres}
        maxSelections={5}
      />

      {/* Submit Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35 }}
        className="flex items-center justify-end gap-3 pt-4 border-t border-white/10"
      >
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isSubmitting || isUploadingAudio || isUploadingCover}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm cursor-pointer ${
            isSubmitting || isUploadingAudio || isUploadingCover
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-3 rounded-xl text-white font-bold text-sm tracking-wide cursor-pointer border-none transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_25px_rgba(51,128,255,0.4)]"
          style={{
            background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
          }}
          disabled={
            isLocked ||
            isSubmitting ||
            isUploadingAudio ||
            isUploadingCover ||
            !coverImageFile ||
            selectedGenres.length === 0 ||
            !title.trim() ||
            (accessType === "purchase-only" && !validatePrice(price)) ||
            (type === "song" && tracks.length === 0)
          }
        >
          {isSubmitting || isUploadingAudio || isUploadingCover ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>
                {isUploadingAudio || isUploadingCover
                  ? "Uploading..."
                  : "Saving..."}
              </span>
            </div>
          ) : (
            typeText.submitButton
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default UploadForm;
