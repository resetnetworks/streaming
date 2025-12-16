import { FaSearch, FaSync } from 'react-icons/fa';

const AdminArtistHeader = ({ searchTerm, setSearchTerm, onRefresh, loading }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Artist Applications</h1>
        <p className="text-gray-400">Manage and review artist applications</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={onRefresh}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          disabled={loading}
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default AdminArtistHeader;