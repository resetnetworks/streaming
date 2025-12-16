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

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            Applications ({applications.length})
          </h3>
          {searchTerm && (
            <p className="text-gray-400 text-sm">
              Search results for "{searchTerm}"
              <button
                onClick={onClearSearch}
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                Clear
              </button>
            </p>
          )}
        </div>
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
                const appliedDate = new Date(app.createdAt);
                const updatedDate = new Date(app.updatedAt);
                
                return (
                  <tr key={app.id} className="hover:bg-gray-800/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                      #{((pagination.page - 1) * pagination.limit) + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-white font-medium">{app.stageName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-white">{app?.legalName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {appliedDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {updatedDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {/* View Button - Always enabled */}
                        <button
                          onClick={() => {
                            onViewDetails(app);
                          }}
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
                        
                        {/* Quick Action Buttons - Only show for pending applications that are NOT approved */}
                        {app.status === 'pending' && !isApproved && (
                          <>
                            <button
                              onClick={() => {
                                onOpenStatusModal({ ...app, status: 'approved' });
                              }}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                              title="Approve this application"
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              onClick={() => {
                                onOpenStatusModal({ ...app, status: 'rejected' });
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                              title="Reject this application"
                            >
                              <FaTimesCircle /> Reject
                            </button>
                            <button
                              onClick={() => {
                                onOpenStatusModal({ ...app, status: 'needs_info' });
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors duration-200"
                              title="Request more information"
                            >
                              <FaInfoCircle /> More Info
                            </button>
                          </>
                        )}
                        
                        {/* No quick action buttons shown for approved applications */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
              const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
              
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
              
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
              
              return pages;
            })()}
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArtistApplicationsTable;