// src/api/artistDashboardApi.js
import axios from "../utills/axiosInstance";

export const artistDashboardApi = {
  // Get artist dashboard profile
  fetchDashboardProfile: async () => {
    const res = await axios.get("/artists/profile/me");
    return res.data.data;
  },

  // Update artist profile
  updateProfile: async (profileData) => {
    // Clean data - remove undefined/null values
    const cleanedData = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined && profileData[key] !== null) {
        cleanedData[key] = profileData[key];
      }
    });
    
    const res = await axios.patch("/artists/me", cleanedData);
    return res.data.data;
  },

  // Update profile image
  updateProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const res = await axios.patch("/artists/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Update cover image
  updateCoverImage: async (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    
    const res = await axios.patch("/artists/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // For batch updates of both text and images
  updateProfileWithImages: async (textData, profileImageFile, coverImageFile) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(textData).forEach(key => {
      if (textData[key] !== undefined && textData[key] !== null) {
        formData.append(key, textData[key]);
      }
    });
    
    // Append profile image if exists
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }
    
    // Append cover image if exists
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }
    
    const res = await axios.patch("/artists/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },
};