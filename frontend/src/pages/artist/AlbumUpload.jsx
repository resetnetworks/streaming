import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import { useDispatch, useSelector } from "react-redux";
import { 
  createAlbum, 
  resetCreateState,
  prepareAlbumFormData 
} from "../../features/artistAlbums/artistAlbumsSlice";
import { 
  createSong, 
  resetUploadState,
  prepareSongFormData,
  setUploadProgress 
} from "../../features/artistSong/artistSongSlice";
import SongUploadStep from "../../components/artist/upload/SongUploadStep";
import UploadProgress from "../../components/artist/upload/UploadProgress";

const AlbumUpload = ({ onCancel }) => {
  const dispatch = useDispatch();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: Album info, 2: Upload songs
  const [createdAlbum, setCreatedAlbum] = useState(null);
  
  // Album upload state from Redux
  const {
    createLoading: albumLoading,
    createError: albumError,
    createdAlbum: albumFromRedux
  } = useSelector(state => state.artistAlbums);
  
  // Song upload state from Redux
  const {
    uploadLoading: songLoading,
    uploadProgress,
    uploadError: songError,
    uploadedSong: latestSong
  } = useSelector(state => state.artistSongs);
  
  // Songs management
  const [songsToUpload, setSongsToUpload] = useState([]);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  
  // Step 1: Handle album creation
  const handleAlbumSubmit = async (formData) => {
    console.log("Creating album with data:", formData);
    
    const albumData = {
      title: formData.title,
      releaseDate: formData.date,
      description: formData.description || "",
      genre: formData.genres?.join(",") || "",
      accessType: formData.accessType || "subscription",
    };
    
    // Add price if purchase-only album
    if (formData.accessType === "purchase-only" && formData.basePrice) {
      albumData.basePrice = {
        amount: parseFloat(formData.basePrice.amount),
        currency: "USD"
      };
    }
    
    const uploadFormData = prepareAlbumFormData(
      albumData,
      formData.coverImage
    );
    
    try {
      const result = await dispatch(createAlbum(uploadFormData)).unwrap();
      setCreatedAlbum(result);
      setCurrentStep(2); // Move to song upload step
    } catch (error) {
      console.error("Album creation failed:", error);
      alert(`Album creation failed: ${error}`);
    }
  };
  
  // Step 2: Handle song selection for album
  const handleSongsSelected = (songs) => {
    if (!songs || songs.length === 0) {
      alert("Please select at least one song!");
      return;
    }
    
    setSongsToUpload(songs);
    setCurrentUploadIndex(0);
    setUploadedSongs([]);
    setUploadResults([]);
  };
  
  // Upload songs one by one
  const uploadSongsSequentially = async () => {
    if (!songsToUpload.length || !createdAlbum) {
      alert("No songs to upload or album not created!");
      return;
    }
    
    setIsUploadingBatch(true);
    const results = [];
    
    for (let i = 0; i < songsToUpload.length; i++) {
      setCurrentUploadIndex(i);
      const song = songsToUpload[i];
      
      try {
        const result = await uploadSingleSong(song, i);
        results.push({
          index: i,
          success: true,
          song: result,
          name: song.name || song.title
        });
        
        // Update uploaded songs list
        setUploadedSongs(prev => [...prev, {
          ...result,
          originalIndex: i
        }]);
        
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message || "Upload failed",
          name: song.name || song.title
        });
        console.error(`Failed to upload song ${i + 1}:`, error);
      }
      
      // Reset progress for next song
      dispatch(setUploadProgress(0));
    }
    
    setUploadResults(results);
    setIsUploadingBatch(false);
    
    // Show summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      alert(`🎉 All ${totalCount} songs uploaded successfully!`);
    } else {
      alert(`Uploaded ${successCount} out of ${totalCount} songs. Check console for details.`);
    }
  };
  
  const uploadSingleSong = async (songData, index) => {
    return new Promise(async (resolve, reject) => {
      try {
        const songFormData = {
          title: songData.title || `Track ${index + 1}`,
          duration: songData.duration || 180,
          accessType: createdAlbum.accessType, // Match album's access type
          genre: createdAlbum.genre || songData.genres?.join(",") || "",
          releaseDate: createdAlbum.releaseDate,
          album: createdAlbum._id,
          albumOnly: true, // Mark as album-only song
        };
        
        // If album is purchase-only, don't set price for individual songs
        // (album-only songs inherit album's pricing)
        
        const uploadFormData = prepareSongFormData(
          songFormData,
          songData.audioFile,
          null // Don't upload cover image for album songs (use album's cover)
        );
        
        const result = await dispatch(createSong(uploadFormData)).unwrap();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Handle cancel/back
  const handleBack = () => {
    if (currentStep === 2 && !isUploadingBatch) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      onCancel?.();
    }
  };
  
  // Handle complete/finish
  const handleComplete = () => {
    alert("Album created successfully! You can now view it in your albums.");
    dispatch(resetCreateState());
    dispatch(resetUploadState());
    onCancel?.();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCreateState());
      dispatch(resetUploadState());
    };
  }, [dispatch]);
  
  // Auto move to step 2 when album is created
  useEffect(() => {
    if (albumFromRedux && currentStep === 1) {
      setCreatedAlbum(albumFromRedux);
      setCurrentStep(2);
    }
  }, [albumFromRedux, currentStep]);
  
  return (
    <div className="p-6 relative">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600'}`}>
              1
            </div>
            <span className="ml-2 text-sm">Album Info</span>
          </div>
          
          <div className={`h-1 w-16 mx-4 ${currentStep >= 2 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
          
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600'}`}>
              2
            </div>
            <span className="ml-2 text-sm">Upload Songs</span>
          </div>
        </div>
      </div>
      
      {/* Error display */}
      {albumError && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Album Error: {albumError}
        </div>
      )}
      
      {songError && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Song Error: {songError}
        </div>
      )}
      
      {/* Step 1: Album Creation Form */}
      {currentStep === 1 && (
        <div>
          
          <UploadForm 
            type="album"
            onCancel={onCancel}
            onSubmit={handleAlbumSubmit}
            isSubmitting={albumLoading}
            initialData={{
              title: "",
              date: new Date().toISOString().split("T")[0],
              genres: [],
              tracks: [],
              accessType: "subscription"
            }}
          />
        </div>
      )}
      
      {/* Step 2: Song Upload */}
      {currentStep === 2 && createdAlbum && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-white mb-2">Add Songs to Album</h2>
                <p className="text-gray-400">
                  Now add songs to "<span className="text-blue-300">{createdAlbum.title}</span>"
                </p>
              </div>
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white px-4 py-2"
              >
                ← Back
              </button>
            </div>
            
            {/* Album preview */}
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-4">
                {createdAlbum.coverImage ? (
                  <img 
                    src={createdAlbum.coverImage} 
                    alt={createdAlbum.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-gray-500">No Cover</span>
                  </div>
                )}
                <div>
                  <h3 className="text-white font-medium">{createdAlbum.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {createdAlbum.genre || "No genre"} • {createdAlbum.accessType}
                    {createdAlbum.accessType === "purchase-only" && createdAlbum.basePrice && 
                      ` • $${createdAlbum.basePrice.amount}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {uploadedSongs.length} song{uploadedSongs.length !== 1 ? 's' : ''} uploaded
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upload Progress (when batch uploading) */}
          {isUploadingBatch && (
            <div className="mb-6">
              <UploadProgress 
                currentIndex={currentUploadIndex}
                totalSongs={songsToUpload.length}
                currentProgress={uploadProgress}
                currentSongName={songsToUpload[currentUploadIndex]?.name || `Track ${currentUploadIndex + 1}`}
              />
            </div>
          )}
          
          {/* Song Upload Step Component */}
          {!isUploadingBatch && (
            <SongUploadStep
              onSongsSelected={handleSongsSelected}
              onStartUpload={uploadSongsSequentially}
              uploadedSongs={uploadedSongs}
              isUploading={songLoading || isUploadingBatch}
              hasStartedUpload={songsToUpload.length > 0}
            />
          )}
          
          {/* Upload Results Summary */}
          {uploadResults.length > 0 && !isUploadingBatch && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="text-white mb-3">Upload Summary</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2 rounded ${result.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${result.success ? 'bg-green-500' : 'bg-red-500'}`}>
                        {result.success ? '✓' : '✗'}
                      </div>
                      <span className="text-white text-sm">
                        {result.name || `Track ${result.index + 1}`}
                      </span>
                    </div>
                    <span className={`text-xs ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Success' : result.error}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
                >
                  Complete Album Creation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumUpload;