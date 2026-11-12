import React from "react";
import IconHeader from "../../user/IconHeader";
import MobileNavBar from "../../user/MobileNavBar";
import { FaChartLine, FaRegUserCircle, FaBars, FaTimes, FaWallet, FaUsers, FaAd, FaGift } from "react-icons/fa";
import { FiMusic } from "react-icons/fi";
import { useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoLogOutOutline } from "react-icons/io5";
import { logoutUser } from "../../../features/auth/authSlice";
import { forceLogout } from "../../../utills/axiosInstance";
import { useArtistProfile } from "../../../hooks/api/useArtists";
import { useMyWorkspaces } from "../../../hooks/api/useWorkspace";

const menuItems = [
  { name: "profile", icon: <FaRegUserCircle size={20} /> },
  { name: "uploads", icon: <FiMusic size={20} strokeWidth={1.5} />, permission: "uploadSong" },
  { name: "revenue", icon: <FaWallet size={20} />, permission: "viewPayments" },
  { name: "dashboard", icon: <RxDashboard size={20} />, permission: "viewAnalytics" },
  { name: "adverts", icon: <FaAd size={20} />, permission: "viewAnalytics" },
  { name: "referrals", label: "Referral Program", icon: <FaGift size={20} /> },
  { name: "team", icon: <FaUsers size={20} />, permission: "manageTeam" },
  // { name: "insights", icon: <FaChartLine size={18} /> },
];

const Sidebar = ({ selectedTab, setSelectedTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      if (queryClient) {
        queryClient.clear();
      }
      await forceLogout();
      await dispatch(logoutUser());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  const { data: workspaces = [] } = useMyWorkspaces();
  const activeWorkspace = React.useMemo(() => {
    if (!workspaces || workspaces.length === 0) return null;
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("activeWorkspaceId");
      const matched = workspaces.find((w) => w.workspaceId === savedId);
      if (matched) return matched;
    }
    return workspaces[0];
  }, [workspaces]);
  const permissions = activeWorkspace?.permissions || {};
  const currentRole = activeWorkspace?.role;

  const hasPermission = (permission) => {
    if (currentRole === "owner") return true;
    return permissions[permission] === true;
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { data: artistProfile } = useArtistProfile(activeWorkspace?.workspaceId);
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
                  {filteredMenuItems.map((item) => (
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
                        {item.label || item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Profile & Logout Section for Mobile */}
              <div className="p-4 border-t border-gray-700/60 w-full mt-auto flex-shrink-0 flex flex-col gap-3">
                <div 
                  className="flex items-center gap-3 px-1 cursor-pointer"
                  onClick={() => handleMenuItemClick("profile")}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden flex-shrink-0">
                    <img 
                      src={imageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-white text-sm font-medium tracking-wide truncate hover:text-blue-400 transition-colors">
                    {artistName}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-[0.2rem] text-sm font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-red-500 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <IoLogOutOutline className="text-lg" />
                  <span>Logout</span>
                </button>
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
      className="w-72 bg-[#222126B2] flex flex-col justify-between border-r border-gray-700/60 h-screen sticky top-0 flex-shrink-0 select-none"
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        <IconHeader />
        <div className="w-full mt-6">
          {filteredMenuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedTab(item.name)}
              className={`flex items-center gap-4 px-5 py-2.5 mb-2 w-full transition-all focus:outline-none cursor-pointer ${
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
                {item.label || item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout button fixed at bottom of Sidebar */}
      <div className="p-4 border-t border-gray-700/60 w-full mt-auto flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-[0.2rem] text-sm font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-red-500 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <IoLogOutOutline className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;