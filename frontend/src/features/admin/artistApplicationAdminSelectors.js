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
  state.artistApplicationAdmin.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needs_info: 0,
    cancelled: 0,
  };

// Update operations selectors (renamed for clarity)
export const selectUpdateLoading = (state) => 
  state.artistApplicationAdmin.updateLoading || false;

export const selectUpdateError = (state) => 
  state.artistApplicationAdmin.updateError;

export const selectUpdateSuccess = (state) => 
  state.artistApplicationAdmin.updateSuccess || false;

// Status update selectors (NEW - for approve/reject/needs_info)
export const selectStatusUpdateLoading = (state) => 
  state.artistApplicationAdmin.statusUpdateLoading || false;

export const selectStatusUpdateError = (state) => 
  state.artistApplicationAdmin.statusUpdateError;

export const selectStatusUpdateSuccess = (state) => 
  state.artistApplicationAdmin.statusUpdateSuccess || false;

// Note operations selectors
export const selectNoteLoading = (state) => 
  state.artistApplicationAdmin.noteLoading || false;

export const selectNoteError = (state) => 
  state.artistApplicationAdmin.noteError;

export const selectNoteSuccess = (state) => 
  state.artistApplicationAdmin.noteSuccess || false;

// Delete operations selectors
export const selectDeleteLoading = (state) => 
  state.artistApplicationAdmin.deleteLoading || false;

export const selectDeleteError = (state) => 
  state.artistApplicationAdmin.deleteError;

export const selectDeleteSuccess = (state) => 
  state.artistApplicationAdmin.deleteSuccess || false;

// Cache selectors
export const selectIsCached = (state) => 
  state.artistApplicationAdmin.isCached || false;

export const selectCacheTimestamp = (state) => 
  state.artistApplicationAdmin.cacheTimestamp;

export const selectLastFetched = (state) => 
  state.artistApplicationAdmin.lastFetched;

export const selectShouldRefreshApplications = (state) => 
  state.artistApplicationAdmin.shouldRefresh || false;

export const selectCACHE_DURATION = (state) => 
  state.artistApplicationAdmin.CACHE_DURATION || (5 * 60 * 1000);

// Derived selectors using createSelector for memoization
export const selectFilteredApplications = createSelector(
  [selectArtistApplicationsAdmin, selectApplicationFilters],
  (applications, filters) => {
    if (!applications.length) return [];
    
    if (!filters.status && !filters.search) {
      return applications;
    }
    
    return applications.filter(app => {
      // Filter by status
      if (filters.status && app.status !== filters.status) {
        return false;
      }
      
      // Filter by search (stageName, user email, user name, genre)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const stageName = app.stageName?.toLowerCase() || '';
        const userEmail = app.user?.email?.toLowerCase() || '';
        const userName = app.user?.name?.toLowerCase() || '';
        const genre = app.genre?.toLowerCase() || '';
        const location = app.location?.toLowerCase() || '';
        
        return (
          stageName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          userName.includes(searchLower) ||
          genre.includes(searchLower) ||
          location.includes(searchLower)
        );
      }
      
      return true;
    });
  }
);

export const selectApplicationsByStatus = createSelector(
  [selectArtistApplicationsAdmin],
  (applications) => {
    if (!applications.length) {
      return {
        pending: [],
        approved: [],
        rejected: [],
        needs_info: [],
        cancelled: [],
      };
    }
    
    return applications.reduce((acc, app) => {
      const status = app.status || 'pending';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(app);
      return acc;
    }, {
      pending: [],
      approved: [],
      rejected: [],
      needs_info: [],
      cancelled: [],
    });
  }
);

export const selectCalculatedStats = createSelector(
  [selectArtistApplicationsAdmin],
  (applications) => {
    if (!applications.length) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        needs_info: 0,
        cancelled: 0,
      };
    }
    
    const stats = {
      total: applications.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      needs_info: 0,
      cancelled: 0,
    };
    
    applications.forEach(app => {
      const status = app.status || 'pending';
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    });
    
    return stats;
  }
);

export const selectApplicationById = (applicationId) => createSelector(
  [selectArtistApplicationsAdmin, selectCurrentArtistApplication],
  (applications, currentApplication) => {
    // First check current application
    if (currentApplication && currentApplication._id === applicationId) {
      return currentApplication;
    }
    
    // Then check in applications list
    return applications.find(app => app._id === applicationId) || null;
  }
);

export const selectIsCacheExpired = createSelector(
  [selectCacheTimestamp, selectCACHE_DURATION],
  (cacheTimestamp, cacheDuration) => {
    if (!cacheTimestamp) return true;
    return Date.now() - cacheTimestamp > cacheDuration;
  }
);

