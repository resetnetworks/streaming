import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiMusic, FiCheck, FiX, FiTrash2, FiClock, FiEdit2, FiSave } from "react-icons/fi";

const SongUploadStep = ({ 
  onSongsSelected, 
  onStartUpload, 
  uploadedSongs = [],
  isUploading, 
  hasStartedUpload,
  currentUploadIndex = 0,
  uploadProgress = 0
}) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [songsWithStatus, setSongsWithStatus] = useState([]);
  const [editingSongId, setEditingSongId] = useState(null);
  const [editSongName, setEditSongName] = useState("");
  const fileInputRef = useRef(null);
  
  // Initialize songs with status when selected
  useEffect(() => {
    if (selectedSongs.length > 0) {
      const songsWithInitialStatus = selectedSongs.map(song => ({
        ...song,
        status: 'pending', // pending, uploading, success, error
        progress: 0,
        error: null
      }));
      setSongsWithStatus(songsWithInitialStatus);
    }
  }, [selectedSongs]);
  
  // Update progress for current song
  useEffect(() => {
    if (isUploading && songsWithStatus.length > 0 && currentUploadIndex < songsWithStatus.length) {
      setSongsWithStatus(prev => 
        prev.map((song, index) => 
          index === currentUploadIndex 
            ? { ...song, status: 'uploading', progress: uploadProgress }
            : song
        )
      );
    }
  }, [isUploading, currentUploadIndex, uploadProgress]);
  
  // Update success status when songs are uploaded
  useEffect(() => {
    if (uploadedSongs.length > 0) {
      setSongsWithStatus(prev => 
        prev.map((song, index) => {
          const uploadedSong = uploadedSongs.find(us => us.originalIndex === index);
          if (uploadedSong) {
            return { 
              ...song, 
              status: 'success', 
              progress: 100,
              uploadedData: uploadedSong
            };
          }
          return song;
        })
      );
    }
  }, [uploadedSongs]);
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newSongs = files.map((file, index) => {
      // Extract duration from audio file
      const getDuration = () => {
        return new Promise((resolve) => {
          const audio = document.createElement('audio');
          audio.preload = 'metadata';
          
          audio.onloadedmetadata = () => {
            window.URL.revokeObjectURL(audio.src);
            const duration = audio.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            resolve({
              duration: formattedTime,
              durationInSeconds: duration
            });
          };
          
          audio.onerror = () => {
            window.URL.revokeObjectURL(audio.src);
            resolve({
              duration: "00:00",
              durationInSeconds: 0
            });
          };
          
          audio.src = URL.createObjectURL(file);
        });
      };
      
      // Remove file extension from name
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      
      return {
        id: Date.now() + index,
        file,
        name: fileName,
        originalName: fileName, // Store original name for reference
        status: "pending",
        progress: 0,
        getDuration
      };
    });
    
    // Update durations asynchronously
    Promise.all(newSongs.map(async (song) => {
      const durationInfo = await song.getDuration();
      return {
        ...song,
        duration: durationInfo.duration,
        durationInSeconds: durationInfo.durationInSeconds
      };
    })).then(songsWithDuration => {
      setSelectedSongs(prev => [...prev, ...songsWithDuration]);
    });
  };
  
  const removeSong = (id) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== id));
    setSongsWithStatus(prev => prev.filter(song => song.id !== id));
    setEditingSongId(null); // Cancel edit if removing
  };
  
  const startEditSong = (song) => {
    setEditingSongId(song.id);
    setEditSongName(song.name);
  };
  
  const saveEditSong = (id) => {
    if (!editSongName.trim()) {
      alert("Song name cannot be empty!");
      return;
    }
    
    setSelectedSongs(prev =>
      prev.map(song =>
        song.id === id
          ? { ...song, name: editSongName.trim() }
          : song
      )
    );
    
    setSongsWithStatus(prev =>
      prev.map(song =>
        song.id === id
          ? { ...song, name: editSongName.trim() }
          : song
      )
    );
    
    setEditingSongId(null);
    setEditSongName("");
  };
  
  const cancelEdit = () => {
    setEditingSongId(null);
    setEditSongName("");
  };
  
  const handleConfirmSelection = () => {
    if (selectedSongs.length === 0) {
      alert("Please select at least one song!");
      return;
    }
    
    // Cancel any active edit
    if (editingSongId) {
      cancelEdit();
    }
    
    // Prepare songs for upload
    const preparedSongs = selectedSongs.map(song => ({
      title: song.name,
      audioFile: song.file,
      duration: song.durationInSeconds || 180,
      name: song.name,
      originalName: song.originalName
    }));
    
    onSongsSelected(preparedSongs);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleStartUpload = () => {
    if (selectedSongs.length === 0 && !hasStartedUpload) {
      alert("Please select songs first!");
      return;
    }
    
    // Cancel any active edit
    if (editingSongId) {
      cancelEdit();
    }
    
    onStartUpload();
  };
  
  // Get status color and icon
  const getStatusInfo = (status, progress) => {
    switch(status) {
      case 'success':
        return { 
          color: 'text-green-500', 
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          icon: <FiCheck size={14} className="text-green-500" />,
          text: 'Uploaded'
        };
      case 'uploading':
        return { 
          color: 'text-blue-500', 
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          icon: (
            <div className="relative w-5 h-5">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ),
          text: `${progress}%`
        };
      case 'error':
        return { 
          color: 'text-red-500', 
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          icon: <FiX size={14} className="text-red-500" />,
          text: 'Failed'
        };
      default:
        return { 
          color: 'text-gray-500', 
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          icon: null,
          text: 'Pending'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* File upload area */}
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".wav,.aif,.aiff,.flac"
          multiple
          className="hidden"
        />
        
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-900/20 border-2 border-blue-500/30 flex items-center justify-center">
            <FiUpload size={32} className="text-blue-400" />
          </div>
        </div>
        
        <h3 className="text-white text-xl mb-2">Select Songs for Album</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Upload multiple audio files to add to your album. You can select WAV, AIFF or files FLAC.
        </p>
        
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={hasStartedUpload && isUploading}
          className={`px-6 py-3 rounded-full font-medium inline-flex items-center gap-2 ${
            hasStartedUpload && isUploading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <FiMusic size={18} />
          {hasStartedUpload && isUploading ? 'Uploading...' : 'Choose Audio Files'}
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          Selected: {selectedSongs.length} file{selectedSongs.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Songs list with progress */}
      {songsWithStatus.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white">Songs List</h4>
            <span className="text-gray-400 text-sm">
              {songsWithStatus.filter(s => s.status === 'success').length} of {songsWithStatus.length} uploaded
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {songsWithStatus.map((song, index) => {
              const statusInfo = getStatusInfo(song.status, song.progress);
              const isCurrentUploading = song.status === 'uploading';
              const isEditing = editingSongId === song.id;
              
              return (
                <div 
                  key={song.id} 
                  className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Song number */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${statusInfo.color} bg-black/30`}>
                        {index + 1}
                      </div>
                      
                      {/* Song info */}
                      <div className="flex-1 min-w-0">
                        {/* Song name display/edit */}
                        {isEditing ? (
                          <div className="mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editSongName}
                                onChange={(e) => setEditSongName(e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                                placeholder="Enter song name"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditSong(song.id);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <button
                                onClick={() => saveEditSong(song.id)}
                                className="p-2 bg-green-600 hover:bg-green-500 text-white rounded"
                                title="Save"
                              >
                                <FiSave size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                                title="Cancel"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Original: {song.originalName}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium truncate">{song.name}</p>
                            {song.name !== song.originalName && (
                              <span className="text-xs text-gray-500" title="Original name">
                                ({song.originalName})
                              </span>
                            )}
                            {statusInfo.icon && (
                              <div className={`p-1 rounded ${statusInfo.bgColor}`}>
                                {statusInfo.icon}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <FiClock size={12} />
                            <span>{song.duration || "00:00"}</span>
                          </div>
                          <span>•</span>
                          <span className={`${statusInfo.color} font-medium`}>
                            {statusInfo.text}
                          </span>
                          {song.status === 'pending' && !isEditing && (
                            <>
                              <span>•</span>
                              <span className="text-blue-400 cursor-help" title="Click edit button to rename">
                                Editable
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Progress bar for uploading songs */}
                      {isCurrentUploading && (
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                            style={{ width: `${song.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {/* Edit button - only for pending songs */}
                      {song.status === 'pending' && !isEditing && (
                        <button
                          onClick={() => startEditSong(song)}
                          className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                          title="Edit song name"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      )}
                      
                      {/* Delete button - only for pending songs */}
                      {song.status === 'pending' && (
                        <button
                          onClick={() => removeSong(song.id)}
                          className="text-red-400 hover:text-red-300 p-1 transition-colors"
                          title="Remove song"
                          disabled={isEditing}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional details for uploaded songs */}
                  {song.status === 'success' && song.uploadedData && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="text-xs text-gray-400">
                        Uploaded as: <span className="text-green-400">{song.uploadedData.song?.title}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Error message for failed uploads */}
                  {song.status === 'error' && song.error && (
                    <div className="mt-3 pt-3 border-t border-red-500/30">
                      <div className="text-xs text-red-400">
                        Error: {song.error}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              {songsWithStatus.length} song{songsWithStatus.length !== 1 ? 's' : ''} selected
              {editingSongId && (
                <span className="ml-2 text-yellow-500">
                  • Editing mode active
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              {!hasStartedUpload && (
                <button
                  onClick={handleConfirmSelection}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full transition-colors"
                  disabled={!!editingSongId}
                >
                  {editingSongId ? 'Finish Editing First' : 'Confirm Selection'}
                </button>
              )}
              
              {hasStartedUpload && !isUploading && (
                <button
                  onClick={handleStartUpload}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
                  disabled={!!editingSongId}
                >
                  {editingSongId ? 'Finish Editing First' : 'Start Upload'}
                </button>
              )}
              
              {isUploading && (
                <div className="px-6 py-2 bg-blue-700 text-blue-300 rounded-full flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent"></div>
                  <span>Uploading {currentUploadIndex + 1} of {songsWithStatus.length}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Editing instructions */}
          {editingSongId && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Editing Mode:</strong> Finish editing the song name before confirming selection or starting upload.
                Press Enter to save, Escape to cancel.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SongUploadStep;