// src/features/artistApplications/artistApplicationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunks
export const submitArtistApplication = createAsyncThunk(
  "artistApplication/submit",
  async (applicationData, thunkAPI) => {
    try {
      const res = await axios.post("/v2/artist/apply", applicationData);
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
      console.log("API Response received:", {
        success: res.data.success,
        application: res.data.application,
        timestamp: new Date().toISOString()
      });
      return res.data.application;
    } catch (err) {
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

// Slice
const artistApplicationSlice = createSlice({
  name: "artistApplication",
  initialState: {
    // Store form data across steps
    formData: {
      // Profile details
      stageName: '',
      country: '',
      website: '',
      socialMedia: '',
      bio: '',
      profileImage: null,
      
      // Documents
      documents: [],
      samples: [],
      
      // Basic info (from registration)
      firstName: '',
      lastName: '',
      email: '',
    },
    
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
  },
  reducers: {
    // Update form data from any step
    updateApplicationFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
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
    },
    
    // Update specific field
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    
    // Add document
    addDocument: (state, action) => {
      state.formData.documents.push(action.payload);
    },
    
    // Remove document
    removeDocument: (state, action) => {
      state.formData.documents = state.formData.documents.filter(
        (_, index) => index !== action.payload
      );
    },
    
    // Add sample
    addSample: (state, action) => {
      state.formData.samples.push(action.payload);
    },
    
    // Remove sample
    removeSample: (state, action) => {
      state.formData.samples = state.formData.samples.filter(
        (_, index) => index !== action.payload
      );
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
    },
    
    // New reducer to clear fetched application
    clearMyApplication: (state) => {
      state.myApplication = null;
      state.fetchError = null;
      state.lastFetched = null;
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
        // Clear form data after successful submission
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
        
        console.log("Application data stored in Redux:", {
          hasData: !!action.payload,
          stageName: action.payload?.stageName,
          status: action.payload?.status,
          fetchTime: new Date().toISOString()
        });
      })
      .addCase(getMyArtistApplication.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
        state.myApplication = null;
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
} = artistApplicationSlice.actions;

export default artistApplicationSlice.reducer;