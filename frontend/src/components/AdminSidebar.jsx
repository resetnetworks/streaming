import { FaChartLine, FaUserAlt, FaCompactDisc, FaMusic, FaCog, FaSignOutAlt } from 'react-icons/fa';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed md:static inset-y-0 left-0 w-64 bg-gray-800 z-40">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <h1 className="text-xl font-bold text-blue-400">Admin</h1>
      </div>
      <nav className="px-4 py-6 h-[calc(100%-8rem)] overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FaChartLine className="mr-3" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('artists')}
              className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'artists' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FaUserAlt className="mr-3" />
              Artists
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('albums')}
              className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'albums' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FaCompactDisc className="mr-3" />
              Albums
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('songs')}
              className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'songs' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FaMusic className="mr-3" />
              Songs
            </button>
          </li>
          <li className="pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FaCog className="mr-3" />
              Settings
            </button>
          </li>
        </ul>
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900">
        <button className="flex items-center w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700">
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;