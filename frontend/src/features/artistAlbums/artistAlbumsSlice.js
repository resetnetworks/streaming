import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunk for creating album
export const createAlbum = createAsyncThunk(
  "artistAlbums/create",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/albums", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.album;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create album"
      );
    }
  }
);

// Thunk for adding songs to album (batch upload)
export const addSongsToAlbum = createAsyncThunk(
  "artistAlbums/addSongs",
  async ({ albumId, songsData }, thunkAPI) => {
    try {
      const responses = [];
      
      // Upload songs one by one
      for (const songData of songsData) {
        const formData = new FormData();
        formData.append("title", songData.title);
        formData.append("duration", songData.duration);
        formData.append("album", albumId);
        formData.append("albumOnly", "true");
        formData.append("accessType", songData.accessType);
        
        if (songData.genre) formData.append("genre", songData.genre);
        if (songData.releaseDate) formData.append("releaseDate", songData.releaseDate);
        if (songData.audioFile) formData.append("audio", songData.audioFile);
        
        const res = await axios.post("/songs", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Update progress for current song
            thunkAPI.dispatch(updateSongUploadProgress({
              songIndex: songData.index,
              progress
            }));
          },
        });
        
        responses.push(res.data.song);
        
        // Update success count
        thunkAPI.dispatch(updateUploadedSongsCount());
      }
      
      return responses;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to add songs to album"
      );
    }
  }
);

// Thunk for getting album details
export const getAlbumDetails = createAsyncThunk(
  "artistAlbums/getDetails",
  async (albumId, thunkAPI) => {
    try {
      const res = await axios.get(`/albums/${albumId}`);
      return res.data.album;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch album details"
      );
    }
  }
);

// Helper function to create album form data
export const prepareAlbumFormData = (albumData, coverImageFile) => {
  const formData = new FormData();
  
  // Append required fields
  formData.append("title", albumData.title);
  formData.append("releaseDate", albumData.releaseDate);
  
  // Append optional fields
  if (albumData.description) formData.append("description", albumData.description);
  if (albumData.genre) formData.append("genre", albumData.genre);
  if (albumData.accessType) formData.append("accessType", albumData.accessType);
  
  // Append price if purchase-only
  if (albumData.accessType === "purchase-only" && albumData.basePrice) {
    formData.append("basePrice", JSON.stringify(albumData.basePrice));
  }
  
  // Append cover image if provided
  if (coverImageFile) {
    formData.append("coverImage", coverImageFile);
  }
  
  return formData;
};

// Helper function to prepare song form data for album
export const prepareAlbumSongFormData = (songData, audioFile, albumId) => {
  const formData = new FormData();
  
  // Append basic fields
  formData.append("title", songData.title);
  formData.append("duration", songData.duration);
  formData.append("album", albumId);
  formData.append("albumOnly", "true");
  formData.append("accessType", songData.accessType);
  
  // Append optional fields
  if (songData.genre) formData.append("genre", songData.genre);
  if (songData.releaseDate) formData.append("releaseDate", songData.releaseDate);
  
  // Append audio file
  if (audioFile) {
    formData.append("audio", audioFile);
  }
  
  return formData;
};

// Initial state
const initialState = {
  // Create album state
  createLoading: false,
  createError: null,
  createdAlbum: null,
  
  // Add songs to album state
  addSongsLoading: false,
  addSongsError: null,
  addSongsProgress: [], // Array of progress for each song
  uploadedSongsCount: 0,
  
  // Album details state
  currentAlbum: null,
  albumLoading: false,
  albumError: null,
  
  // Batch upload state
  batchUpload: {
    isUploading: false,
    totalSongs: 0,
    completedSongs: 0,
    failedSongs: 0,
    uploadResults: [], // Array of {success: boolean, song: object, error: string}
  },
  
  // Validation errors
  validationErrors: {},
  
  // Status flags
  isCreating: false,
  createSuccess: false,
};

// Slice
const artistAlbumsSlice = createSlice({
  name: "artistAlbums",
  initialState,
  reducers: {
    // Reset create state
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createdAlbum = null;
      state.isCreating = false;
      state.createSuccess = false;
      state.validationErrors = {};
    },
    
    // Reset add songs state
    resetAddSongsState: (state) => {
      state.addSongsLoading = false;
      state.addSongsError = null;
      state.addSongsProgress = [];
      state.uploadedSongsCount = 0;
      state.batchUpload = {
        isUploading: false,
        totalSongs: 0,
        completedSongs: 0,
        failedSongs: 0,
        uploadResults: [],
      };
    },
    
    // Clear validation errors
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    // Set validation errors
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },
    
    // Clear created album
    clearCreatedAlbum: (state) => {
      state.createdAlbum = null;
    },
    
    // Set current album
    setCurrentAlbum: (state, action) => {
      state.currentAlbum = action.payload;
    },
    
    // Clear current album
    clearCurrentAlbum: (state) => {
      state.currentAlbum = null;
    },
    
    // Update song upload progress
    updateSongUploadProgress: (state, action) => {
      const { songIndex, progress } = action.payload;
      state.addSongsProgress[songIndex] = progress;
    },
    
    // Update uploaded songs count
    updateUploadedSongsCount: (state) => {
      state.uploadedSongsCount += 1;
      state.batchUpload.completedSongs = state.uploadedSongsCount;
    },
    
    // Initialize batch upload
    initializeBatchUpload: (state, action) => {
      const totalSongs = action.payload;
      state.batchUpload = {
        isUploading: true,
        totalSongs,
        completedSongs: 0,
        failedSongs: 0,
        uploadResults: [],
      };
      state.addSongsProgress = Array(totalSongs).fill(0);
    },
    
    // Add upload result
    addUploadResult: (state, action) => {
      const { success, song, error, index } = action.payload;
      state.batchUpload.uploadResults[index] = {
        success,
        song,
        error,
        index
      };
      
      if (!success) {
        state.batchUpload.failedSongs += 1;
      }
    },
    
    // Complete batch upload
    completeBatchUpload: (state) => {
      state.batchUpload.isUploading = false;
    },
    
    // Reset all album state
    resetAllAlbumState: (state) => {
      return {
        ...initialState
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create album cases
      .addCase(createAlbum.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.isCreating = true;
        state.createSuccess = false;
        state.createdAlbum = null;
        state.validationErrors = {};
      })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.createLoading = false;
        state.isCreating = false;
        state.createSuccess = true;
        state.createdAlbum = action.payload;
        state.validationErrors = {};
      })
      .addCase(createAlbum.rejected, (state, action) => {
        state.createLoading = false;
        state.isCreating = false;
        state.createSuccess = false;
        state.createError = action.payload || "Album creation failed";
        
        // Parse validation errors if available
        if (action.payload && typeof action.payload === 'object') {
          state.validationErrors = action.payload;
        }
      })
      
      // Add songs to album cases
      .addCase(addSongsToAlbum.pending, (state) => {
        state.addSongsLoading = true;
        state.addSongsError = null;
      })
      .addCase(addSongsToAlbum.fulfilled, (state, action) => {
        state.addSongsLoading = false;
        state.addSongsProgress = Array(action.payload.length).fill(100);
        state.uploadedSongsCount = action.payload.length;
        
        // Update batch upload state
        state.batchUpload.completedSongs = action.payload.length;
        state.batchUpload.isUploading = false;
        
        // Add successful results
        action.payload.forEach((song, index) => {
          state.batchUpload.uploadResults[index] = {
            success: true,
            song,
            error: null,
            index
          };
        });
      })
      .addCase(addSongsToAlbum.rejected, (state, action) => {
        state.addSongsLoading = false;
        state.addSongsError = action.payload || "Failed to add songs";
        state.batchUpload.isUploading = false;
      })
      
      // Get album details cases
      .addCase(getAlbumDetails.pending, (state) => {
        state.albumLoading = true;
        state.albumError = null;
      })
      .addCase(getAlbumDetails.fulfilled, (state, action) => {
        state.albumLoading = false;
        state.currentAlbum = action.payload;
      })
      .addCase(getAlbumDetails.rejected, (state, action) => {
        state.albumLoading = false;
        state.albumError = action.payload || "Failed to fetch album";
      });
  },
});

// Export actions
export const {
  resetCreateState,
  resetAddSongsState,
  clearValidationErrors,
  setValidationErrors,
  clearCreatedAlbum,
  setCurrentAlbum,
  clearCurrentAlbum,
  updateSongUploadProgress,
  updateUploadedSongsCount,
  initializeBatchUpload,
  addUploadResult,
  completeBatchUpload,
  resetAllAlbumState,
} = artistAlbumsSlice.actions;

// Export selectors
export const selectAlbumCreateState = (state) => ({
  loading: state.artistAlbums.createLoading,
  error: state.artistAlbums.createError,
  success: state.artistAlbums.createSuccess,
  album: state.artistAlbums.createdAlbum,
});

export const selectBatchUploadState = (state) => ({
  isUploading: state.artistAlbums.batchUpload.isUploading,
  totalSongs: state.artistAlbums.batchUpload.totalSongs,
  completedSongs: state.artistAlbums.batchUpload.completedSongs,
  failedSongs: state.artistAlbums.batchUpload.failedSongs,
  uploadResults: state.artistAlbums.batchUpload.uploadResults,
  progress: state.artistAlbums.addSongsProgress,
});

export const selectAlbumDetails = (state) => ({
  album: state.artistAlbums.currentAlbum,
  loading: state.artistAlbums.albumLoading,
  error: state.artistAlbums.albumError,
});

// Export reducer
export default artistAlbumsSlice.reducer;