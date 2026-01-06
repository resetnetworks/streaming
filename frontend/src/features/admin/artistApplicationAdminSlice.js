// src/features/admin/artistApplicationAdminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Helper function to build query URL for backend
const buildQueryURL = (params) => {
  const { status, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params || {};
  let url = `/v2/admin/artist-applications?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  
  if (status && status !== 'all') {
    url += `&status=${status}`;
  }
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  return url;
};

// Admin Thunks - All data comes from backend
export const listArtistApplicationsForAdmin = createAsyncThunk(
  "artistApplicationAdmin/listApplications",
  async (params, thunkAPI) => {
    try {
      const url = buildQueryURL(params);
      const res = await axios.get(url);
      
      return {
        applications: res.data.data.applications || [],
        pagination: res.data.data.pagination || {},
        stats: res.data.data.stats || {},
        filters: {
          status: params?.status || 'all',
          search: params?.search || '',
          page: params?.page || 1,
          limit: params?.limit || 20
        }
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch applications"
      );
    }
  }
);

export const getArtistApplicationById = createAsyncThunk(
  "artistApplicationAdmin/getById",
  async (applicationId, thunkAPI) => {
    try {
      const res = await axios.get(`/v2/admin/artist-applications/${applicationId}`);
      return res.data.data.application;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch application"
      );
    }
  }
);

export const updateApplicationStatusForAdmin = createAsyncThunk(
  "artistApplicationAdmin/updateStatus",
  async ({ applicationId, status, adminNotes, reason }, thunkAPI) => {
    try {
      let res;
      let requestData = {};
      
      // Prepare request data
      if (status === 'needs_info' && reason) {
        requestData.notes = reason;
      } else if (adminNotes) {
        requestData.adminNotes = adminNotes;
      }
      
      // Choose the correct endpoint based on status
      switch (status) {
        case 'approved':
          res = await axios.post(
            `/v2/admin/artist-applications/${applicationId}/approve`, 
            requestData
          );
          return {
            application: res.data.data?.application || res.data.application,
            artist: res.data.data?.artist || res.data.artist,
            status: 'approved'
          };
          
        case 'rejected':
          if (reason) requestData.notes = reason;
          res = await axios.post(
            `/v2/admin/artist-applications/${applicationId}/reject`, 
            requestData
          );
          return { 
            application: res.data.data?.application || res.data.application,
            status: 'rejected'
          };
          
        case 'needs_info':
          requestData.notes = reason || adminNotes || '';
          res = await axios.post(
            `/v2/admin/artist-applications/${applicationId}/request-more-info`, 
            requestData
          );
          return { 
            application: res.data.data?.application || res.data.application,
            status: 'needs_info'
          };
          
        default:
          requestData.status = status;
          res = await axios.patch(
            `/v2/admin/artist-applications/${applicationId}/status`,
            requestData
          );
          return { 
            application: res.data.data?.application || res.data.application,
            status: status
          };
      }
    } catch (err) {
      console.error('Status update error:', err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || `Failed to update status to ${status}`
      );
    }
  }
);

export const addAdminNote = createAsyncThunk(
  "artistApplicationAdmin/addNote",
  async ({ applicationId, note }, thunkAPI) => {
    try {
      const res = await axios.post(
        `/v2/admin/artist-applications/${applicationId}/notes`,
        { note }
      );
      return res.data.data?.application || res.data.application;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to add note"
      );
    }
  }
);

export const deleteArtistApplication = createAsyncThunk(
  "artistApplicationAdmin/delete",
  async (applicationId, thunkAPI) => {
    try {
      await axios.delete(`/v2/admin/artist-applications/${applicationId}`);
      return applicationId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete application"
      );
    }
  }
);

// Initial State
const initialState = {
  // List of applications from backend
  applications: [],
  applicationsLoading: false,
  applicationsError: null,
  
  // Current application being viewed
  currentApplication: null,
  currentApplicationLoading: false,
  currentApplicationError: null,
  
  // Status update operations
  statusUpdateLoading: false,
  statusUpdateError: null,
  statusUpdateSuccess: false,
  
  // Note operations
  noteLoading: false,
  noteError: null,
  noteSuccess: false,
  
  // Delete operations
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
  
  // Pagination from backend
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  
  // Filters (used for API calls)
  filters: {
    status: 'all',
    search: '',
    page: 1,
    limit: 20,
  },
  
  // Stats from backend
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needs_info: 0,
    cancelled: 0,
  },
  
  // Refresh control
  lastFetched: null,
  shouldRefresh: false,
};

// Slice
const artistApplicationAdminSlice = createSlice({
  name: "artistApplicationAdmin",
  initialState,
  reducers: {
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
      state.currentApplicationLoading = false;
      state.currentApplicationError = null;
    },
    
    clearApplicationsList: (state) => {
      state.applications = [];
      state.applicationsLoading = false;
      state.applicationsError = null;
      state.pagination = initialState.pagination;
      state.stats = initialState.stats;
      state.shouldRefresh = false;
    },
    
    clearStatusUpdateState: (state) => {
      state.statusUpdateLoading = false;
      state.statusUpdateError = null;
      state.statusUpdateSuccess = false;
    },
    
    clearDeleteState: (state) => {
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    
    clearNoteState: (state) => {
      state.noteLoading = false;
      state.noteError = null;
      state.noteSuccess = false;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
      state.shouldRefresh = true;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.shouldRefresh = true;
    },
    
    markForRefresh: (state) => {
      state.shouldRefresh = true;
    },
    
    resetRefreshFlag: (state) => {
      state.shouldRefresh = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // List Applications from backend
      .addCase(listArtistApplicationsForAdmin.pending, (state) => {
        state.applicationsLoading = true;
        state.applicationsError = null;
      })
      .addCase(listArtistApplicationsForAdmin.fulfilled, (state, action) => {
        state.applicationsLoading = false;
        state.applications = action.payload.applications;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        state.filters = action.payload.filters;
        state.lastFetched = Date.now();
        state.shouldRefresh = false;
      })
      .addCase(listArtistApplicationsForAdmin.rejected, (state, action) => {
        state.applicationsLoading = false;
        state.applicationsError = action.payload;
        state.shouldRefresh = false;
      })
      
      // Get Application By ID
      .addCase(getArtistApplicationById.pending, (state) => {
        state.currentApplicationLoading = true;
        state.currentApplicationError = null;
      })
      .addCase(getArtistApplicationById.fulfilled, (state, action) => {
        state.currentApplicationLoading = false;
        state.currentApplication = action.payload;
      })
      .addCase(getArtistApplicationById.rejected, (state, action) => {
        state.currentApplicationLoading = false;
        state.currentApplicationError = action.payload;
      })
      
      // Update Status
      .addCase(updateApplicationStatusForAdmin.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
        state.statusUpdateSuccess = false;
      })
      .addCase(updateApplicationStatusForAdmin.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateSuccess = true;
        state.statusUpdateError = null;
        
        const updatedApplication = action.payload.application;
        const applicationId = updatedApplication._id || updatedApplication.id;
        const newStatus = updatedApplication.status || action.payload.status;
        
        // Update in applications list
        const appIndex = state.applications.findIndex(
          app => app._id === applicationId || app.id === applicationId
        );
        
        if (appIndex !== -1) {
          const oldStatus = state.applications[appIndex].status;
          state.applications[appIndex] = updatedApplication;
          
          // Update stats
          if (oldStatus !== newStatus) {
            if (state.stats[oldStatus] > 0) {
              state.stats[oldStatus]--;
            }
            if (state.stats[newStatus] !== undefined) {
              state.stats[newStatus]++;
            }
          }
        }
        
        // Update current application
        if (state.currentApplication && 
            (state.currentApplication._id === applicationId || 
             state.currentApplication.id === applicationId)) {
          state.currentApplication = updatedApplication;
        }
        
        state.shouldRefresh = true;
      })
      .addCase(updateApplicationStatusForAdmin.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
        state.statusUpdateSuccess = false;
      })
      
      // Add Note
      .addCase(addAdminNote.pending, (state) => {
        state.noteLoading = true;
        state.noteError = null;
        state.noteSuccess = false;
      })
      .addCase(addAdminNote.fulfilled, (state, action) => {
        state.noteLoading = false;
        state.noteSuccess = true;
        
        if (state.currentApplication && state.currentApplication._id === action.payload._id) {
          state.currentApplication = action.payload;
        }
        
        state.shouldRefresh = true;
      })
      .addCase(addAdminNote.rejected, (state, action) => {
        state.noteLoading = false;
        state.noteError = action.payload;
        state.noteSuccess = false;
      })
      
      // Delete Application
      .addCase(deleteArtistApplication.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteArtistApplication.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        
        const deletedApp = state.applications.find(app => app._id === action.payload);
        
        // Remove from list
        state.applications = state.applications.filter(
          app => app._id !== action.payload
        );
        
        // Clear current if it's the deleted one
        if (state.currentApplication && state.currentApplication._id === action.payload) {
          state.currentApplication = null;
        }
        
        // Update stats from backend
        state.shouldRefresh = true;
      })
      .addCase(deleteArtistApplication.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const {
  clearCurrentApplication,
  clearApplicationsList,
  clearStatusUpdateState,
  clearDeleteState,
  clearNoteState,
  setFilters,
  clearFilters,
  markForRefresh,
  resetRefreshFlag,
} = artistApplicationAdminSlice.actions;

export default artistApplicationAdminSlice.reducer;