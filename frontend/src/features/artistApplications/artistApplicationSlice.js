// src/features/artistApplications/artistApplicationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Helper function to convert File to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Load from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('artistApplicationData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Check if data is older than 24 hours
      if (parsedData.lastSaved) {
        const savedTime = new Date(parsedData.lastSaved);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          localStorage.removeItem('artistApplicationData');
          return {
            stageName: '',
            country: '',
            website: '',
            socialMedia: '',
            bio: '',
            profileImage: null,
            documents: [],
            samples: [],
            firstName: '',
            lastName: '',
            email: '',
          };
        }
      }
      
      // Remove timestamp from form data
      const { lastSaved, ...formData } = parsedData;
      
      // Ensure arrays exist
      return {
        stageName: '',
        country: '',
        website: '',
        socialMedia: '',
        bio: '',
        profileImage: null,
        documents: [],
        samples: [],
        firstName: '',
        lastName: '',
        email: '',
        ...formData,
        documents: formData.documents || [],
        samples: formData.samples || []
      };
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return {
    stageName: '',
    country: '',
    website: '',
    socialMedia: '',
    bio: '',
    profileImage: null,
    documents: [],
    samples: [],
    firstName: '',
    lastName: '',
    email: '',
  };
};

// Thunks
export const submitArtistApplication = createAsyncThunk(
  "artistApplication/submit",
  async (applicationData, thunkAPI) => {
    try {
      const res = await axios.post("/v2/artist/apply", applicationData);
      
      // Clear localStorage on successful submission
      localStorage.removeItem('artistApplicationData');
      
      return res.data.application;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to submit application"
      );
    }
  }
);

export const getMyArtistApplication = createAsyncThunk(
  "artistApplication/getMyApplication",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/v2/artist/application/me");
      return res.data.application;
    } catch (err) {
      // Check if error is 404 or 500 with "No artist application found"
      if (err.response?.status === 404 || 
          (err.response?.status === 500 && err.response?.data?.message?.includes('No artist application'))) {
        return null; // Return null instead of throwing error
      }
      
      console.error("API Error:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        timestamp: new Date().toISOString()
      });
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch application"
      );
    }
  }
);

// Check if user is already an artist
export const checkIfUserIsArtist = createAsyncThunk(
  "artistApplication/checkIfUserIsArtist",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/v2/auth/me");
      const user = res.data.user;
      
      // Check if user has artist role
      const isArtist = user.roles && user.roles.includes('artist');
      return { isArtist, user };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch user data"
      );
    }
  }
);

