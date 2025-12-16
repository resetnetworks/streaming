import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Helper function to build query URL
const buildQueryURL = (baseURL, params) => {
  const { status, search, page = 1, limit = 20 } = params || {};
  let url = `${baseURL}?page=${page}&limit=${limit}`;
  
  if (status) {
    url += `&status=${status}`;
  }
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  return url;
};

// Admin Thunks
export const listArtistApplicationsForAdmin = createAsyncThunk(
  "artistApplicationAdmin/listApplications",
  async (params, thunkAPI) => {
    try {
      const url = buildQueryURL('/v2/admin/artist-applications', params);
      const res = await axios.get(url);
      
      return {
        applications: res.data.data.applications,
        pagination: res.data.data.pagination,
        stats: res.data.data.stats || {},
        params: params || {}
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
      console.log('Get by ID response:', res.data);
      return res.data.data.application;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch application"
      );
    }
  }
);

// ✅ FIXED: Generic Status Update with proper response handling
export const updateApplicationStatusForAdmin = createAsyncThunk(
  "artistApplicationAdmin/updateStatus",
  async ({ applicationId, status, adminNotes, reason }, thunkAPI) => {
    try {
      console.log(`🔄 Updating status for ${applicationId} to ${status}`);
      
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
          console.log('✅ Approval response:', res.data);
          // FIX: Handle both response structures
          return {
            application: res.data.data?.application || res.data.application,
            artist: res.data.data?.artist || res.data.artist,
            status: 'approved'
          };
          
        case 'rejected':
          // Include reason if provided
          if (reason) {
            requestData.notes = reason;
          } else if (adminNotes) {
            requestData.notes = adminNotes;
          }
          
          res = await axios.post(
            `/v2/admin/artist-applications/${applicationId}/reject`, 
            requestData
          );
          console.log('✅ Rejection response:', res.data);
          console.log('📊 Response structure analysis:', {
            hasData: !!res.data.data,
            hasDataApplication: !!res.data.data?.application,
            hasApplication: !!res.data.application,
            fullResponse: res.data
          });
          
          // FIX: Handle both response structures
          let application;
          if (res.data.data?.application) {
            application = res.data.data.application;
          } else if (res.data.application) {
            application = res.data.application;
          } else if (res.data.data) {
            // If data itself is the application
            application = res.data.data;
          } else {
            // Fallback - create minimal application object
            console.warn('No application found in response, creating minimal object');
            application = {
              _id: applicationId,
              id: applicationId,
              status: 'rejected'
            };
          }
          
          return { 
            application: application,
            status: 'rejected'
          };
          
        case 'needs_info':
          // Require reason for needs_info
          requestData.notes = reason || adminNotes || '';
          res = await axios.post(
            `/v2/admin/artist-applications/${applicationId}/request-more-info`, 
            requestData
          );
          console.log('✅ Needs info response:', res.data);
          // FIX: Handle both response structures
          return { 
            application: res.data.data?.application || res.data.application,
            status: 'needs_info'
          };
          
        default:
          // For other statuses (pending, cancelled)
          requestData.status = status;
          res = await axios.patch(
            `/v2/admin/artist-applications/${applicationId}/status`,
            requestData
          );
          console.log('✅ Status update response:', res.data);
          // FIX: Handle both response structures
          return { 
            application: res.data.data?.application || res.data.application,
            status: status
          };
      }
    } catch (err) {
      console.error('❌ Status update error:', {
        error: err.response?.data || err.message,
        statusCode: err.response?.status,
        requestData: { applicationId, status, adminNotes, reason }
      });
      
      // Check if it's actually a successful response
      if (err.response?.data?.success === true && err.response.data.application) {
        console.log('⚠️ API returned success in error format, extracting data');
        // Extract application from error response
        const application = err.response.data.application;
        return thunkAPI.fulfillWithValue({
          application: application,
          status: status
        });
      }
      
      // Return more detailed error information
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        `Failed to update status to ${status}`
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
      // FIX: Handle both response structures
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
  // List of applications for admin
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
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  
  // Filters
  filters: {
    status: null,
    search: null,
  },
  
  // Stats
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needs_info: 0,
    cancelled: 0,
  },
  
  // Cache & Refresh Control
  lastFetched: null,
  cacheTimestamp: null,
  isCached: false,
  shouldRefresh: false,
  CACHE_DURATION: 5 * 60 * 1000,
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
      state.filters = initialState.filters;
      state.stats = initialState.stats;
      state.isCached = false;
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
    
    clearAllState: (state) => {
      return { ...initialState };
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.shouldRefresh = true;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.shouldRefresh = true;
    },
    
    updateApplicationInList: (state, action) => {
      const index = state.applications.findIndex(
        app => app._id === action.payload._id
      );
      if (index !== -1) {
        state.applications[index] = { 
          ...state.applications[index], 
          ...action.payload 
        };
        
        // Update stats if status changed
        if (action.payload.status) {
          const oldStatus = state.applications[index].status;
          const newStatus = action.payload.status;
          
          if (oldStatus !== newStatus) {
            if (state.stats[oldStatus] > 0) {
              state.stats[oldStatus]--;
            }
            if (state.stats[newStatus] !== undefined) {
              state.stats[newStatus]++;
            }
          }
        }
      }
      
      if (state.currentApplication && state.currentApplication._id === action.payload._id) {
        state.currentApplication = { 
          ...state.currentApplication, 
          ...action.payload 
        };
      }
    },
    
    addNoteToApplication: (state, action) => {
      const { applicationId, note } = action.payload;
      
      if (state.currentApplication && state.currentApplication._id === applicationId) {
        if (!state.currentApplication.adminNotes) {
          state.currentApplication.adminNotes = [];
        }
        state.currentApplication.adminNotes.push({
          ...note,
          _id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      }
    },
    
    resetSuccessFlags: (state) => {
      state.statusUpdateSuccess = false;
      state.deleteSuccess = false;
      state.noteSuccess = false;
    },
    
    clearCache: (state) => {
      state.lastFetched = null;
      state.cacheTimestamp = null;
      state.isCached = false;
      state.shouldRefresh = true;
    },
    
    markForRefresh: (state) => {
      state.shouldRefresh = true;
      state.isCached = false;
    },
    
    resetRefreshFlag: (state) => {
      state.shouldRefresh = false;
    },
    
    forceRefresh: (state) => {
      state.shouldRefresh = true;
      state.isCached = false;
      state.cacheTimestamp = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List Applications
      .addCase(listArtistApplicationsForAdmin.pending, (state) => {
        state.applicationsLoading = true;
        state.applicationsError = null;
      })
      .addCase(listArtistApplicationsForAdmin.fulfilled, (state, action) => {
        state.applicationsLoading = false;
        state.applications = action.payload.applications;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        
        if (action.payload.params) {
          state.filters.status = action.payload.params.status;
          state.filters.search = action.payload.params.search;
        }
        
        state.lastFetched = Date.now();
        state.cacheTimestamp = Date.now();
        state.isCached = true;
        state.shouldRefresh = false;
        
        if (!action.payload.stats && action.payload.applications) {
          const stats = {
            total: action.payload.applications.length,
            pending: 0,
            approved: 0,
            rejected: 0,
            needs_info: 0,
            cancelled: 0,
          };
          
          action.payload.applications.forEach(app => {
            if (stats[app.status] !== undefined) {
              stats[app.status]++;
            }
          });
          
          state.stats = stats;
        }
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
      
      // Update Status (Generic) - FIXED
      .addCase(updateApplicationStatusForAdmin.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
        state.statusUpdateSuccess = false;
      })
      .addCase(updateApplicationStatusForAdmin.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateSuccess = true;
        state.statusUpdateError = null; // ✅ Clear error on success
        
        console.log('✅ Status update fulfilled:', action.payload);
        
        const updatedApplication = action.payload.application;
        
        if (!updatedApplication) {
          console.error('❌ No application in response');
          state.statusUpdateSuccess = false;
          state.statusUpdateError = 'No application data received';
          return;
        }
        
        // Ensure application has an _id
        if (!updatedApplication._id && !updatedApplication.id) {
          console.error('❌ Application missing ID:', updatedApplication);
          state.statusUpdateSuccess = false;
          state.statusUpdateError = 'Application data is invalid';
          return;
        }
        
        const applicationId = updatedApplication._id || updatedApplication.id;
        
        // Update in applications list
        const appIndex = state.applications.findIndex(
          app => app._id === applicationId || app.id === applicationId
        );
        
        if (appIndex !== -1) {
          const oldStatus = state.applications[appIndex].status;
          const newStatus = updatedApplication.status || action.payload.status;
          
          // Update the application with new status
          state.applications[appIndex] = {
            ...state.applications[appIndex],
            ...updatedApplication,
            status: newStatus
          };
          
          // Update stats if status changed
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
          const oldStatus = state.currentApplication.status;
          const newStatus = updatedApplication.status || action.payload.status;
          
          state.currentApplication = {
            ...state.currentApplication,
            ...updatedApplication,
            status: newStatus
          };
          
          // Update stats if status changed
          if (oldStatus !== newStatus) {
            if (state.stats[oldStatus] > 0) {
              state.stats[oldStatus]--;
            }
            if (state.stats[newStatus] !== undefined) {
              state.stats[newStatus]++;
            }
          }
        }
        
        state.shouldRefresh = true;
      })
      .addCase(updateApplicationStatusForAdmin.rejected, (state, action) => {
        console.error('❌ Status update rejected:', action.payload);
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
        
        // Update stats
        if (deletedApp && deletedApp.status && state.stats[deletedApp.status] > 0) {
          state.stats[deletedApp.status]--;
        }
        state.stats.total = Math.max(0, state.stats.total - 1);
        
        // Update pagination
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        
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
  clearAllState,
  setFilters,
  clearFilters,
  updateApplicationInList,
  addNoteToApplication,
  resetSuccessFlags,
  clearCache,
  markForRefresh,
  resetRefreshFlag,
  forceRefresh,
} = artistApplicationAdminSlice.actions;

export default artistApplicationAdminSlice.reducer;