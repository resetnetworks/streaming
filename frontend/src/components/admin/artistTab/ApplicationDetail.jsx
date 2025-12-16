import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaMusic, FaUserAlt, FaFileAlt } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { 
  getArtistApplicationById,
  deleteArtistApplication,
  clearCurrentApplication
} from '../../../features/admin/artistApplicationAdminSlice';
import {
  selectCurrentArtistApplication,
  selectCurrentApplicationLoading,
  selectDeleteLoading,
  selectDeleteSuccess,
  selectDeleteError,
  selectStatusUpdateSuccess,
  selectStatusUpdateError,
  // Applications list से भी डेटा चेक करने के लिए
  selectArtistApplicationsAdmin
} from '../../../features/admin/artistApplicationAdminSelectors';
import StatusBadge from './StatusBadge';
import ApplicationTabs from './ApplicationTabs';

const ApplicationDetail = ({ 
  applicationId, 
  onBack, 
  onOpenStatusModal, 
  onOpenNotesModal 
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const currentApplication = useSelector(selectCurrentArtistApplication);
  const currentAppLoading = useSelector(selectCurrentApplicationLoading);
  const deleteLoading = useSelector(selectDeleteLoading);
  const deleteSuccess = useSelector(selectDeleteSuccess);
  const deleteError = useSelector(selectDeleteError);
  const statusUpdateSuccess = useSelector(selectStatusUpdateSuccess);
  const statusUpdateError = useSelector(selectStatusUpdateError);
  
  // Applications list से डेटा लें
  const applications = useSelector(selectArtistApplicationsAdmin);

  // Load application details
  useEffect(() => {
    if (applicationId) {
      dispatch(getArtistApplicationById(applicationId));
    }

    return () => {
      dispatch(clearCurrentApplication());
    };
  }, [dispatch, applicationId]);

  // Handle success alerts
  useEffect(() => {
    if (deleteSuccess || statusUpdateSuccess) {
      setShowSuccessAlert(true);
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, statusUpdateSuccess]);

  // Handle delete application
  const handleDeleteApplication = async () => {
    if (!applicationId) {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      setIsDeleting(true);
      await dispatch(deleteArtistApplication(applicationId));
      setIsDeleting(false);
    }
  };

  // Loading state
  if (currentAppLoading && !currentApplication) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6">
          <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
            <div className="space-y-4">
              <Skeleton height={40} />
              <Skeleton height={200} />
              <Skeleton height={100} count={2} />
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  // ✅ IMPROVED: Applications list से भी चेक करें अगर currentApplication न मिले
  let applicationToDisplay = currentApplication;
  
  if (!currentApplication && applicationId && applications.length > 0) {
    // Applications list में ढूंढें
    applicationToDisplay = applications.find(app => 
      app._id === applicationId || 
      app.id === applicationId ||
      (app._id && app._id.toString() === applicationId)
    );
  }

  // Application not found
  if (!applicationToDisplay) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <FaFileAlt className="text-4xl text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Application not found</p>
          <p className="text-gray-500 text-sm mb-2">ID: {applicationId}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← Back to List
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="bg-green-900/20 border border-green-700/50 p-4">
          <div className="flex items-center gap-3">
            <FaEdit className="text-green-400" />
            <p className="text-green-400">
              {deleteSuccess ? 'Application deleted successfully!' : 'Status updated successfully!'}
            </p>
          </div>
        </div>
      )}
      
      {/* Error Alert */}
      {(deleteError || statusUpdateError) && (
        <div className="bg-red-900/20 border border-red-700/50 p-4">
          <div className="flex items-center gap-3">
            <FaFileAlt className="text-red-400" />
            <p className="text-red-400">
              {deleteError || statusUpdateError}
            </p>
          </div>
        </div>
      )}

      {/* Detail Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            ← Back to List
          </button>
          <div>
            <h3 className="text-lg font-semibold text-white">Application Details</h3>
            <p className="text-gray-400 text-sm">
              ID: {(applicationToDisplay._id || applicationToDisplay.id)?.slice(-8) || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={applicationToDisplay.status} size="lg" />
          <button
            onClick={handleDeleteApplication}
            disabled={deleteLoading || isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTrash /> 
            {deleteLoading || isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Application Header Info */}
      <div className="p-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {applicationToDisplay.stageName || 'No Stage Name'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1">
                  <FaUserAlt /> {applicationToDisplay?.legalName || 'Unknown'}
                </span>
                <span className="flex items-center gap-1">
                  <FaEnvelope /> {applicationToDisplay?.contact?.email || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt />
                  Applied: {applicationToDisplay.createdAt ? new Date(applicationToDisplay.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt />
                  Last Updated: {applicationToDisplay.updatedAt ? new Date(applicationToDisplay.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button
                onClick={onOpenNotesModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <FaEdit /> Add Note
              </button>
              <button
                onClick={() => {
                  onOpenStatusModal();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <FaEdit /> Update Status
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex gap-1 overflow-x-auto">
              {['overview', 'documents', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t-lg transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <ApplicationTabs 
            activeTab={activeTab} 
            application={applicationToDisplay} 
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;