// Save to localStorage thunk
export const saveToLocalStorage = createAsyncThunk(
  'artistApplication/saveToLocalStorage',
  async (_, { getState }) => {
    const state = getState().artistApplication;
    const { formData, myApplication } = state;
    
    // Don't save if already submitted or fetched from server
    if (myApplication) {
      return;
    }
    
    // Prepare data to save
    const dataToSave = { 
      ...formData,
      documents: formData.documents || [],
      samples: formData.samples || []
    };
    
    // Handle profile image file conversion
    if (dataToSave.profileImageFile instanceof File) {
      try {
        const base64 = await convertFileToBase64(dataToSave.profileImageFile);
        dataToSave.profileImage = base64;
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
      delete dataToSave.profileImageFile;
    }
    
    // Add timestamp
    dataToSave.lastSaved = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('artistApplicationData', JSON.stringify(dataToSave));
    
    return dataToSave;
  }
);

// Slice
const artistApplicationSlice = createSlice({
  name: "artistApplication",
  initialState: {
    // Store form data across steps
    formData: loadFromLocalStorage(),
    
    // UI state
    submitLoading: false,
    submitError: null,
    submitSuccess: false,
    submittedApplication: null,
    
    // New state for fetched application
    myApplication: null,
    fetchLoading: false,
    fetchError: null,
    lastFetched: null,
    
    // Check if user is already an artist
    isUserArtist: false,
    userCheckLoading: false,
    userCheckError: null,
    
    // LocalStorage saving state
    isSaving: false,
    lastSaved: null,
  },
  reducers: {
    // Update form data from any step
    updateApplicationFormData: (state, action) => {
      state.formData = { 
        ...state.formData, 
        ...action.payload,
        documents: action.payload.documents || state.formData.documents || [],
        samples: action.payload.samples || state.formData.samples || []
      };
      state.lastSaved = new Date().toISOString();
    },
    
    // Clear form data
    clearFormData: (state) => {
      state.formData = {
        stageName: '',
        country: '',
        website: '',
        socialMedia: '',
        bio: '',
        profileImage: null,
        documents: [],
        samples: [],
        firstName: '',
        lastName: '',
        email: '',
      };
      localStorage.removeItem('artistApplicationData');
      state.lastSaved = null;
    },
    
    // Update specific field
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
      state.lastSaved = new Date().toISOString();
    },
    
    // Add document
    addDocument: (state, action) => {
      if (!state.formData.documents) {
        state.formData.documents = [];
      }
      state.formData.documents.push(action.payload);
      state.lastSaved = new Date().toISOString();
    },
    
    // Remove document
    removeDocument: (state, action) => {
      if (!state.formData.documents) {
        state.formData.documents = [];
      }
      state.formData.documents = state.formData.documents.filter(
        (_, index) => index !== action.payload
      );
      state.lastSaved = new Date().toISOString();
    },
    
    // Add sample
    addSample: (state, action) => {
      if (!state.formData.samples) {
        state.formData.samples = [];
      }
      state.formData.samples.push(action.payload);
      state.lastSaved = new Date().toISOString();
    },
    
    // Remove sample
    removeSample: (state, action) => {
      if (!state.formData.samples) {
        state.formData.samples = [];
      }
      state.formData.samples = state.formData.samples.filter(
        (_, index) => index !== action.payload
      );
      state.lastSaved = new Date().toISOString();
    },
    
    // Clear submission state
    clearSubmitState: (state) => {
      state.submitLoading = false;
      state.submitError = null;
      state.submitSuccess = false;
    },
    
    // Clear submitted application
    clearSubmittedApplication: (state) => {
      state.submittedApplication = null;
    },
    
    // Reset all state
    resetApplicationState: (state) => {
      state.formData = {
        stageName: '',
        country: '',
        website: '',
        socialMedia: '',
        bio: '',
        profileImage: null,
        documents: [],
        samples: [],
        firstName: '',
        lastName: '',
        email: '',
      };
      state.submitLoading = false;
      state.submitError = null;
      state.submitSuccess = false;
      state.submittedApplication = null;
      state.myApplication = null;
      state.fetchLoading = false;
      state.fetchError = null;
      state.lastFetched = null;
      state.isUserArtist = false;
      state.userCheckLoading = false;
      state.userCheckError = null;
      state.isSaving = false;
      state.lastSaved = null;
      localStorage.removeItem('artistApplicationData');
    },
    
    // New reducer to clear fetched application
    clearMyApplication: (state) => {
      state.myApplication = null;
      state.fetchError = null;
      state.lastFetched = null;
    },
    
    // Set user artist status
    setUserArtistStatus: (state, action) => {
      state.isUserArtist = action.payload;
    },
    
    // Optional: Pre-fill form from fetched application
    prefillFormFromApplication: (state) => {
      if (state.myApplication) {
        const { stageName, country, website, socialMedia, bio, documents, samples } = state.myApplication;
        state.formData = {
          ...state.formData,
          stageName: stageName || '',
          country: country || '',
          website: website || '',
          socialMedia: socialMedia || '',
          bio: bio || '',
          documents: documents || [],
          samples: samples || [],
        };
      }
    },
    
    // Manual save to localStorage
    manualSaveToLocalStorage: (state) => {
      try {
        const dataToSave = { 
          ...state.formData,
          documents: state.formData.documents || [],
          samples: state.formData.samples || []
        };
        dataToSave.lastSaved = new Date().toISOString();
        
        // Handle file objects
        if (dataToSave.profileImageFile instanceof File) {
          delete dataToSave.profileImageFile;
        }
        
        localStorage.setItem('artistApplicationData', JSON.stringify(dataToSave));
        state.lastSaved = dataToSave.lastSaved;
      } catch (error) {
        console.error('Manual save failed:', error);
      }
    },
    
    // Load from localStorage manually
    loadFromLocalStorageManual: (state) => {
      const savedData = loadFromLocalStorage();
      if (Object.keys(savedData).length > 0) {
        state.formData = { ...state.formData, ...savedData };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit application cases
      .addCase(submitArtistApplication.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitArtistApplication.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.submittedApplication = action.payload;
        
        // Clear form data and localStorage after successful submission
        state.formData = {
          stageName: '',
          country: '',
          website: '',
          socialMedia: '',
          bio: '',
          profileImage: null,
          documents: [],
          samples: [],
          firstName: '',
          lastName: '',
          email: '',
        };
        state.lastSaved = null;
        localStorage.removeItem('artistApplicationData');
      })
      .addCase(submitArtistApplication.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
        state.submitSuccess = false;
      })
      
      // Get my application cases
      .addCase(getMyArtistApplication.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(getMyArtistApplication.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.myApplication = action.payload;
        state.fetchError = null;
        state.lastFetched = new Date().toISOString();
        
        // Clear localStorage if application exists on server
        if (action.payload) {
          localStorage.removeItem('artistApplicationData');
        }
      })
      .addCase(getMyArtistApplication.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
        state.myApplication = null;
      })
      
      // Check if user is artist cases
      .addCase(checkIfUserIsArtist.pending, (state) => {
        state.userCheckLoading = true;
        state.userCheckError = null;
      })
      .addCase(checkIfUserIsArtist.fulfilled, (state, action) => {
        state.userCheckLoading = false;
        state.isUserArtist = action.payload.isArtist;
        state.userCheckError = null;
      })
      .addCase(checkIfUserIsArtist.rejected, (state, action) => {
        state.userCheckLoading = false;
        state.userCheckError = action.payload;
        state.isUserArtist = false;
      })
      
      // Save to localStorage cases
      .addCase(saveToLocalStorage.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveToLocalStorage.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(saveToLocalStorage.rejected, (state) => {
        state.isSaving = false;
      });
  },
});

export const {
  updateApplicationFormData,
  clearFormData,
  updateField,
  addDocument,
  removeDocument,
  addSample,
  removeSample,
  clearSubmitState,
  clearSubmittedApplication,
  resetApplicationState,
  clearMyApplication,
  prefillFormFromApplication,
  setUserArtistStatus,
  manualSaveToLocalStorage,
  loadFromLocalStorageManual,
} = artistApplicationSlice.actions;

export default artistApplicationSlice.reducer;