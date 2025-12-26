// src/components/admin/artistTab/Artists.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

// Redux imports
import {
  listArtistApplicationsForAdmin,
  clearApplicationsList,
  clearCurrentApplication,
  setFilters,
  clearFilters,
  markForRefresh,
  resetRefreshFlag
} from '../../features/admin/artistApplicationAdminSlice';

import {
  selectArtistApplicationsAdmin,
  selectArtistApplicationsLoading,
  selectArtistApplicationsError,
  selectApplicationPagination,
  selectApplicationFilters,
  selectApplicationStats,
  selectShouldRefreshApplications,
  selectStatusUpdateLoading,
  selectStatusUpdateError
} from '../../features/admin/artistApplicationAdminSelectors';

// Component imports
import AdminArtistHeader from '../../components/admin/artistTab/AdminArtistHeader';
import AdminArtistStatusFilters from '../../components/admin/artistTab/AdminArtistStatusFilters';
import AdminArtistApplicationsTable from '../../components/admin/artistTab/AdminArtistApplicationsTable';
import ApplicationDetail from '../../components/admin/artistTab/ApplicationDetail';
import StatusUpdateModal from '../../components/admin/artistTab/StatusUpdateModal';
import AddNoteModal from '../../components/admin/artistTab/AddNoteModal';
import AlertNotification from '../../components/admin/artistTab/AlertNotification';

const Artists = () => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedAppForModal, setSelectedAppForModal] = useState(null);
  
  // Search and filter states
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selectors
  const applications = useSelector(selectArtistApplicationsAdmin);
  const loading = useSelector(selectArtistApplicationsLoading);
  const error = useSelector(selectArtistApplicationsError);
  const pagination = useSelector(selectApplicationPagination);
  const filters = useSelector(selectApplicationFilters);
  const shouldRefresh = useSelector(selectShouldRefreshApplications);
  const statusUpdateLoading = useSelector(selectStatusUpdateLoading);
  const statusUpdateError = useSelector(selectStatusUpdateError);

  const isMountedRef = useRef(true);

  // Fetch applications from backend
  const fetchApplications = useCallback((newFilters = {}) => {
    const params = {
      page: newFilters.page || pagination.page,
      limit: pagination.limit,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchInput || undefined,
      ...newFilters
    };
    
    dispatch(listArtistApplicationsForAdmin(params));
  }, [dispatch, pagination.page, pagination.limit, statusFilter, searchInput]);

  // Initial load and refresh
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (shouldRefresh || applications.length === 0) {
      fetchApplications();
      dispatch(resetRefreshFlag());
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [shouldRefresh, dispatch, fetchApplications, applications.length]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput, page: 1 }));
        fetchApplications({ page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, dispatch, fetchApplications]);

  // Handle status filter change
  useEffect(() => {
    if (statusFilter !== filters.status) {
      dispatch(setFilters({ status: statusFilter, page: 1 }));
      fetchApplications({ page: 1 });
    }
  }, [statusFilter, filters.status, dispatch, fetchApplications]);

  // Handle page change
  const handlePageChange = (newPage) => {
    dispatch(setFilters({ page: newPage }));
    fetchApplications({ page: newPage });
  };

  // View details
  const handleViewDetails = (application) => {
    setSelectedApplicationId(application._id || application.id);
    setViewMode('detail');
  };

  // Back to list
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplicationId(null);
    setSelectedAppForModal(null);
    dispatch(clearCurrentApplication());
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(markForRefresh());
    fetchApplications();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setStatusFilter('all');
    dispatch(clearFilters());
    fetchApplications({ page: 1 });
  };

  // Open status modal
  const handleOpenStatusModal = (application) => {
    setSelectedApplicationId(application._id || application.id);
    setSelectedAppForModal(application);
    setIsStatusModalOpen(true);
  };

  // Handle status update success
  const handleStatusUpdateSuccess = () => {
    toast.success('Status updated successfully');
    setIsStatusModalOpen(false);
    setSelectedAppForModal(null);
    
    // Refresh current view
    if (viewMode === 'detail') {
      dispatch(clearCurrentApplication());
    } else {
      fetchApplications();
    }
  };

  // Handle error alerts
  useEffect(() => {
    if (statusUpdateError) {
      toast.error(statusUpdateError);
    }
  }, [statusUpdateError]);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <AdminArtistHeader
        searchTerm={searchInput}
        setSearchTerm={setSearchInput}
        onRefresh={handleRefresh}
        loading={loading}
      />



      {/* Error Display */}
      {error && (
        <AlertNotification
          type="error"
          message={error}
          show={!!error}
          autoClose={5000}
        />
      )}

      {/* Main Content */}
      {viewMode === 'list' ? (
        <AdminArtistApplicationsTable
          applications={applications}
          pagination={pagination}
          loading={loading}
          onViewDetails={handleViewDetails}
          onOpenStatusModal={handleOpenStatusModal}
          onPageChange={handlePageChange}
        />
      ) : (
        <ApplicationDetail
          applicationId={selectedApplicationId}
          onBack={handleBackToList}
          onOpenStatusModal={() => {
            if (selectedApplicationId) {
              const currentApp = applications.find(app => 
                app._id === selectedApplicationId || app.id === selectedApplicationId
              );
              setSelectedAppForModal(currentApp);
              setIsStatusModalOpen(true);
            }
          }}
          onOpenNotesModal={() => setIsNotesModalOpen(true)}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedAppForModal && (
        <StatusUpdateModal
          applicationId={selectedApplicationId}
          currentStatus={selectedAppForModal.status}
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedAppForModal(null);
          }}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

      {/* Add Note Modal */}
      {isNotesModalOpen && (
        <AddNoteModal
          applicationId={selectedApplicationId}
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
};

export default Artists;