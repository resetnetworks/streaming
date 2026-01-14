// src/api/uploadApi.js
import axios from "../utills/axiosInstance";

export const uploadApi = {
  // Get presigned URL for song upload
  getPresignedUrl: async (fileName, mimeType) => {
    const res = await axios.post("/uploads/song/presign", {
      fileName,
      mimeType
    });
    return res.data; // { uploadUrl, key }
  },

  // Upload file directly to S3 using presigned URL
  uploadToS3: async (presignedUrl, file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          onProgress(percentage);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            status: xhr.status,
            headers: xhr.getAllResponseHeaders()
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      
      // Important: Don't set any other headers for presigned URLs
      xhr.send(file);
    });
  },

  // Save uploaded song info to your database
  saveSongToDb: async (songData) => {
    const res = await axios.post("/songs", songData);
    return res.data.song;
  }
};