//this component related to artist album upload step

import React, { useState, useRef } from "react";
import { FiUpload, FiMusic, FiCheck, FiX, FiTrash2 } from "react-icons/fi";

const SongUploadStep = ({ 
  onSongsSelected, 
  onStartUpload, 
  uploadedSongs, 
  isUploading, 
  hasStartedUpload 
}) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const fileInputRef = useRef(null);
  
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
      
      return {
        id: Date.now() + index,
        file,
        name: file.name.replace(/\.[^/.]+$/, ""),
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        status: "pending",
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
  };
  
  const handleConfirmSelection = () => {
    if (selectedSongs.length === 0) {
      alert("Please select at least one song!");
      return;
    }
    
    // Prepare songs for upload
    const preparedSongs = selectedSongs.map(song => ({
      title: song.name,
      audioFile: song.file,
      duration: song.durationInSeconds || 180,
      name: song.name,
      size: song.size
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
    onStartUpload();
  };
  
  return (
    <div className="space-y-6">
      {/* File upload area */}
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".wav,.aif,.aiff,.flac,.mp3"
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
          Upload multiple audio files to add to your album. You can select WAV, AIFF, FLAC, or MP3 files.
        </p>
        
        <button
          type="button"
          onClick={triggerFileInput}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium inline-flex items-center gap-2"
        >
          <FiMusic size={18} />
          Choose Audio Files
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          Selected: {selectedSongs.length} file{selectedSongs.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Selected songs list */}
      {selectedSongs.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white">Selected Songs</h4>
            <span className="text-gray-400 text-sm">
              {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedSongs.map((song, index) => (
              <div key={song.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                    <FiMusic className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{song.name}</p>
                    <p className="text-gray-400 text-xs">
                      {song.duration || "00:00"} • {song.size}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeSong(song.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleConfirmSelection}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
      
      {/* Upload button (only shows after selection) */}
      {hasStartedUpload && (
        <div className="flex justify-center">
          <button
            onClick={handleStartUpload}
            disabled={isUploading || selectedSongs.length === 0}
            className={`px-8 py-3 rounded-full font-medium text-lg flex items-center gap-3 ${
              isUploading 
                ? 'bg-blue-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500'
            } text-white`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Uploading...
              </>
            ) : (
              <>
                <FiUpload size={20} />
                Start Uploading {selectedSongs.length} Song{selectedSongs.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Already uploaded songs list */}
      {uploadedSongs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white mb-3">Uploaded Songs</h4>
          <div className="space-y-2">
            {uploadedSongs.map((song, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <FiCheck size={16} className="text-white" />
                  </div>
                  <span className="text-white">{song.title || `Track ${index + 1}`}</span>
                </div>
                <span className="text-green-400 text-sm">✓ Uploaded</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongUploadStep;