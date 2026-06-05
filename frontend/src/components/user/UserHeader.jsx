import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiClock,
  FiLogOut,
  FiBell,
  FiAlertCircle,
  FiGrid
} from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast } from "sonner";

import { selectCurrentUser } from "../../features/auth/authSelectors";
import { logoutUser } from "../../features/auth/authSlice";
import { getAvatarColor } from "../../utills/helperFunctions";
import { getMyArtistApplication } from "../../features/artistApplications/artistApplicationSlice";
import { forceLogout } from "../../utills/axiosInstance";
import { useMyWorkspaces } from "../../hooks/api/useWorkspace";

const UserHeader = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { myApplication, fetchLoading } = useSelector(
    (state) => state.artistApplication
  );

  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: workspaces = [] } = useMyWorkspaces({
    enabled: !!isAuthenticated,
  });

  const isHomePage = location.pathname === "/home";
  const hasArtistPendingRole = user?.role === "artist-pending";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.user-menu-container')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleNotificationClickOutside = (event) => {
      if (notificationsOpen && !event.target.closest('.notification-modal-container')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleNotificationClickOutside);
    return () => document.removeEventListener('mousedown', handleNotificationClickOutside);
  }, [notificationsOpen]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    else if (hour < 18) return "Good afternoon";
    else return "Good evening";
  };

  const handleLogout = async () => {
    setOpen(false);
    await forceLogout()
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
  };

  const handleNotificationClick = async () => {
    setNotificationsOpen(true);
    if (isAuthenticated && !myApplication) {
      try {
        await dispatch(getMyArtistApplication()).unwrap();
      } catch (error) {
        console.error("Failed to fetch artist application:", error);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleWorkspaceDashboardClick = () => {
    if (!workspaces || workspaces.length === 0) return;

    if (workspaces.length === 1) {
      const ws = workspaces[0];
      localStorage.setItem("activeWorkspaceId", ws.workspaceId);
      toast.success(`Entering workspace: ${ws.name}`);
      navigate("/artist/dashboard");
      if (window.location.pathname === "/artist/dashboard") {
        window.location.reload();
      }
    } else {
      setWorkspaceModalOpen(true);
    }
  };

  const renderUserMenu = () => {
    // ✅ Guest user - Login button
    if (!isAuthenticated) {
      return (
        <div
          className="button-wrapper shadow-md shadow-gray-800 user-menu-container"
          onClick={() => navigate("/login")}
        >
          <button className="player-button flex justify-center items-center gap-2">
            Sign in
          </button>
        </div>
      );
    }

    if (user?.role === "admin") {
      return (
        <div
          className="button-wrapper shadow-md shadow-gray-800 user-menu-container"
          onClick={() => navigate("/admin")}
        >
          <button className="player-button">Admin</button>
        </div>
      );
    } else if (user?.role === "artist") {
      return (
        <div
          className="button-wrapper shadow-md shadow-gray-800 user-menu-container"
          onClick={() => navigate("/artist/dashboard")}
        >
          <button className="player-button">
            Dashboard
          </button>
        </div>
      );
    } else {
      return (
        <div className="relative user-menu-container">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
          >
            <div
              className={`md:w-8 md:h-8 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase ${getAvatarColor(user?.name)}`}
            >
              {user?.name?.charAt(0) || "G"}
            </div>
            <p className="md:ml-3 ml-2 md:text-sm text-white sm:inline-block hidden text-sm">
              {user?.name}
            </p>
            {open ? (
              <FiChevronUp className="md:text-sm text-xs md:ml-3 ml-2 text-gray-500" />
            ) : (
              <FiChevronDown className="md:text-sm text-xs md:ml-3 ml-2 text-gray-500" />
            )}
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-52 bg-gradient-to-b from-black to-blue-900 rounded-xl border border-blue-500 shadow-[0_0_8px_1px_#3b82f6] z-40">
              <ul className="py-2 text-sm text-gray-400">
                {workspaces.length > 0 && (
                  <li
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors hover:text-[#4DB3FF] border-b border-blue-900/30"
                    onClick={() => {
                      setOpen(false);
                      handleWorkspaceDashboardClick();
                    }}
                  >
                    <FiGrid />
                    Collaborator
                  </li>
                )}
                <li
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors ${isActive("/payment-history") ? "" : ""}`}
                  style={{ color: isActive("/payment-history") ? '#4DB3FF' : undefined }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4DB3FF'}
                  onMouseLeave={e => e.currentTarget.style.color = ''}
                  onClick={() => { setOpen(false); navigate("/payment-history"); }}
                >
                  <FiClock />
                  Payment History
                </li>
                <li
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors`}
                  onMouseEnter={e => e.currentTarget.style.color = '#4DB3FF'}
                  onMouseLeave={e => e.currentTarget.style.color = ''}
                  onClick={() => { setOpen(false); navigate("/contact-us"); }}
                >
                  <FiHelpCircle />
                  Help & Support
                </li>
                <li
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-yellow-400 ${isActive("/report-issue") ? "text-yellow-400" : ""}`}
                  onClick={() => { setOpen(false); navigate("/report-issue"); }}
                >
                  <FiAlertCircle />
                  Report Issue
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-red-500"
                  onClick={handleLogout}
                >
                  <FiLogOut />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="w-full flex justify-between items-center px-4 py-4 relative">
      {isHomePage ? (
        <h1 className="md:text-3xl text-xl text-white">
          {getTimeBasedGreeting()},{" "}
          <span style={{ color: '#4DB3FF' }}>
            {user ? user.name : "Guest"}
          </span>
        </h1>
      ) : (
        <div
          className="flex items-center cursor-pointer text-white"
          style={{}}
          onClick={() => navigate(-1)}
        >
          <IoChevronBackOutline className="text-2xl mr-2" />
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Notification Bell - sirf authenticated users ke liye */}
        {isAuthenticated && (
          <div className="relative">
            <button
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              onClick={handleNotificationClick}
              disabled={fetchLoading}
            >
              <FiBell className="text-xl" />
              {hasArtistPendingRole && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-2 h-2 animate-pulse"></span>
              )}
              {fetchLoading && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-2 h-2 animate-pulse"></span>
              )}
            </button>
          </div>
        )}

        {/* Notification Modal */}
        {notificationsOpen && isAuthenticated && (
          <div className="notification-modal-container absolute top-16 right-4 w-80 bg-gradient-to-b from-black to-gray-900 rounded-lg border border-blue-500 shadow-xl z-50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Application Status</h3>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {fetchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading...</p>
                </div>
              ) : myApplication?.adminNotes ? (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Admin Notes:</h4>
                  <p className="text-gray-300 text-sm">{myApplication.adminNotes}</p>
                  {myApplication.status && (
                    <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${myApplication.status === 'approved'
                      ? 'bg-green-900 text-green-300'
                      : myApplication.status === 'rejected'
                        ? 'bg-red-900 text-red-300'
                        : 'bg-yellow-900 text-yellow-300'
                      }`}>
                      Status: {myApplication.status}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiBell className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No application notes available</p>
                  {hasArtistPendingRole && (
                    <p className="text-yellow-400 text-sm mt-2">
                      Your application is under review. You'll get updates here.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {renderUserMenu()}
      </div>

      {/* Workspace Selection Modal */}
      {workspaceModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-[#0A0A23] to-[#020216] border border-[#4DB3FF]/30 p-6 rounded-2xl w-full max-w-md shadow-[0_0_15px_rgba(77,179,255,0.2)] mx-4 font-['Jura']">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-wider">Select Workspace</h2>
              <button
                onClick={() => setWorkspaceModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Select an artist workspace to access their collaborator dashboard:
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {workspaces.map((ws) => (
                <div
                  key={ws.workspaceId}
                  onClick={() => {
                    localStorage.setItem("activeWorkspaceId", ws.workspaceId);
                    setWorkspaceModalOpen(false);
                    toast.success(`Entering workspace: ${ws.name}`);
                    navigate("/artist/dashboard");
                    if (window.location.pathname === "/artist/dashboard") {
                      window.location.reload();
                    }
                  }}
                  className="p-4 rounded-xl border border-gray-800 hover:border-[#4DB3FF]/50 bg-black/40 hover:bg-[#4DB3FF]/5 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-[#4DB3FF] transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      Role: {ws.role}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded bg-black/60 capitalize">
                    {ws.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHeader;