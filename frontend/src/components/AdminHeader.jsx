const AdminHeader = ({ activeTab }) => {
  return (
    <header className="bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <h2 className="text-xl font-semibold capitalize">
          {activeTab === 'dashboard' ? 'Overview' : activeTab}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 text-white px-4 py-2 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="font-medium">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;