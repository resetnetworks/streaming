import { useState } from 'react';
import { HiMenuAlt2, HiX } from 'react-icons/hi';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Mobile sidebar button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX size={24} /> : <HiMenuAlt2 size={24} />}
      </button>

      
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transform fixed md:static inset-y-0 left-0 w-64 bg-gray-800 transition-transform duration-200 ease-in-out z-40`}
      >
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <AdminHeader activeTab={activeTab} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;