export const selectShouldFetchApplications = createSelector(
  [selectIsCached, selectIsCacheExpired, selectShouldRefreshApplications],
  (isCached, isCacheExpired, shouldRefresh) => {
    return !isCached || isCacheExpired || shouldRefresh;
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

export const selectApplicationsNeedingFollowUp = createSelector(
  [selectArtistApplicationsAdmin],
  (applications) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return applications.filter(app => {
      // Applications that haven't been updated in a week and are still pending/needs_info
      if (app.status !== 'pending' && app.status !== 'needs_info') {
        return false;
      }
      
      const lastUpdated = new Date(app.updatedAt);
      return lastUpdated < oneWeekAgo;
    });
  }
);

// ✅ NEW: Selector for specific status update states
export const selectIsApproving = createSelector(
  [selectStatusUpdateLoading, (state) => state.artistApplicationAdmin.currentApplication],
  (loading, currentApp) => loading && currentApp?.status === 'approved'
);

export const selectIsRejecting = createSelector(
  [selectStatusUpdateLoading, (state) => state.artistApplicationAdmin.currentApplication],
  (loading, currentApp) => loading && currentApp?.status === 'rejected'
);

export const selectIsRequestingInfo = createSelector(
  [selectStatusUpdateLoading, (state) => state.artistApplicationAdmin.currentApplication],
  (loading, currentApp) => loading && currentApp?.status === 'needs_info'
);

// ✅ NEW: Selector for paginated applications
export const selectPaginatedApplications = createSelector(
  [selectFilteredApplications, selectApplicationPagination],
  (applications, pagination) => {
    if (!applications.length) return [];
    
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    return applications.slice(startIndex, endIndex);
  }
);

// ✅ NEW: Selector for search results count
export const selectSearchResultsCount = createSelector(
  [selectFilteredApplications, selectApplicationFilters],
  (filteredApplications, filters) => {
    if (!filters.search) return 0;
    return filteredApplications.length;
  }
);

// ✅ NEW: Selector for active filters summary
export const selectActiveFiltersSummary = createSelector(
  [selectApplicationFilters, selectApplicationStats],
  (filters, stats) => {
    const activeFilters = [];
    
    if (filters.status) {
      activeFilters.push(`Status: ${filters.status}`);
    }
    
    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`);
    }
    
    return {
      hasFilters: activeFilters.length > 0,
      filters: activeFilters,
      totalCount: stats.total,
      filteredCount: 0 // This would need the filtered applications count
    };
  }
);

// ✅ NEW: Selector for application history/notes
export const selectApplicationNotes = createSelector(
  [selectCurrentArtistApplication],
  (currentApplication) => {
    if (!currentApplication || !currentApplication.adminNotes) {
      return [];
    }
    
    // Sort notes by date (newest first)
    return [...currentApplication.adminNotes].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
);

// ✅ NEW: Selector for application documents
export const selectApplicationDocuments = createSelector(
  [selectCurrentArtistApplication],
  (currentApplication) => {
    if (!currentApplication || !currentApplication.documents) {
      return [];
    }
    
    return currentApplication.documents;
  }
);

// ✅ NEW: Selector for user information
export const selectApplicationUserInfo = createSelector(
  [selectCurrentArtistApplication],
  (currentApplication) => {
    if (!currentApplication || !currentApplication.user) {
      return null;
    }
    
    return {
      name: currentApplication.user.name,
      email: currentApplication.user.email,
      phone: currentApplication.user.phone,
      _id: currentApplication.user._id
    };
  }
);

// ✅ NEW: Selector for application timeline/audit log
export const selectApplicationTimeline = createSelector(
  [selectCurrentArtistApplication],
  (currentApplication) => {
    if (!currentApplication) return [];
    
    const timeline = [];
    
    // Created at
    timeline.push({
      type: 'created',
      date: currentApplication.createdAt,
      title: 'Application Submitted',
      description: 'Artist application was submitted'
    });
    
    // Updated at
    if (currentApplication.updatedAt !== currentApplication.createdAt) {
      timeline.push({
        type: 'updated',
        date: currentApplication.updatedAt,
        title: 'Last Updated',
        description: 'Application was last updated'
      });
    }
    
    // Reviewed at
    if (currentApplication.reviewedAt) {
      timeline.push({
        type: 'reviewed',
        date: currentApplication.reviewedAt,
        title: 'Reviewed',
        description: `Application was reviewed by admin`,
        admin: currentApplication.adminReviewer?.name || 'Admin'
      });
    }
    
    // Notes
    if (currentApplication.adminNotes) {
      currentApplication.adminNotes.forEach(note => {
        timeline.push({
          type: 'note',
          date: note.createdAt,
          title: 'Admin Note Added',
          description: note.note,
          admin: note.addedBy?.name || 'Admin'
        });
      });
    }
    
    // Sort by date (newest first)
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
);