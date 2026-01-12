import React from "react";
import IconHeader from "../../user/IconHeader";
import MobileNavBar from "../../user/MobileNavBar";
import { FaChartLine, FaRegUserCircle, FaBars, FaTimes, FaWallet } from "react-icons/fa";
import { FiMusic } from "react-icons/fi";
import { useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtistProfile } from "../../../features/artists/artistsSlice";

const menuItems = [
  { name: "profile", icon: <FaRegUserCircle size={20} /> },
  { name: "uploads", icon: <FiMusic size={20} strokeWidth={1.5} /> },
  { name: "dashboard", icon: <RxDashboard size={20} /> },
  { name: "revenue", icon: <FaWallet size={20} /> },
  // { name: "insights", icon: <FaChartLine size={18} /> },
];

const Sidebar = ({ selectedTab, setSelectedTab, currentUploadPage }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchArtistProfile());
  }, [dispatch]);
  
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { artistProfile, profileLoading } = useSelector((state) => state.artists);
  const imageUrl = artistProfile?.profileImage;
  const artistName = artistProfile?.name;

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle menu item click
  const handleMenuItemClick = (itemName) => {
    // Always call setSelectedTab - parent will handle upload cancellation
    setSelectedTab(itemName);
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const hamburger = document.getElementById('hamburger-btn');
        if (sidebar && !sidebar.contains(event.target) && 
            hamburger && !hamburger.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  if (isMobile) {
    return (
      <>
        {/* Mobile Hamburger Button */}
        <button
          id="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#222126] rounded-md text-white shadow-lg"
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] md:hidden">
            <aside 
              id="sidebar"
              className="w-64 bg-[#222126] flex flex-col justify-between pb-4 min-h-screen transform transition-transform duration-300 ease-in-out"
            >
              <div>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                  <div></div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="w-full mt-6">
                  {menuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleMenuItemClick(item.name)}
                      className={`flex items-center gap-4 px-5 py-3 mb-2 w-full transition-all focus:outline-none cursor-pointer ${
                        selectedTab === item.name
                          ? "bg-gradient-to-r from-[#0950D7] via-[#4197C8] to-[#0950D7] text-white shadow-lg border-r-4 border-blue-900"
                          : "hover:bg-gray-800 text-gray-400"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${
                        selectedTab === item.name ? 'text-white' : 'text-gray-300'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium flex-1 text-left capitalize">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Clickable Profile Section for Mobile */}
              <div 
                className="flex flex-col items-center mb-40 px-2 cursor-pointer"
                onClick={() => handleMenuItemClick("profile")}
              >
                <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden mb-2 flex-shrink-0">
                  <img 
                    src={imageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-white text-sm tracking-wide text-center max-w-full hover:text-blue-400 transition-colors">
                  {artistName}
                </span>
              </div>
            </aside>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside 
      className="w-48 bg-[#222126B2] flex flex-col justify-between pb-4 border-r border-gray-500 min-h-screen"
      style={{ width: '12rem' }}
    >
      <div>
        <IconHeader />
        <div className="w-full mt-6">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedTab(item.name)}
              className={`flex items-center gap-4 px-5 py-2 mb-2 w-full transition-all focus:outline-none cursor-pointer ${
                selectedTab === item.name
                  ? "bg-gradient-to-r from-[#0950D7] via-[#4197C8] to-[#0950D7] text-white shadow-lg border-r-4 border-blue-900"
                  : "hover:bg-gray-800 text-gray-400"
              }`}
            >
              <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${
                selectedTab === item.name ? 'text-white' : 'text-gray-300'
              }`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium flex-1 text-left capitalize">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Clickable Profile Section for Desktop */}
      <div 
        className="sticky bottom-64 flex flex-col items-center px-2 cursor-pointer group"
        onClick={() => setSelectedTab("profile")}
      >
        <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden mb-2 flex-shrink-0 group-hover:border-blue-400 transition-colors">
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <span className="text-white text-sm tracking-wide text-center max-w-full group-hover:text-blue-400 transition-colors">
          {artistName}
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;