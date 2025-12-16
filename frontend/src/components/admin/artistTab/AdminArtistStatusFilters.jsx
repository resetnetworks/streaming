const AdminArtistStatusFilters = ({ 
  selectedStatus, 
  onStatusFilter, 
  stats, 
  hasFilters, 
  onClearFilters 
}) => {
  const statusFilters = [
    { status: 'all', label: 'All', count: stats.total },
    { status: 'pending', label: 'Pending', count: stats.pending },
    { status: 'approved', label: 'Approved', count: stats.approved },
    { status: 'rejected', label: 'Rejected', count: stats.rejected },
    { status: 'needs_info', label: 'Needs Info', count: stats.needs_info },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {statusFilters.map(({ status, label, count }) => (
        <button
          key={status}
          onClick={() => onStatusFilter(status)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
            selectedStatus === status
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {label}
          <span className={`text-xs px-2 py-1 rounded-full ${
            selectedStatus === status
              ? 'bg-white/20'
              : 'bg-gray-700'
          }`}>
            {count}
          </span>
        </button>
      ))}
      
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors duration-200"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default AdminArtistStatusFilters;