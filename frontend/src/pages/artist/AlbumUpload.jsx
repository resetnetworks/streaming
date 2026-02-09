import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import SongUploadStep from "../../components/artist/upload/SongUploadStep";
import UploadProgress from "../../components/artist/upload/UploadProgress";
import { toast } from "sonner";
import { FiCheckCircle } from "react-icons/fi";
import { useCreateAlbum } from "../../hooks/api/useAlbums";
import { useCreateSong } from "../../hooks/api/useSongs";
import { useS3Upload } from "../../hooks/api/useS3Upload";

const AlbumUpload = ({ onCancel, onComplete }) => {
  // React Query hooks
  const createAlbumMutation = useCreateAlbum();
  const createSongMutation = useCreateSong();
  const { uploadSongCover, uploadSongAudio } = useS3Upload();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [createdAlbum, setCreatedAlbum] = useState(null);
  
  // Songs management
  const [songsToUpload, setSongsToUpload] = useState([]);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);
  const [allSongsUploaded, setAllSongsUploaded] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Step 1: Handle album creation
  const handleAlbumSubmit = async (formData) => {
    try {
      const albumData = {
        title: formData.title,
        releaseDate: formData.date,
        description: formData.description || "",
        genre: formData.genres?.join(",") || "",
        accessType: formData.accessType || "subscription",
      };
      
      if (formData.accessType === "purchase-only" && formData.basePrice) {
        albumData.basePrice = {
          amount: parseFloat(formData.basePrice.amount),
          currency: formData.basePrice.currency || "USD"
        };
      }
      
      const result = await createAlbumMutation.mutateAsync({
        ...albumData,
        coverImageKey: formData.coverImageKey
      });
      
      setCreatedAlbum(result);
      setCurrentStep(2);
      toast.success("Album created successfully! Now add songs.");
    } catch (error) {
      console.error("Album creation failed:", error);
      toast.error(`Album creation failed: ${error.message || "Unknown error"}`);
    }
  };
  
  // Step 2: Handle song selection for album
  const handleSongsSelected = (songs) => {
    if (!songs || songs.length === 0) {
      toast.error("Please select at least one song!");
      return;
    }
    
    setSongsToUpload(songs);
    setCurrentUploadIndex(0);
    setUploadedSongs([]);
    setUploadResults([]);
    setAllSongsUploaded(false);
  };
  
  // Upload songs one by one using React Query
  const uploadSongsSequentially = async () => {
    if (!songsToUpload.length || !createdAlbum) {
      toast.error("No songs to upload or album not created!");
      return;
    }
    
    setIsUploadingBatch(true);
    setAllSongsUploaded(false);
    const results = [];
    
    for (let i = 0; i < songsToUpload.length; i++) {
      setCurrentUploadIndex(i);
      setUploadProgress(0);
      
      try {
        const result = await uploadSingleSong(songsToUpload[i], i);
        results.push({
          index: i,
          success: true,
          song: result,
          name: songsToUpload[i].name || songsToUpload[i].title
        });
        
        setUploadedSongs(prev => [...prev, {
          ...result,
          originalIndex: i
        }]);
        
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message || "Upload failed",
          name: songsToUpload[i].name || songsToUpload[i].title
        });
        console.error(`Failed to upload song ${i + 1}:`, error);
        toast.error(`Failed to upload "${songsToUpload[i].name}": ${error.message}`);
      }
    }
    
    setUploadResults(results);
    setIsUploadingBatch(false);
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      setAllSongsUploaded(true);
      setShowCompletionModal(true);
      toast.success(`All ${totalCount} songs uploaded successfully!`);
    } else {
      setShowCompletionModal(true);
      toast.info(`Uploaded ${successCount} out of ${totalCount} songs.`);
    }
  };
  
  const uploadSingleSong = async (songData, index) => {
    // Upload audio file to S3 first
    const audioKey = await uploadSongAudio({
      file: songData.audioFile,
      onProgress: (progress) => {
        setUploadProgress(progress);
      }
    });
    
    // Prepare song metadata
    const songMetadata = {
      title: songData.title || `Track ${index + 1}`,
      duration: songData.duration || 180,
      accessType: createdAlbum.accessType,
      genre: createdAlbum.genre || songData.genres?.join(",") || "",
      releaseDate: createdAlbum.releaseDate,
      album: createdAlbum._id,
      albumOnly: true,
      audioKey: audioKey,
      coverImageKey: createdAlbum.coverImageKey,
      fileName: songData.audioFile.name,
      genres: createdAlbum.genre?.split(",") || []
    };
    
    // Save song metadata to database
    return await createSongMutation.mutateAsync(songMetadata);
  };
  
  // Handle complete/finish
  const handleComplete = () => {
    toast.success("Album created successfully!");
    onComplete?.();
  };
  
  // Reset state when unmounting
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  // Check if all songs are uploaded
  useEffect(() => {
    if (uploadedSongs.length > 0 && uploadedSongs.length === songsToUpload.length) {
      setTimeout(() => {
        setAllSongsUploaded(true);
      }, 500);
    }
  }, [uploadedSongs, songsToUpload.length]);

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
      {createAlbumMutation.isError && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Album Error: {createAlbumMutation.error?.message}
        </div>
      )}
      
      {/* Step 1: Album Creation Form */}
      {currentStep === 1 && (
        <div>
          <UploadForm 
            type="album"
            onCancel={onCancel}
            onSubmit={handleAlbumSubmit}
            isSubmitting={createAlbumMutation.isLoading}
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
          {/* Completion Modal */}
          {showCompletionModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full overflow-hidden">
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <FiCheckCircle size={36} className="text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-white text-xl font-bold mb-3">Album Creation Complete!</h3>
                  
                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                      Your album "<span className="text-blue-300 font-medium">{createdAlbum.title}</span>" has been created successfully with <span className="text-green-400">{uploadedSongs.length}</span> song{uploadedSongs.length !== 1 ? 's' : ''}.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-400">{uploadedSongs.length}</div>
                        <div className="text-xs text-gray-400">Songs Uploaded</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-400">
                          {uploadResults.filter(r => !r.success).length}
                        </div>
                        <div className="text-xs text-gray-400">Failed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleComplete}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      Go to Uploads
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-white mb-2">Add Songs to Album</h2>
                <p className="text-gray-400">
                  Now add songs to "<span className="text-blue-300">{createdAlbum.title}</span>"
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-400 hover:text-white px-4 py-2"
              >
                ← Back to Album Info
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
                    {songsToUpload.length > 0 && ` of ${songsToUpload.length}`}
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
          <SongUploadStep
            onSongsSelected={handleSongsSelected}
            onStartUpload={uploadSongsSequentially}
            uploadedSongs={uploadedSongs}
            isUploading={createSongMutation.isLoading || isUploadingBatch}
            hasStartedUpload={songsToUpload.length > 0}
            currentUploadIndex={currentUploadIndex}
            uploadProgress={uploadProgress}
            onCompleteAlbumCreation={handleComplete}
          />
          
          {/* Upload Results Summary */}
          {uploadResults.length > 0 && !showCompletionModal && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="text-white mb-3">Upload Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <div className="text-2xl font-bold text-green-400">
                    {uploadResults.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-gray-400">Successful</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-gray-400">
                    {uploadResults.length}
                  </div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
                <div className="bg-red-900/20 p-3 rounded-lg border border-red-700/30">
                  <div className="text-2xl font-bold text-red-400">
                    {uploadResults.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumUpload;