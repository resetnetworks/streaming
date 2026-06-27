// src/components/admin/artistTab/Artists.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

// TanStack React Query imports
import { useAdminApplications } from '../../hooks/api/useAdminArtistApplications';

// Component imports
import AdminArtistHeader from '../../components/admin/artistTab/AdminArtistHeader';
import AdminArtistApplicationsTable from '../../components/admin/artistTab/AdminArtistApplicationsTable';
import ApplicationDetail from '../../components/admin/artistTab/ApplicationDetail';
import StatusUpdateModal from '../../components/admin/artistTab/StatusUpdateModal';
import AddNoteModal from '../../components/admin/artistTab/AddNoteModal';
import AlertNotification from '../../components/admin/artistTab/AlertNotification';

const Artists = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedAppForModal, setSelectedAppForModal] = useState(null);
  
  // Search and filter states
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle search input debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch applications using React Query
  const { data: responseData, isLoading: loading, error: queryError, refetch } = useAdminApplications({
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const applications = responseData?.data?.applications || [];
  const pagination = responseData?.data?.pagination || { page: 1, limit: 20, totalPages: 1, totalApplications: 0 };
  const error = queryError ? (queryError.response?.data?.message || queryError.message || 'Failed to load applications') : null;

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
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
  };

  // Refresh data
  const handleRefresh = () => {
    refetch();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setStatusFilter('all');
    setPage(1);
  };

  // Open status modal
  const handleOpenStatusModal = (application) => {
    setSelectedApplicationId(application._id || application.id);
    setSelectedAppForModal(application);
    setIsStatusModalOpen(true);
  };

  // Handle status update success
  const handleStatusUpdateSuccess = () => {
    setIsStatusModalOpen(false);
    setSelectedAppForModal(null);
    setIsNotesModalOpen(false);
    refetch();
  };

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
          applications={applications}
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