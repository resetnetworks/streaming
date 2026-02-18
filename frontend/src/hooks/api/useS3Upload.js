// src/hooks/api/useS3Upload.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from '../../utills/axiosInstance';

export const useS3Upload = () => {
  const queryClient = useQueryClient();

  /* ===============================
     1️⃣ EXISTING: Artist image upload
     =============================== */
  const uploadArtistImageMutation = useMutation({
    mutationFn: async ({ file, type = 'profile' }) => {
      const presignEndpoint =
        type === 'cover'
          ? '/uploads/cover/presign'
          : '/uploads/artist/presign';

      const { data: presignData } = await axios.post(presignEndpoint, {
        fileName: file.name,
        mimeType: file.type,
      });

      const { uploadUrl, key } = presignData;

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!s3Response.ok) {
        throw new Error('S3 upload failed');
      }

      const updateField =
        type === 'profile' ? 'profileImageKey' : 'coverImageKey';

      const { data: artistData } = await axios.patch('/artists/me', {
        [updateField]: key,
      });

      return artistData.data;
    },
    onSuccess: (updatedArtist) => {
      queryClient.setQueryData(['artist-dashboard', 'profile'], updatedArtist);
      toast.success('Image updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Image upload failed');
    },
  });

  /* ===============================
     2️⃣ NEW: Song cover upload
     =============================== */
  const uploadSongCoverMutation = useMutation({
    mutationFn: async ({ file }) => {
      // 1. presign
      const { data: presignData } = await axios.post(
        '/uploads/cover/presign',
        {
          fileName: file.name,
          mimeType: file.type,
        }
      );

      const { uploadUrl, key } = presignData;

      // 2. upload to S3
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!s3Response.ok) {
        throw new Error('S3 upload failed');
      }

      // ✅ IMPORTANT: ONLY RETURN KEY
      return key;
    },
  });

  return {
    /* existing – DO NOT TOUCH */
    uploadArtistImage: uploadArtistImageMutation.mutate,
    isArtistImageUploading: uploadArtistImageMutation.isLoading,

    /* new – song cover */
    uploadSongCover: uploadSongCoverMutation.mutateAsync,
    isSongCoverUploading: uploadSongCoverMutation.isLoading,
  };
};
