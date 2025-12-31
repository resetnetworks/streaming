import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPendingPayouts,
  markPayoutAsPaid,
  resetMarkPaid
} from '../../features/payments/adminPayoutsSlice';
import { 
  FaCheckCircle, 
  FaSync, 
  FaWallet, 
  FaEye, 
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';

const AdminPaymentRequests = () => {
  const dispatch = useDispatch();
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get data from Redux store
  const { 
    pendingPayouts: { items: payouts, count, loading, error },
    markPaid: { loading: markLoading, success: markSuccess, error: markError }
  } = useSelector((state) => state.adminPayouts);

  // Fetch pending payouts on component mount
  useEffect(() => {
    dispatch(getPendingPayouts({ status: 'requested' }));
  }, [dispatch]);

  // Handle success and error messages
  useEffect(() => {
    if (markSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      dispatch(resetMarkPaid());
    }
    
    if (markError) {
      setErrorMessage(markError);
      setTimeout(() => setErrorMessage(''), 3000);
    }
    
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }, [markSuccess, markError, error, dispatch]);

  const handleMarkAsPaid = (payout) => {
    setSelectedPayout(payout);
    setShowConfirm(true);
  };

  const confirmMarkAsPaid = () => {
    if (selectedPayout) {
      dispatch(markPayoutAsPaid(selectedPayout._id));
      setShowConfirm(false);
      setSelectedPayout(null);
    }
  };

  const handleRefresh = () => {
    dispatch(getPendingPayouts({ status: 'requested' }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      
      {/* Success Alert */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-900/90 border border-green-700 text-green-100 px-4 py-3 rounded-lg shadow-lg flex items-center backdrop-blur-sm">
            <FaCheckCircle className="mr-2 text-green-300" />
            <span className="font-medium">Payout marked as paid successfully!</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-900/90 border border-red-700 text-red-100 px-4 py-3 rounded-lg shadow-lg flex items-center backdrop-blur-sm">
            <FaExclamationTriangle className="mr-2 text-red-300" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-800/50">
              <FaWallet className="text-2xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Payment Requests</h1>
              <p className="text-gray-400">Manage and process artist payout requests</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-white"
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''} text-blue-400`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-8 text-white shadow-xl border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Pending Requests</h2>
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold text-white">{count}</span>
              <span className="text-gray-400">requests</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-300 text-sm font-medium border border-yellow-800/50">
              Action Required
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading payout requests...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !payouts.length && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center backdrop-blur-sm">
          <FaExclamationTriangle className="text-3xl text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to load payouts</h3>
          <p className="text-red-400/80 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-800/30 transition-colors border border-red-800/50"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && payouts.length === 0 && (
        <div className="bg-gray-800/50 rounded-xl shadow-lg p-8 text-center border border-gray-700 backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4 border border-green-800/50">
            <FaCheckCircle className="text-2xl text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
          <p className="text-gray-400 mb-6">All payout requests have been processed</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Check for New Requests
          </button>
        </div>
      )}

      {/* Payouts Table */}
      {!loading && payouts.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-700 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Artist Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-gray-800/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-800/50">
                          <FaUser className="text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {payout.artistId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <FaEnvelope className="mr-1 text-xs" />
                            {payout.artistId?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-lg font-semibold text-white">
                        $
                        {payout.amount ? payout.amount.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <FaCalendarAlt className="mr-2 text-blue-400" />
                        {formatDate(payout.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-800/50">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkAsPaid(payout)}
                          disabled={markLoading}
                          className="flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
                        >
                          {markLoading && selectedPayout?._id === payout._id ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaCheckCircle className="mr-2" />
                          )}
                          Mark as Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer with count */}
          <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{payouts.length}</span> of{' '}
                <span className="font-medium text-white">{count}</span> requests
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && selectedPayout && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Confirm Payment</h3>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedPayout(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-gray-400 mb-6">
              Are you sure you want to mark this payout as paid? This action cannot be undone.
            </p>
            
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Artist:</span>
                <span className="font-medium text-white">{selectedPayout.artistId?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount:</span>
                <span className="font-bold text-lg text-green-400">
                  ₹{selectedPayout.amount ? selectedPayout.amount.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedPayout(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsPaid}
                disabled={markLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {markLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add fade-in animation to CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPaymentRequests;