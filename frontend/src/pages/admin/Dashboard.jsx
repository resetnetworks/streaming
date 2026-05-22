import React, { useState } from 'react';
import { useAudience, useExportAudienceCSV } from "../../hooks/api/useAudience";
import { FaDownload, FaSpinner, FaUser } from 'react-icons/fa';

// Filters jinmein days kaam karta hai
const DAYS_SUPPORTED_FILTERS = [
  'active_users',
  'inactive_users',
  'newly_registered_users'
];

const Dashboard = () => {
  const [filter, setFilter] = useState('all_users');
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const showDaysFilter = DAYS_SUPPORTED_FILTERS.includes(filter);

  const { data, isLoading, isError, error } = useAudience({
    filter,
    days: showDaysFilter ? days : undefined,
    page,
    limit,
  });

  const { mutate: exportCSV, isPending: isExporting } = useExportAudienceCSV();

  const handleExport = () => {
    exportCSV({
      filter,
      days: showDaysFilter ? days : undefined
    });
  };

  const users = data?.users || [];
  const totalCount = data?.count || 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 min-h-[500px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Audience Dashboard</h2>

        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          >
            <option value="all_users">All Audience</option>
            <option value="all_artists">All Artists</option>
            <option value="active_users">Active Users</option>
            <option value="inactive_users">Inactive Users</option>
            <option value="newly_registered_users">New Users</option>
            <option value="artist_subscribers">Artist Subscribers</option>
          </select>

          {/* Days filter sirf tab dikhega jab filter support karta ho */}
          {showDaysFilter && (
            <select
              value={days}
              onChange={(e) => { setDays(Number(e.target.value)); setPage(1); }}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
            </select>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {isExporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          Error fetching audience data: {error?.message || 'Unknown error'}
        </div>
      ) : (
        <>

          <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {users.length > 0 ? (
                  users.map((user, idx) => (
                    <tr key={user.id || idx} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center overflow-hidden border border-blue-500/20">
                          {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <FaUser className="text-blue-400 text-xs" />
                          )}
                        </div>
                        <span className="font-medium text-white">{user.name || user.username || 'Unknown User'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'artist' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-300'}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No audience data found for these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">
              Page {page} &nbsp;·&nbsp; Showing {users.length} results
              {users.length === limit ? ' — more available' : ' — last page'}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={users.length < limit}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;