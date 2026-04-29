import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import { toast } from "sonner";
import { useUploadSong } from "../../hooks/api/useUpload";
import { useS3Upload } from "../../hooks/api/useS3Upload";
import { useCreateSong } from "../../hooks/api/useSongs";

const MixUpload = ({ onCancel }) => {
  // React Query hooks
  const uploadSongMutation = useUploadSong();
  const { uploadSongCover } = useS3Upload();
  const createSongMutation = useCreateSong();

  // Upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [coverImageUploadProgress, setCoverImageUploadProgress] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      toast.loading("Starting mix upload...", { id: "upload-start" });

      let coverImageKey = "";
      let audioKey = "";

      // Step 1: Upload cover image
      if (formData.coverImageFile) {
        setIsUploadingCover(true);
        setCoverImageUploadProgress(0);
        try {
          coverImageKey = await uploadSongCover({
            file: formData.coverImageFile,
            onProgress: (progress) => setCoverImageUploadProgress(progress),
          });
        } catch (error) {
          console.error("Cover upload failed:", error);
          throw new Error(`Cover upload failed: ${error.message}`);
        } finally {
          setIsUploadingCover(false);
        }
      }

      // Step 2: Upload mix audio (same as song upload)
      if (formData.type === "mix" && formData.tracks.length > 0) {
        setIsUploadingAudio(true);
        setAudioUploadProgress(0);
        try {
          const uploadResult = await uploadSongMutation.mutateAsync({
            file: formData.tracks[0].file,
            onProgress: (progress) => setAudioUploadProgress(progress),
          });
          audioKey = uploadResult.s3Key;
        } catch (error) {
          console.error("Mix audio upload failed:", error);
          throw new Error(`Mix upload failed: ${error.message}`);
        } finally {
          setIsUploadingAudio(false);
        }
      }

      toast.dismiss("upload-start");

      // Step 3: Prepare mix data for database
      const mixData = {
        title: formData.title,
        duration: formData.tracks[0]?.durationInSeconds || 180,
        accessType: formData.accessType,
        copyright: formData.copyright,
        genre: formData.genre,
        releaseDate: formData.date,
        albumOnly: false,
        description: formData.description || "",
        coverImageKey: coverImageKey,
        audioKey: audioKey,
        fileName: formData.tracks[0]?.name || formData.title,
        type: "dj-mix",               // explicitly set type as 'mix'
        ...(formData.isrc && { isrc: formData.isrc }),
      };

      // Add price if purchase-only
      if (formData.accessType === "purchase-only" && formData.basePrice) {
        const priceAmount = parseFloat(formData.basePrice.amount);
        if (!isNaN(priceAmount) && priceAmount > 0) {
          mixData.basePrice = formData.basePrice;
        }
      }

      // Step 4: Save mix to database
      toast.loading("Saving mix metadata...", { id: "save-metadata" });
      const createdMix = await createSongMutation.mutateAsync(mixData);
      toast.dismiss("save-metadata");
      toast.success("Mix uploaded successfully!");

      if (onCancel) {
        setTimeout(() => onCancel(), 1500);
      }
    } catch (error) {
      console.error("Mix upload failed:", error);
      if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        toast.error(error.message || "Upload failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error if mutation fails
  useEffect(() => {
    if (createSongMutation.isError) {
      toast.error(`Failed to save mix: ${createSongMutation.error?.message}`);
    }
  }, [createSongMutation.isError, createSongMutation.error]);

  return (
    <div className="p-6 relative">
      {/* Upload progress indicators */}
      {(isUploadingAudio || isUploadingCover) && (
        <div className="absolute top-4 right-4 bg-blue-900/50 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent"></div>
          <span className="text-sm">
            {isUploadingAudio
              ? `Uploading mix... ${audioUploadProgress}%`
              : isUploadingCover
              ? `Uploading cover... ${coverImageUploadProgress}%`
              : "Uploading..."}
          </span>
        </div>
      )}

      {createSongMutation.isError && (
        <div className="absolute top-4 right-4 bg-red-900/50 backdrop-blur-sm text-red-300 px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <span className="text-sm">Error: {createSongMutation.error?.message}</span>
        </div>
      )}

      <UploadForm
        type="mix"                     // important: tells form it's a mix
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

export default MixUpload;