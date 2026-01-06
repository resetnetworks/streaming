
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunk for creating/uploading song
export const createSong = createAsyncThunk(
  "songs/create",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/songs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Dispatch progress update
          thunkAPI.dispatch(setUploadProgress(progress));
        },
      });
      return res.data.song;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to upload song"
      );
    }
  }
);

// Helper function to create form data
export const prepareSongFormData = (songData, audioFile, coverImageFile) => {
  const formData = new FormData();
  
  // Append basic fields
  formData.append("title", songData.title);
  formData.append("duration", songData.duration);
  formData.append("accessType", songData.accessType);
  
  // Append optional fields
  if (songData.genre) formData.append("genre", songData.genre);
  if (songData.album) formData.append("album", songData.album);
  if (songData.albumOnly) formData.append("albumOnly", songData.albumOnly);
  if (songData.releaseDate) formData.append("releaseDate", songData.releaseDate);
  
  // Append price if purchase-only
  if (songData.accessType === "purchase-only" && songData.basePrice) {
    formData.append("basePrice", JSON.stringify(songData.basePrice));
  }
  
  // Append files
  formData.append("audio", audioFile);
  if (coverImageFile) {
    formData.append("coverImage", coverImageFile);
  }
  
  return formData;
};

// Initial state
const initialState = {
  // Upload state
  uploadLoading: false,
  uploadProgress: 0,
  uploadError: null,
  uploadedSong: null,
  
  // Song data
  currentSong: null,
  
  // Validation
  validationErrors: {},
  
  // Status flags
  isUploading: false,
  uploadSuccess: false,
};

// Slice
const songSlice = createSlice({
  name: "artistSongs",
  initialState,
  reducers: {
    // Reset upload state
    resetUploadState: (state) => {
      state.uploadLoading = false;
      state.uploadProgress = 0;
      state.uploadError = null;
      state.uploadedSong = null;
      state.isUploading = false;
      state.uploadSuccess = false;
    },
    
    // Set upload progress
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    
    // Clear validation errors
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    // Set validation errors
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },
    
    // Reset song data
    resetCurrentSong: (state) => {
      state.currentSong = null;
    },
    
    // Set current song (for preview/edit)
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create song cases
      .addCase(createSong.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadProgress = 0;
        state.isUploading = true;
        state.uploadSuccess = false;
        state.uploadedSong = null;
      })
      .addCase(createSong.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadProgress = 100;
        state.isUploading = false;
        state.uploadSuccess = true;
        state.uploadedSong = action.payload;
        state.currentSong = action.payload;
        state.validationErrors = {};
      })
      .addCase(createSong.rejected, (state, action) => {
        state.uploadLoading = false;
        state.isUploading = false;
        state.uploadSuccess = false;
        state.uploadError = action.payload || "Upload failed";
        state.uploadProgress = 0;
        
        // Parse validation errors if available
        if (action.payload && typeof action.payload === 'object') {
          state.validationErrors = action.payload;
        }
      });
  },
});

// Export actions
export const {
  resetUploadState,
  setUploadProgress,
  clearValidationErrors,
  setValidationErrors,
  resetCurrentSong,
  setCurrentSong,
} = songSlice.actions;

// Export reducer
export default songSlice.reducer;