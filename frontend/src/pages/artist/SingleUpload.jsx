import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import { toast } from "sonner";
import {
  useUploadSong,
  useCompleteSongUpload,
} from "../../hooks/api/useUpload";
import { useS3Upload } from "../../hooks/api/useS3Upload";
import { useCreateSong } from "../../hooks/api/useSongs";

const SingleUpload = ({ onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // React Query Hooks
  const uploadSongMutation = useUploadSong();
  const completeSongUploadMutation = useCompleteSongUpload();
  const { uploadSongCover } = useS3Upload();
  const createSongMutation = useCreateSong();

  const handleSubmit = async (formData) => {
    if (isSubmitting || isUploading) {
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploading(true);
      setUploadProgress(0);
      
      toast.loading("Starting upload process...", { id: "upload" });

      // Step 1: Upload cover image using useS3Upload
      toast.loading("Uploading cover image...", { id: "cover" });
      const coverImageKey = await uploadSongCover({
        file: formData.coverImageFile,
        onProgress: (progress) => {
          setUploadProgress(Math.min(progress, 50));
        }
      });

      toast.dismiss("cover");
      setUploadProgress(50);
      
      // Step 2: Upload audio track using useUploadSong
      toast.loading("Uploading audio track...", { id: "audio" });
      
      // First, initiate the upload to get S3 key
      const audioFile = formData.tracks[0].file;
      const uploadResult = await uploadSongMutation.mutateAsync({
        file: audioFile,
        onProgress: (progress) => {
          setUploadProgress(50 + (progress / 2));
        }
      });

      // If needed, complete the upload (depends on your API design)
      const audioKey = uploadResult.s3Key || uploadResult.key;

      toast.dismiss("audio");
      setUploadProgress(100);
      
      // Convert duration to seconds
      const convertDurationToSeconds = (durationString) => {
        if (durationString === "Loading..." || !durationString) {
          return 180;
        }
        
        try {
          const parts = durationString.split(":");
          if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            return (minutes * 60) + seconds;
          }
          return 180;
        } catch (error) {
          console.error("Error converting duration:", error);
          return 180;
        }
      };

      // Step 3: Prepare song metadata
      const songData = {
        title: formData.title,
        releaseDate: formData.date,
        description: formData.description,
        ...(formData.isrc && { isrc: formData.isrc }),
        genres: formData.genres,
        coverImageKey: coverImageKey, // S3 key from useS3Upload
        accessType: formData.accessType,
        albumOnly: false,
        audioKey: audioKey, // S3 key from useUploadSong
        duration: convertDurationToSeconds(formData.tracks[0].duration),
        fileName: formData.tracks[0].name,
        // Only include basePrice if purchase-only
        ...(formData.accessType === "purchase-only" && formData.basePrice && {
          basePrice: {
            amount: parseFloat(formData.basePrice.amount),
            currency: "USD",
          },
        }),
      };

      // Step 4: Save song metadata to database
      toast.loading("Saving song metadata...", { id: "save" });
      const createdSong = await createSongMutation.mutateAsync(songData);

      // If your API requires completion step
      if (completeSongUploadMutation && uploadResult.uploadId) {
        await completeSongUploadMutation.mutateAsync({
          uploadId: uploadResult.uploadId,
          songId: createdSong._id
        });
      }

      toast.dismiss("save");
      toast.dismiss("upload");
      
      // Show success message
      toast.success("Song uploaded successfully!", {
        duration: 3000,
      });

      // Close modal after delay
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 1500);

    } catch (error) {
      console.error("Upload failed:", error);
      
      toast.dismiss("upload");
      toast.dismiss("cover");
      toast.dismiss("audio");
      toast.dismiss("save");
      
      if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(error.message || "Upload failed. Please try again.");
      }
      
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 relative">
      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="absolute top-4 right-4 bg-blue-900/50 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-blue-300/30"></div>
            <div 
              className="absolute inset-0 rounded-full border-2 border-blue-300 border-t-transparent animate-spin"
              style={{
                transform: `rotate(${uploadProgress * 3.6}deg)`
              }}
            ></div>
          </div>
          <span className="text-sm">Uploading... {Math.round(uploadProgress)}%</span>
        </div>
      )}

      <UploadForm 
        type="song"
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        initialData={{
          title: "",
          date: new Date().toISOString().split("T")[0],
          genres: [],
          tracks: [],
          accessType: "subscription"
        }}
      />
    </div>
  );
};

export default SingleUpload;