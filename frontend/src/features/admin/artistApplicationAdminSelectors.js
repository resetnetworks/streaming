// src/features/admin/artistApplicationAdminSelectors.js
import { createSelector } from "@reduxjs/toolkit";

// Basic Selectors
export const selectArtistApplicationsAdmin = (state) => 
  state.artistApplicationAdmin.applications;

export const selectArtistApplicationsLoading = (state) => 
  state.artistApplicationAdmin.applicationsLoading;

export const selectArtistApplicationsError = (state) => 
  state.artistApplicationAdmin.applicationsError;

export const selectCurrentArtistApplication = (state) => 
  state.artistApplicationAdmin.currentApplication;

export const selectCurrentApplicationLoading = (state) => 
  state.artistApplicationAdmin.currentApplicationLoading;

export const selectCurrentApplicationError = (state) => 
  state.artistApplicationAdmin.currentApplicationError;

export const selectApplicationPagination = (state) => 
  state.artistApplicationAdmin.pagination;

export const selectApplicationFilters = (state) => 
  state.artistApplicationAdmin.filters;

export const selectApplicationStats = (state) => 
  state.artistApplicationAdmin.stats;

export const selectStatusUpdateLoading = (state) => 
  state.artistApplicationAdmin.statusUpdateLoading;

export const selectStatusUpdateError = (state) => 
  state.artistApplicationAdmin.statusUpdateError;

export const selectStatusUpdateSuccess = (state) => 
  state.artistApplicationAdmin.statusUpdateSuccess;

export const selectNoteLoading = (state) => 
  state.artistApplicationAdmin.noteLoading;

export const selectNoteError = (state) => 
  state.artistApplicationAdmin.noteError;

export const selectNoteSuccess = (state) => 
  state.artistApplicationAdmin.noteSuccess;

export const selectDeleteLoading = (state) => 
  state.artistApplicationAdmin.deleteLoading;

export const selectDeleteError = (state) => 
  state.artistApplicationAdmin.deleteError;

export const selectDeleteSuccess = (state) => 
  state.artistApplicationAdmin.deleteSuccess;

export const selectShouldRefreshApplications = (state) => 
  state.artistApplicationAdmin.shouldRefresh;

// Derived selectors - Simply pass data from backend
export const selectFilteredApplications = selectArtistApplicationsAdmin;

export const selectApplicationsByStatus = createSelector(
  [selectArtistApplicationsAdmin],
  (applications) => {
    const grouped = {
      pending: [],
      approved: [],
      rejected: [],
      needs_info: [],
      cancelled: [],
    };
    
    applications.forEach(app => {
      const status = app.status || 'pending';
      if (grouped[status]) {
        grouped[status].push(app);
      }
    });
    
    return grouped;
  }
);

export const selectApplicationById = (applicationId) => createSelector(
  [selectArtistApplicationsAdmin, selectCurrentArtistApplication],
  (applications, currentApplication) => {
    if (currentApplication && currentApplication._id === applicationId) {
      return currentApplication;
    }
    
    return applications.find(app => app._id === applicationId) || null;
  }
);

export const selectApplicationsWithPendingReviews = createSelector(
  [selectArtistApplicationsAdmin],
  (applications) => {
    return applications.filter(app => 
      app.status === 'pending' || app.status === 'needs_info'
    );
  }
);