// src/components/admin/analytics/AdminAudienceDirectory.jsx
import React, { useState } from "react";
import { useAudience, useExportAudienceCSV } from "../../../hooks/api/useAudience";
import { FaDownload, FaSpinner, FaUser } from "react-icons/fa";

const DAYS_SUPPORTED_FILTERS = [
  "active_users",
  "inactive_users",
  "newly_registered_users",
];

const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

export const AdminAudienceDirectory = () => {
  const [filter, setFilter] = useState("all_users");
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
      days: showDaysFilter ? days : undefined,
    });
  };

  const users = data?.users || [];

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md w-full">
      <div className="rounded-2xl p-5 md:p-6" style={innerPanel3dStyle}>
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Audience Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter, search, and export platform audience lists</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#060911] text-white border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-[#0459FE] transition-colors cursor-pointer"
            >
              <option value="all_users">All Audience</option>
              <option value="all_artists">All Artists</option>
              <option value="active_users">Active Users</option>
              <option value="inactive_users">Inactive Users</option>
              <option value="newly_registered_users">New Users</option>
              <option value="artist_subscribers">Artist Subscribers</option>
            </select>

            {showDaysFilter && (
              <select
                value={days}
                onChange={(e) => {
                  setDays(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#060911] text-white border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-[#0459FE] transition-colors cursor-pointer"
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
              className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md"
              style={{
                background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)",
              }}
            >
              {isExporting ? <FaSpinner className="animate-spin text-sm" /> : <FaDownload className="text-sm" />}
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-[#38bdf8] text-3xl" />
          </div>
        ) : isError ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
            Error fetching audience data: {error?.message || "Unknown error"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-black/30 border-b border-white/5 uppercase text-xs text-slate-400 font-semibold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <tr key={user.id || idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center overflow-hidden border border-blue-500/20 shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <FaUser className="text-[#38bdf8] text-xs" />
                            )}
                          </div>
                          <span className="font-medium text-white">{user.name || user.username || "Unknown User"}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{user.email || "N/A"}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              user.role === "artist"
                                ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                                : "bg-white/5 text-slate-300 border border-white/10"
                            }`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">
                        No audience data found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-5 text-xs text-slate-400">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span>
                Page {page} &nbsp;·&nbsp; Showing {users.length} results
                {users.length === limit ? " — more available" : " — last page"}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < limit}
                className="px-3.5 py-1.5 rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAudienceDirectory;

