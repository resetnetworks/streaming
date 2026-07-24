import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import SongUploadStep from "../../components/artist/upload/SongUploadStep";
import UploadProgress from "../../components/artist/upload/UploadProgress";
import { toast } from "sonner";
import { FiCheckCircle } from "react-icons/fi";
import { useCreateAlbum } from "../../hooks/api/useAlbums";
import { useCreateSong } from "../../hooks/api/useSongs";
import { useS3Upload } from "../../hooks/api/useS3Upload";
import { useUploadSong } from "../../hooks/api/useUpload";

const AlbumUpload = ({ onCancel, onComplete, onBatchProgress }) => {
  const createAlbumMutation = useCreateAlbum();
  const createSongMutation = useCreateSong();
  const { uploadSongCover } = useS3Upload();
  const uploadSongMutation = useUploadSong();

  // Two-step flow: 1 = album info form, 2 = add songs
  const [currentStep, setCurrentStep] = useState(1);
  const [createdAlbum, setCreatedAlbum] = useState(null);

  // Song batch state
  const [songsToUpload, setSongsToUpload] = useState([]);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);
  const [allSongsUploaded, setAllSongsUploaded] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // ─── Step 1: Create the album record ────────────────────────────────────────
  const handleAlbumSubmit = async (formData) => {
    try {
      let coverImageKey = "";

      // Upload cover art to S3 first
      if (formData.coverImageFile) {
        coverImageKey = await uploadSongCover({
          file: formData.coverImageFile,
          onProgress: () => {}, // progress UI optional here
        });
      }

      const albumData = {
        title: formData.title,
        releaseDate: formData.date,
        description: formData.description || "",
        copyright: formData.copyright || "",
        genre: formData.genre || [],
        accessType: formData.accessType || "subscription",
        coverImageKey,
      };

      // Attach price only for purchase-only albums
      if (formData.accessType === "purchase-only" && formData.basePrice) {
        albumData.basePrice = {
          amount: parseFloat(formData.basePrice.amount),
          currency: formData.basePrice.currency || "USD",
        };
      }

      const result = await createAlbumMutation.mutateAsync(albumData);

      setCreatedAlbum(result);
      setCurrentStep(2);
      toast.success("Album created! Now add songs.");
    } catch (error) {
      console.error("Album creation failed:", error);
      toast.error(error.message || "Album creation failed");
    } finally {
      toast.dismiss("album");
    }
  };

  // ─── Step 2: Receive selected songs from SongUploadStep ─────────────────────
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

  // ─── Upload songs one by one ─────────────────────────────────────────────────
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

      // Notify parent so the batch progress modal can update
      onBatchProgress?.({
        currentIndex: i,
        totalSongs: songsToUpload.length,
        currentProgress: 0,
        currentSongName: songsToUpload[i].name || `Track ${i + 1}`,
      });

      try {
        const result = await uploadSingleSong(songsToUpload[i], i);
        results.push({
          index: i,
          success: true,
          song: result,
          name: songsToUpload[i].name || songsToUpload[i].title,
        });
        setUploadedSongs((prev) => [...prev, { ...result, originalIndex: i }]);
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message || "Upload failed",
          name: songsToUpload[i].name || songsToUpload[i].title,
        });
        console.error(`Failed to upload song ${i + 1}:`, error);
        toast.error(`Failed to upload "${songsToUpload[i].name}": ${error.message}`);
      }
    }

    setUploadResults(results);
    setIsUploadingBatch(false);

    const successCount = results.filter((r) => r.success).length;
    if (successCount < results.length) {
      toast.info(`Uploaded ${successCount} of ${results.length} songs.`);
    }

    setShowCompletionModal(true);
  };

  // Upload a single song's audio then save its metadata
  const uploadSingleSong = async (songData, index) => {
    // Upload audio to S3
    const uploadResult = await uploadSongMutation.mutateAsync({
      file: songData.audioFile,
      onProgress: (progress) => {
        setUploadProgress(progress);
        onBatchProgress?.({
          currentIndex: index,
          totalSongs: songsToUpload.length,
          currentProgress: progress,
          currentSongName: songData.name || `Track ${index + 1}`,
        });
      },
    });

    // Save song metadata linked to the parent album
    return await createSongMutation.mutateAsync({
      title: songData.title || `Track ${index + 1}`,
      duration: songData.duration || 180,
      accessType: createdAlbum.accessType,
      genres: createdAlbum.genre || [],
      releaseDate: createdAlbum.releaseDate,
      album: createdAlbum._id,
      albumOnly: true,
      audioKey: uploadResult.s3Key,
      coverImageKey: createdAlbum.coverImageKey,
      fileName: songData.audioFile.name,
    });
  };

  // ─── Finish: navigate back to uploads (albums tab) ──────────────────────────
  const handleComplete = () => {
    toast.success("Album created successfully!");
    // "album" tells Dashboard to activate the albums tab in UploadsComponent
    onComplete?.("album");
  };

  // Automatically mark all songs uploaded once counts match
  useEffect(() => {
    if (uploadedSongs.length > 0 && uploadedSongs.length === songsToUpload.length) {
      const timer = setTimeout(() => setAllSongsUploaded(true), 500);
      return () => clearTimeout(timer);
    }
  }, [uploadedSongs.length, songsToUpload.length]);

  return (
    <div className="p-6 relative">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className={`flex items-center ${currentStep >= 1 ? "text-blue-400" : "text-gray-500"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? "border-blue-400 bg-blue-400/10" : "border-gray-600"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm">Album Info</span>
          </div>

          <div className={`h-1 w-16 mx-4 ${currentStep >= 2 ? "bg-blue-400" : "bg-gray-700"}`} />

          <div className={`flex items-center ${currentStep >= 2 ? "text-blue-400" : "text-gray-500"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? "border-blue-400 bg-blue-400/10" : "border-gray-600"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm">Upload Songs</span>
          </div>
        </div>
      </div>

      {/* Album mutation error banner */}
      {createAlbumMutation.isError && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Album Error: {createAlbumMutation.error?.response?.data?.message}
        </div>
      )}

      {/* ── Step 1: Album creation form ── */}
      {currentStep === 1 && (
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
            accessType: "subscription",
          }}
        />
      )}

      {/* ── Step 2: Add songs to the created album ── */}
      {currentStep === 2 && createdAlbum && (
        <div>
          {/* Completion modal shown after all songs finish uploading */}
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
                      Your album{" "}
                      <span className="text-blue-300 font-medium">"{createdAlbum.title}"</span>{" "}
                      has been created with{" "}
                      <span className="text-green-400">{uploadedSongs.length}</span>{" "}
                      song{uploadedSongs.length !== 1 ? "s" : ""}.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-400">{uploadedSongs.length}</div>
                        <div className="text-xs text-gray-400">Songs Uploaded</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-400">
                          {uploadResults.filter((r) => !r.success).length}
                        </div>
                        <div className="text-xs text-gray-400">Failed</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleComplete}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    Go to Uploads
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Album header / back button */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-white mb-2">Add Songs to Album</h2>
                <p className="text-gray-400">
                  Now add songs to{" "}
                  <span className="text-blue-300">"{createdAlbum.title}"</span>
                </p>
              </div>

            </div>

            {/* Quick album summary card */}
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
                    <span className="text-gray-500 text-xs">No Cover</span>
                  </div>
                )}
                <div>
                  <h3 className="text-white font-medium">{createdAlbum.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {Array.isArray(createdAlbum.genre) ? createdAlbum.genre.join(", ") : (createdAlbum.genre || "No genre")} • {createdAlbum.accessType}
                    {createdAlbum.accessType === "purchase-only" &&
                      createdAlbum.basePrice &&
                      ` • $${createdAlbum.basePrice.amount}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-2 flex items-center">
                    <span className="bg-blue-500/10 text-[#4DB3FF] border border-[#4DB3FF]/20 px-2 py-0.5 rounded font-medium text-[10px] uppercase tracking-wider">
                      {uploadedSongs.length} track{uploadedSongs.length !== 1 ? "s" : ""} uploaded
                      {songsToUpload.length > 0 && ` of ${songsToUpload.length}`}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inline batch upload progress bar */}
          {isUploadingBatch && (
            <div className="mb-6">
              <UploadProgress
                currentIndex={currentUploadIndex}
                totalSongs={songsToUpload.length}
                currentProgress={uploadProgress}
                currentSongName={
                  songsToUpload[currentUploadIndex]?.name || `Track ${currentUploadIndex + 1}`
                }
              />
            </div>
          )}

          {/* Song selection + upload trigger */}
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

          {/* Upload results summary (only when modal is dismissed) */}
          {uploadResults.length > 0 && !showCompletionModal && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="text-white mb-3">Upload Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <div className="text-2xl font-bold text-green-400">
                    {uploadResults.filter((r) => r.success).length}
                  </div>
                  <div className="text-sm text-gray-400">Successful</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-gray-400">{uploadResults.length}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
                <div className="bg-red-900/20 p-3 rounded-lg border border-red-700/30">
                  <div className="text-2xl font-bold text-red-400">
                    {uploadResults.filter((r) => !r.success).length}
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