import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSync, FaTimes, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaClock, FaBan } from 'react-icons/fa';

import { updateApplicationStatusForAdmin, clearStatusUpdateState } from '../../../features/admin/artistApplicationAdminSlice';
import { 
  selectStatusUpdateLoading, 
  selectStatusUpdateError,
  selectStatusUpdateSuccess
} from '../../../features/admin/artistApplicationAdminSelectors';

const StatusUpdateModal = ({ 
  applicationId, 
  currentStatus = '',
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  
  const dispatch = useDispatch();
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    reason: '',
    adminNotes: ''
  });
  const [validationError, setValidationError] = useState('');
  
  const statusUpdateLoading = useSelector(selectStatusUpdateLoading);
  const statusUpdateError = useSelector(selectStatusUpdateError);
  const statusUpdateSuccess = useSelector(selectStatusUpdateSuccess);

  // Reset everything when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatusUpdateData({
        status: '',
        reason: '',
        adminNotes: ''
      });
      setValidationError('');
      dispatch(clearStatusUpdateState());
    }
  }, [isOpen, applicationId, currentStatus, dispatch]);

  // Handle success and close modal
  useEffect(() => {
    if (statusUpdateSuccess && isOpen) {
      onSuccess?.();
      handleClose();
    }
  }, [statusUpdateSuccess, isOpen, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setValidationError('');
    
    // Validation
    if (!applicationId) {
      setValidationError('Application ID is required');
      return;
    }
    
    if (!statusUpdateData.status) {
      setValidationError('Please select a status');
      return;
    }
    
    if (statusUpdateData.status === 'needs_info' && !statusUpdateData.reason.trim()) {
      setValidationError('Reason is required when requesting more information');
      return;
    }
    
    try {
      dispatch(clearStatusUpdateState());
      
      const result = await dispatch(updateApplicationStatusForAdmin({
        applicationId,
        ...statusUpdateData
      }));
            
      if (result.type === 'artistApplicationAdmin/updateStatus/rejected') {
        setValidationError('Failed to update status. Please try again.');
      }
      
    } catch (err) {
      setValidationError(err.message || 'An unexpected error occurred');
    }
  };

  const handleClose = useCallback(() => {
    setStatusUpdateData({
      status: '',
      reason: '',
      adminNotes: ''
    });
    setValidationError('');
    dispatch(clearStatusUpdateState());
    onClose();
  }, [dispatch, onClose]);

  if (!isOpen) {
    return null;
  }

  const statusOptions = [
    { 
      value: 'approved', 
      label: 'Approved', 
      icon: <FaCheckCircle />,
      description: 'Approve the application and create artist account',
      color: 'bg-green-600 hover:bg-green-700',
      requiresNotes: false
    },
    { 
      value: 'rejected', 
      label: 'Rejected', 
      icon: <FaTimesCircle />,
      description: 'Reject the application with optional reason',
      color: 'bg-red-600 hover:bg-red-700',
      requiresNotes: false
    },
    { 
      value: 'needs_info', 
      label: 'Needs More Info', 
      icon: <FaInfoCircle />,
      description: 'Request additional information from applicant',
      color: 'bg-blue-600 hover:bg-blue-700',
      requiresNotes: true
    },
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: <FaClock />,
      description: 'Mark as pending for later review',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      requiresNotes: false
    },
  ];

  const selectedStatus = statusOptions.find(opt => opt.value === statusUpdateData.status);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          disabled={statusUpdateLoading}
        >
          <FaTimes size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">Update Application Status</h3>
        <div className="text-gray-400 text-sm mb-6 space-y-1">
          <p>Application ID: <span className="text-white font-mono">{applicationId || 'Not available'}</span></p>
          <p>Current Status: <span className="text-white font-medium">{currentStatus}</span></p>
          <p>Selected Status: <span className={`font-medium ${
            statusUpdateData.status === 'approved' ? 'text-green-400' :
            statusUpdateData.status === 'rejected' ? 'text-red-400' :
            statusUpdateData.status === 'needs_info' ? 'text-blue-400' :
            'text-yellow-400'
          }`}>{statusUpdateData.status || 'Not selected'}</span></p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select New Status
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatusUpdateData(prev => ({ 
                      ...prev, 
                      status: option.value,
                      ...(prev.status === 'needs_info' && option.value !== 'needs_info' ? { reason: '' } : {})
                    }));
                  }}
                  className={`p-3 rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                    statusUpdateData.status === option.value
                      ? `${option.color} text-white shadow-lg`
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  disabled={statusUpdateLoading}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            
            {selectedStatus && (
              <p className="text-gray-400 text-xs mt-2">
                {selectedStatus.description}
              </p>
            )}
          </div>

          {/* Reason/Notes */}
          <div className="space-y-4">
            {selectedStatus?.requiresNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for requesting more information
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  value={statusUpdateData.reason}
                  onChange={(e) => {
                    setStatusUpdateData(prev => ({ ...prev, reason: e.target.value }));
                  }}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows="3"
                  placeholder="Explain what additional information is needed..."
                  required={selectedStatus.requiresNotes}
                  disabled={statusUpdateLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {statusUpdateData.status === 'needs_info' ? 'Additional Notes (Optional)' : 'Notes (Optional)'}
              </label>
              <textarea
                value={statusUpdateData.adminNotes}
                onChange={(e) => {
                  setStatusUpdateData(prev => ({ ...prev, adminNotes: e.target.value }));
                }}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="2"
                placeholder="Add any additional notes..."
                disabled={statusUpdateLoading}
              />
            </div>
          </div>

          {/* Error Messages */}
          {(validationError || statusUpdateError) && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-sm">
                {validationError || statusUpdateError}
              </p>
            </div>
          )}

          {/* Success Message */}
          {statusUpdateSuccess && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <p className="text-green-400 text-sm">✓ Status updated successfully!</p>
              <p className="text-gray-400 text-xs mt-1">
                The application status has been updated.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              disabled={statusUpdateLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!statusUpdateData.status || statusUpdateLoading || statusUpdateSuccess}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                statusUpdateData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                statusUpdateData.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                statusUpdateData.status === 'needs_info' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {statusUpdateLoading ? (
                <>
                  <FaSync className="animate-spin" />
                  {statusUpdateData.status === 'approved' ? 'Approving...' : 
                   statusUpdateData.status === 'rejected' ? 'Rejecting...' : 
                   statusUpdateData.status === 'needs_info' ? 'Requesting Info...' : 
                   'Updating...'}
                </>
              ) : statusUpdateSuccess ? (
                '✓ Done'
              ) : (
                <>
                  {statusUpdateData.status === 'approved' ? 'Approve Application' : 
                   statusUpdateData.status === 'rejected' ? 'Reject Application' : 
                   statusUpdateData.status === 'needs_info' ? 'Request More Info' : 
                   'Update Status'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;