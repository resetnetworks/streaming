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
  FiGrid,
  FiHash,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { FaBarcode } from "react-icons/fa";
import GenreModal from "./GenreModal";

const UploadForm = ({
  type = "song", // "song" (single) ya "album"
  initialData = {},
  onCancel,
  onSubmit
}) => {
  // --- Basic Info State ---
  const [coverImage, setCoverImage] = useState(initialData.coverImage || null);
  const [title, setTitle] = useState(initialData.title || "");
  const [date, setDate] = useState(initialData.date || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [isrc, setIsrc] = useState(initialData.isrc || "");
  const [upc, setUpc] = useState(initialData.upc || ""); // Added UPC state
  
  // --- Genre State ---
  const [selectedGenres, setSelectedGenres] = useState(initialData.genres || []);
  const [showGenreModal, setShowGenreModal] = useState(false);

  // --- Tracks State ---
  const [tracks, setTracks] = useState(initialData.tracks || []);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editTrackName, setEditTrackName] = useState("");

  const hiddenDateInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Date Logic ---
  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [date]);

  // Initialize tracks with order
  useEffect(() => {
    if (tracks.length > 0 && type === "album") {
      const hasOrder = tracks.some(track => track.order);
      if (!hasOrder) {
        const updatedTracks = tracks.map((track, index) => ({
          ...track,
          order: index + 1
        }));
        setTracks(updatedTracks);
      }
    }
  }, [tracks, type]);

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
      hiddenDateInputRef.current.showPicker?.() || hiddenDateInputRef.current.focus();
    }
  };

  // --- ISRC Number Validation ---
  const validateISRC = (isrc) => {
    // Basic ISRC format validation: CC-XXX-YY-NNNNN
    const isrcRegex = /^[A-Z]{2}-[A-Z0-9]{3}-[0-9]{2}-[0-9]{5}$/;
    return isrcRegex.test(isrc);
  };

  // --- UPC Number Validation ---
  const validateUPC = (upc) => {
    // UPC-A format: 12 digits
    const upcRegex = /^\d{12}$/;
    return upcRegex.test(upc);
  };

  // --- UPC Check Digit Calculation ---
  const calculateUPCCheckDigit = (digits) => {
    if (digits.length !== 11) return null;
    
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(digits[i]);
      // Odd positions (1-based) are multiplied by 3
      // Even positions are multiplied by 1
      sum += (i % 2 === 0) ? digit * 3 : digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  };

  const formatUPC = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 11) {
      return digits;
    } else if (digits.length === 12) {
      // Validate check digit if we have full UPC
      const first11 = digits.slice(0, 11);
      const lastDigit = digits.slice(11, 12);
      const calculatedCheck = calculateUPCCheckDigit(first11);
      
      if (calculatedCheck !== null && parseInt(lastDigit) === calculatedCheck) {
        return digits;
      }
    }
    
    return digits.slice(0, 12);
  };

  const handleUPCChange = (value) => {
    const formatted = formatUPC(value);
    setUpc(formatted);
  };


  // --- Genre Functions ---
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  const removeGenre = (genre) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
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
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

    // First add tracks with loading state
    const tempTracks = files.map((file, index) => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      file: file,
      duration: "Loading...",
      isrc: "", // Add ISRC field for each track
      order: type === "album" ? tracks.length + index + 1 : 1 // Set order for album
    }));

    if (type === "song") {
      setTracks([tempTracks[0]]);
    } else {
      setTracks((prev) => [...prev, ...tempTracks]);
    }

    // Then update with actual duration
    const updatedTracks = await Promise.all(
      tempTracks.map(async (tempTrack, index) => {
        const duration = await getAudioDuration(files[index]);
        return { ...tempTrack, duration };
      })
    );

    // Update tracks with real duration
    if (type === "song") {
      setTracks([updatedTracks[0]]);
    } else {
      setTracks((prev) => {
        const updatedPrev = prev.map(track => {
          const updated = updatedTracks.find(t => t.name === track.name);
          return updated || track;
        });
        return updatedPrev;
      });
    }
  };

  const removeTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    // Reorder tracks after removal
    if (type === "album") {
      setTracks(prev => 
        prev.map((track, index) => ({
          ...track,
          order: index + 1
        }))
      );
    }
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

    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, name: editTrackName.trim() }
        : track
    ));
    setEditingTrackId(null);
  };

  const cancelEditing = () => {
    setEditingTrackId(null);
    setEditTrackName("");
  };

  // --- Track ISRC Editing Functions ---
  const handleTrackISRCChange = (trackId, value) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, isrc: value.toUpperCase() }
        : track
    ));
  };

  // --- Simple Move Up/Down Functions for Album ---
  const moveTrackUp = (index) => {
    if (index === 0) return;
    const newTracks = [...tracks];
    [newTracks[index], newTracks[index - 1]] = [newTracks[index - 1], newTracks[index]];
    
    const orderedTracks = newTracks.map((track, idx) => ({
      ...track,
      order: idx + 1
    }));
    
    setTracks(orderedTracks);
  };

  const moveTrackDown = (index) => {
    if (index === tracks.length - 1) return;
    const newTracks = [...tracks];
    [newTracks[index], newTracks[index + 1]] = [newTracks[index + 1], newTracks[index]];
    
    const orderedTracks = newTracks.map((track, idx) => ({
      ...track,
      order: idx + 1
    }));
    
    setTracks(orderedTracks);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // --- Submit Logic ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      type,
      title,
      date,
      description,
      isrc: type === "song" ? isrc : undefined,
      upc: type === "album" ? upc : undefined, // Only include UPC for albums
      genres: selectedGenres,
      coverImage,
      tracks: tracks.map(track => ({
        ...track,
        isrc: track.isrc || null
      }))
    };
    console.log("Full Form Data:", formData);
    onSubmit?.(formData);
    onCancel?.();
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
                  src={typeof coverImage === 'string' ? coverImage : URL.createObjectURL(coverImage)}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative border border-gray-700">
                   {/* Abstract bars visual */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-30">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] bg-white"
                        style={{ height: `${Math.random() * 50 + 20}%` }}
                      ></div>
                    ))}
                  </div>
                  <span className="relative z-10 text-white/70 font-mono text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded">
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
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">
                {type === "album" ? "Album Title" : "Title"}
              </label>
              <input
                type="text"
                placeholder={type === "album" ? "The Album" : "song title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600"
              />
            </div>

            {/* Date Input */}
            <div className="flex-1 flex flex-col gap-2 relative">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Release Date</label>
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

          {/* ISRC Number (Only for Singles) */}
          {type === "song" && (
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <FiHash size={12} />
                ISRC Number
                <span className="text-blue-400 text-xs font-normal normal-case">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., US-ABC-12-34567"
                  value={isrc}
                  onChange={(e) => setIsrc(e.target.value.toUpperCase())}
                  className="w-full bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600"
                />
                {isrc && !validateISRC(isrc) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-red-400 text-xs">Invalid format</span>
                  </div>
                )}
                {isrc && validateISRC(isrc) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-green-400 text-xs">✓ Valid</span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-xs">
                Format: CC-XXX-YY-NNNNN (e.g., US-ABC-12-34567)
              </p>
            </div>
          )}

          {/* UPC Number (Only for Albums) */}
          {type === "album" && (
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <FaBarcode size={12} />
                UPC Number
                <span className="text-blue-400 text-xs font-normal normal-case">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., 012345678912"
                  value={upc}
                  onChange={(e) => handleUPCChange(e.target.value)}
                  maxLength={12}
                  className="w-full bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {upc.length === 12 && validateUPC(upc) && (
                    <span className="text-green-400 text-xs">✓ Valid</span>
                  )}
                  {upc.length > 0 && upc.length < 12 && (
                    <span className="text-yellow-400 text-xs">{12 - upc.length} more</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500 text-xs">
                  Format: 12 digits (e.g., 012345678912)
                </p>
              </div>
              {upc.length === 12 && !validateUPC(upc) && (
                <p className="text-red-400 text-xs">
                  Invalid UPC format. Must be exactly 12 digits.
                </p>
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">
              Description
            </label>
            <textarea
              placeholder="Tell us about this release..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[125px] bg-[#121214] text-white px-4 py-3 rounded-lg outline-none border border-gray-800 focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ADD TRACKS */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-300 text-lg font-normal lowercase tracking-wide">
            add tracks
          </h3>
          {type === "album" && tracks.length > 1 && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <FiGrid size={14} />
              <span className="text-xs">Use buttons to reorder tracks</span>
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
                 <FiUpload size={14} className="absolute -bottom-1 -right-2 bg-[#050507] rounded-full" />
               </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <h4 className="text-white text-lg font-medium lowercase">
                mastered tracks upload
              </h4>
              <p className="text-gray-500 text-sm max-w-md">
                choose files to upload. {type === "album" ? "you can select multiple files at a time." : "only 1 track allowed for singles."}
              </p>
              <p className="text-blue-500/60 text-xs mt-1">
                Supported file type: lossless .wav, .aif or .flac
              </p>
            </div>
          </div>

          <div className="z-10">
            <input
              type="file"
              multiple={type === "album"}
              ref={fileInputRef}
              onChange={handleTrackUpload}
              accept=".wav,.aif,.aiff,.flac,.mp3"
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerFileUpload}
              className="px-6 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-800 transition-all text-sm uppercase tracking-wider"
            >
              choose file
            </button>
          </div>
        </div>

        {/* Tracks List Table */}
        <div className="w-full mt-2">
          {/* Table Header */}
          <div className="flex items-center text-gray-400 text-sm pb-2 border-b border-gray-800 mb-2 px-2">
            <div className={`${type === "album" ? "w-20" : "w-0"} transition-all`}>
              {type === "album" && (
                <div className="flex items-center justify-center">
                  <span className="text-xs">reorder</span>
                </div>
              )}
            </div>
            <div className="flex-1">track name</div>
            <div className="w-20 text-center">order</div>
            {type === "album" && (
              <div className="w-32">isrc (optional)</div>
            )}
            <div className="w-24 text-right">duration</div>
            <div className="w-10"></div>
          </div>

          {/* List Items */}
          <div className="flex flex-col gap-0">
            {tracks.length === 0 && (
              <div className="text-gray-600 text-sm italic py-4 text-center lowercase">
                no tracks added yet...
              </div>
            )}

            {tracks.map((track, index) => (
              <div 
                key={track.id} 
                className="group flex items-center py-3 px-2 border-b border-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#020617] hover:via-[#001b3d] hover:to-[#020617]"
              >
                {/* Reorder Controls for Album */}
                {type === "album" && (
                  <div className="w-20 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveTrackUp(index)}
                      disabled={index === 0}
                      className={`p-1.5 rounded ${index === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800/50'}`}
                      title="Move up"
                    >
                      <FiChevronUp size={14} />
                    </button>
                    
                    <div className="text-xs text-gray-500 font-mono">
                      {track.order}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => moveTrackDown(index)}
                      disabled={index === tracks.length - 1}
                      className={`p-1.5 rounded ${index === tracks.length - 1 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800/50'}`}
                      title="Move down"
                    >
                      <FiChevronDown size={14} />
                    </button>
                  </div>
                )}

                {/* Track Name & Edit */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="text-blue-500 opacity-70">
                    <FiMusic size={18} />
                  </div>
                  
                  {editingTrackId === track.id ? (
                    // Edit Mode
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTrackName}
                        onChange={(e) => setEditTrackName(e.target.value)}
                        className="bg-[#1a1a1d] text-white px-2 py-1 rounded border border-blue-500/50 focus:outline-none focus:border-blue-500 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTrackName(track.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => saveTrackName(track.id)}
                        className="text-green-500 hover:text-green-400 transition-colors"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <span className="text-gray-200 text-sm font-medium truncate max-w-[150px] md:max-w-xs group-hover:text-white">
                        {track.name}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => startEditingTrack(track)}
                        className="text-gray-600 group-hover:text-white/80 transition-colors"
                        title="Edit track name"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Order Number Display */}
                <div className="w-20 text-center text-gray-500 text-sm group-hover:text-white/70 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold border border-gray-700">
                    {track.order}
                  </div>
                </div>

                {/* ISRC Input for Album Tracks */}
                {type === "album" && (
                  <div className="w-32 px-2">
                    <input
                      type="text"
                      placeholder="ISRC"
                      value={track.isrc || ""}
                      onChange={(e) => handleTrackISRCChange(track.id, e.target.value)}
                      className="w-full bg-[#1a1a1d] text-white px-2 py-1 rounded text-xs border border-gray-700 focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                  </div>
                )}

                {/* Duration with Blue Clock Icon */}
                <div className="w-24 flex items-center justify-end gap-2 text-gray-400 text-sm group-hover:text-white/60">
                  <FiClock size={14} className="text-blue-500" />
                  <span className={track.duration === "Loading..." ? "text-yellow-500" : ""}>
                    {track.duration}
                  </span>
                </div>

                {/* Delete Action */}
                <div className="w-10 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => removeTrack(track.id)}
                    className="text-gray-600 hover:text-red-500 transition-colors p-2 group-hover:text-gray-400"
                    disabled={editingTrackId === track.id}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: GENRE SELECTION */}
      <div className="mt-6 border-t border-gray-800 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-300 text-lg font-normal lowercase tracking-wide">
              select genres
            </h3>
            <div className="text-gray-500 text-xs">
              {selectedGenres.length}/3 selected
            </div>
          </div>

          {/* Selected Genres Display */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedGenres.length === 0 ? (
              <div className="text-gray-600 text-sm italic py-2">
                no genres selected yet. click the button below to add.
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
            <span className="text-sm">add genres</span>
          </button>

          <p className="text-gray-500 text-xs mt-1">
            select up to 3 genres that best describe your music
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
            className="text-gray-400 hover:text-white px-4 py-2 transition-colors"
         >
            Cancel
         </button>
         <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            disabled={selectedGenres.length === 0}
         >
            Submit Release
         </button>
      </div>

    </form>
  );
};

export default UploadForm;