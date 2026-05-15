import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import { toast } from "sonner";
import { useUploadSong } from "../../hooks/api/useUpload";
import { useS3Upload } from "../../hooks/api/useS3Upload";
import { useCreateSong } from "../../hooks/api/useSongs";

const SingleUpload = ({ onCancel, onComplete }) => {
  const uploadSongMutation = useUploadSong();
  const { uploadSongCover } = useS3Upload();
  const createSongMutation = useCreateSong();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [coverImageUploadProgress, setCoverImageUploadProgress] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let coverImageKey = "";
      let audioKey = "";

      // Step 1: Upload cover image to S3
      if (formData.coverImageFile) {
        setIsUploadingCover(true);
        setCoverImageUploadProgress(0);

        try {
          coverImageKey = await uploadSongCover({
            file: formData.coverImageFile,
            onProgress: (progress) => setCoverImageUploadProgress(progress),
          });
        } catch (error) {
          throw new Error(`Cover image upload failed: ${error.message}`);
        } finally {
          setIsUploadingCover(false);
        }
      }

      // Step 2: Upload audio file to S3
      if (formData.type === "song" && formData.tracks.length > 0) {
        setIsUploadingAudio(true);
        setAudioUploadProgress(0);

        try {
          const uploadResult = await uploadSongMutation.mutateAsync({
            file: formData.tracks[0].file,
            onProgress: (progress) => setAudioUploadProgress(progress),
          });
          audioKey = uploadResult.s3Key;
        } catch (error) {
          throw new Error(`Audio upload failed: ${error.message}`);
        } finally {
          setIsUploadingAudio(false);
        }
      }

      toast.dismiss("upload-start");

      // Step 3: Build the song payload for the database
      const songData = {
        title: formData.title,
        duration: formData.tracks[0].durationInSeconds || 180,
        copyright: formData.copyright,
        accessType: formData.accessType,
        genre: formData.genre,
        releaseDate: formData.date,
        albumOnly: false,
        description: formData.description || "",
        coverImageKey,
        audioKey,
        type: "original",
        fileName: formData.tracks[0].name || formData.title,
        ...(formData.isrc && { isrc: formData.isrc }),
      };

      // Include price only for purchase-only tracks
      if (formData.accessType === "purchase-only" && formData.basePrice) {
        const priceAmount = parseFloat(formData.basePrice.amount);
        if (!isNaN(priceAmount) && priceAmount > 0) {
          songData.basePrice = formData.basePrice;
        }
      }

      // Step 4: Save song metadata to the database
      await createSongMutation.mutateAsync(songData);
      toast.dismiss("save-metadata");

      toast.success("Track uploaded successfully!");

      // Wait briefly so the user sees the success toast, then navigate away.
      // onComplete("single") tells Dashboard to open the "songs" tab in Uploads.
      setTimeout(() => {
        onComplete("single");
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);

      if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(error.message || "Upload failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Surface any background mutation errors to the user
  useEffect(() => {
    if (createSongMutation.isError) {
      toast.error(`Failed to save song: ${createSongMutation.error?.message}`);
    }
  }, [createSongMutation.isError, createSongMutation.error]);

  return (
    <div className="p-6 relative">
      {/* Floating upload progress indicator */}
      {(isUploadingAudio || isUploadingCover) && (
        <div className="absolute top-4 right-4 bg-blue-900/50 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent" />
          <span className="text-sm">
            {isUploadingAudio
              ? `Uploading audio... ${audioUploadProgress}%`
              : `Uploading cover... ${coverImageUploadProgress}%`}
          </span>
        </div>
      )}

      {/* Inline error banner for mutation failures */}
      {createSongMutation.isError && (
        <div className="absolute top-4 right-4 bg-red-900/50 backdrop-blur-sm text-red-300 px-4 py-2 rounded-lg z-50">
          <span className="text-sm">Error: {createSongMutation.error?.message}</span>
        </div>
      )}

      <UploadForm
        type="song"
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        audioUploadProgress={audioUploadProgress}
        coverImageUploadProgress={coverImageUploadProgress}
        isUploadingAudio={isUploadingAudio}
        isUploadingCover={isUploadingCover}
        initialData={{
          title: "",
          date: new Date().toISOString().split("T")[0],
          genres: [],
          tracks: [],
          accessType: "subscription",
        }}
      />
    </div>
  );
};

export default SingleUpload;