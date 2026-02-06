// src/hooks/useUpload.js
import { useMutation } from "@tanstack/react-query";
import { uploadApi } from "../../api/uploadApi";
import { toast } from "sonner";

export const useUploadSong = () => {
  return useMutation({
    mutationFn: async ({ file, onProgress }) => {
      if (!file) {
        throw new Error("No file selected");
      }

      // Step 1: Get presigned URL from your backend
      const { uploadUrl, key } = await uploadApi.getPresignedUrl(
        file.name,
        file.type
      );

      // Step 2: Upload to S3 with progress tracking
      await uploadApi.uploadToS3(uploadUrl, file, onProgress);

      // Step 3: Return the S3 key for saving to database
      return {
        s3Key: key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
    },
    onSuccess: (data) => {
      return data; // Return S3 key for further use
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload song");
      throw error;
    }
  });
};

// Hook for saving song metadata to database
export const useSaveSongMetadata = () => {
  return useMutation({
    mutationFn: uploadApi.saveSongToDb,
    onSuccess: (song) => {
      return song;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save song metadata");
      throw error;
    }
  });
};

// Combined hook for complete upload flow
export const useCompleteSongUpload = () => {
  const uploadMutation = useUploadSong();
  const saveMutation = useSaveSongMetadata();

  const uploadAndSave = async ({ 
    file, 
    songData, 
    onProgress,
    onUploadComplete 
  }) => {
    try {
      // Step 1: Upload to S3
      const uploadResult = await uploadMutation.mutateAsync({ 
        file, 
        onProgress 
      });

      // Step 2: Prepare complete song data
      const completeSongData = {
        ...songData,
        audioUrl: uploadResult.s3Key,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize
      };

      // Step 3: Save to database
      const savedSong = await saveMutation.mutateAsync(completeSongData);
      
      if (onUploadComplete) {
        onUploadComplete(savedSong);
      }

      return savedSong;

    } catch (error) {
      throw error;
    }
  };

  return {
    uploadAndSave,
    isUploading: uploadMutation.isLoading || saveMutation.isLoading,
    uploadProgress: uploadMutation.data?.progress || 0,
    error: uploadMutation.error || saveMutation.error,
    reset: () => {
      uploadMutation.reset();
      saveMutation.reset();
    }
  };
};