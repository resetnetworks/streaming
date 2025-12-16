import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  listArtistApplicationsForAdmin,
  clearApplicationsList,
  clearCurrentApplication,
  setFilters,
  clearFilters,
  resetRefreshFlag
} from '../../features/admin/artistApplicationAdminSlice';
import {
  selectArtistApplicationsAdmin,
  selectArtistApplicationsLoading,
  selectArtistApplicationsError,
  selectApplicationPagination,
  selectApplicationFilters,
  selectFilteredApplications,
  selectCalculatedStats,
  selectShouldFetchApplications,
  selectShouldRefreshApplications
} from '../../features/admin/artistApplicationAdminSelectors';

import { 
  AdminArtistHeader, 
  AdminArtistQuickStats, 
  AdminArtistStatusFilters, 
  AdminArtistApplicationsTable,
  ApplicationDetail,
  StatusUpdateModal,
  AddNoteModal,
  AlertNotification 
} from '../../components/admin/artistTab';

const Artists = () => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedAppForModal, setSelectedAppForModal] = useState(null);

  const shouldFetch = useSelector(selectShouldFetchApplications);
  const shouldRefresh = useSelector(selectShouldRefreshApplications);
  const isMountedRef = useRef(true);

  const applications = useSelector(selectArtistApplicationsAdmin);
  const filteredApplications = useSelector(selectFilteredApplications);
  const loading = useSelector(selectArtistApplicationsLoading);
  const error = useSelector(selectArtistApplicationsError);
  const pagination = useSelector(selectApplicationPagination);
  const filters = useSelector(selectApplicationFilters);
  
  const stats = useSelector(selectCalculatedStats);

  // Optimized data fetching
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const fetchData = async () => {
      if (shouldFetch) {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm || undefined
        };
        await dispatch(listArtistApplicationsForAdmin(params));
        
        if (shouldRefresh) {
          dispatch(resetRefreshFlag());
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [shouldFetch, shouldRefresh, dispatch, pagination.page, pagination.limit, selectedStatus, searchTerm]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filters.search]);

  // Handle status filter change
  useEffect(() => {
    if (selectedStatus !== filters.status) {
      dispatch(setFilters({ 
        status: selectedStatus !== 'all' ? selectedStatus : null 
      }));
    }
  }, [selectedStatus, dispatch, filters.status]);

  const fetchApplications = useCallback((page = 1) => {
    const params = {
      page,
      limit: pagination.limit,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      search: searchTerm || undefined
    };
    dispatch(listArtistApplicationsForAdmin(params));
  }, [dispatch, pagination.limit, selectedStatus, searchTerm]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handleViewDetails = (application) => {
    setSelectedApplicationId(application.id);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplicationId(null);
    setSelectedAppForModal(null);
    dispatch(clearCurrentApplication());
  };

  const handleRefresh = () => {
    dispatch(clearApplicationsList());
    fetchApplications(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    dispatch(clearFilters());
  };

  const handlePageChange = (page) => {
    fetchApplications(page);
  };

  const handleOpenStatusModal = (application) => {
    setSelectedApplicationId(application.id);
    setSelectedAppForModal(application);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdateSuccess = () => {
    fetchApplications(pagination.page);
    if (viewMode === 'detail') {
      // Refetch current application
      dispatch(clearCurrentApplication());
    }
  };

  return (
    <div className="p-6">
      <AdminArtistHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <AdminArtistQuickStats stats={stats} />

      <AdminArtistStatusFilters
        selectedStatus={selectedStatus}
        onStatusFilter={handleStatusFilter}
        stats={stats}
        hasFilters={selectedStatus !== 'all' || searchTerm}
        onClearFilters={handleClearFilters}
      />

      {error && (
        <AlertNotification
          type="error"
          message={error}
          show={!!error}
          autoClose={5000}
        />
      )}

      {viewMode === 'list' ? (
        <AdminArtistApplicationsTable
          applications={filteredApplications}
          pagination={pagination}
          loading={loading}
          searchTerm={searchTerm}
          onViewDetails={handleViewDetails}
          onOpenStatusModal={handleOpenStatusModal}
          onPageChange={handlePageChange}
          onClearSearch={() => setSearchTerm('')}
        />
      ) : (
        <ApplicationDetail
          applicationId={selectedApplicationId}
          onBack={handleBackToList}
          onOpenStatusModal={() => {
            if (selectedApplicationId) {
              // Get current application from state
              const currentApp = applications.find(app => app.id === selectedApplicationId);
              setSelectedAppForModal(currentApp);
              setIsStatusModalOpen(true);
            }
          }}
          onOpenNotesModal={() => setIsNotesModalOpen(true)}
        />
      )}

      {isStatusModalOpen && selectedAppForModal && (
        <StatusUpdateModal
          applicationId={selectedApplicationId}
          currentStatus={selectedAppForModal.status || ''}
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedAppForModal(null);
          }}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

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