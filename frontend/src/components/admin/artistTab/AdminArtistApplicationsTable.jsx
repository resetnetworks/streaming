// src/components/admin/artistTab/AdminArtistApplicationsTable.jsx
import { FaEye, FaEdit, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaFileAlt } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const AdminArtistApplicationsTable = ({
  applications,
  pagination,
  loading,
  searchTerm,
  onViewDetails,
  onOpenStatusModal,
  onPageChange,
  onClearSearch
}) => {
  
  const columns = ['ID', 'Stage Name', 'User', 'Status', 'Applied On', 'Last Updated', 'Actions'];

  if (loading && applications.length === 0) {
    return (
      <div className="p-6">
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="space-y-4">
            <Skeleton height={40} />
            <Skeleton height={60} count={5} />
          </div>
        </SkeletonTheme>
      </div>
    );
  }

  // Get serial number based on backend pagination
  const getSerialNumber = (index) => {
    return ((pagination.page - 1) * pagination.limit) + index + 1;
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    if (pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page if not already visible
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors duration-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-4 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            pagination.page === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page if not already visible
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-4 py-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => onPageChange(pagination.totalPages)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors duration-200"
        >
          {pagination.totalPages}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            Applications ({pagination.total || applications.length})
          </h3>
          {searchTerm && (
            <p className="text-gray-400 text-sm">
              Search results for "{searchTerm}"
              <button
                onClick={onClearSearch}
                className="ml-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Clear
              </button>
            </p>
          )}
        </div>
        {pagination.total > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/30">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FaFileAlt className="text-4xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No applications found</p>
                    <p className="text-sm mb-4">
                      {searchTerm ? 'Try changing your search criteria' : 'No artist applications have been submitted yet'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={onClearSearch}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((app, index) => {
                const isApproved = app.status === 'approved';
                const isPending = app.status === 'pending';
                
                return (
                  <tr key={app._id || app.id} className="hover:bg-gray-800/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                      #{getSerialNumber(index)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-white font-medium">{app.stageName || 'N/A'}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {app.country ? `Country: ${app.country}` : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-white">{app.user?.name || app.legalName || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(app.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {/* View Button - Always enabled */}
                        <button
                          onClick={() => onViewDetails(app)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                          title="View application details"
                        >
                          <FaEye /> View
                        </button>
                        
                        {/* Status Button - Disabled if approved */}
                        <button
                          onClick={() => {
                            if (!isApproved) {
                              onOpenStatusModal(app);
                            }
                          }}
                          disabled={isApproved}
                          className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-colors duration-200 ${
                            isApproved
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                          title={isApproved ? "Cannot change status of approved application" : "Update application status"}
                        >
                          <FaEdit /> Status
                        </button>
                        
                        {/* Quick Action Buttons - Only show for pending applications */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => onOpenStatusModal({ ...app, status: 'approved' })}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                              title="Approve this application"
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              onClick={() => onOpenStatusModal({ ...app, status: 'rejected' })}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                              title="Reject this application"
                            >
                              <FaTimesCircle /> Reject
                            </button>
                            <button
                              onClick={() => onOpenStatusModal({ ...app, status: 'needs_info' })}
                              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                              title="Request more information"
                            >
                              <FaInfoCircle /> More Info
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} total entries
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              First
            </button>
            
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {renderPaginationButtons()}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              Next
            </button>
            
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArtistApplicationsTable;