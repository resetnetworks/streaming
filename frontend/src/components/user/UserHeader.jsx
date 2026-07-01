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
import { forceLogout } from "../../utills/axiosInstance";
import { useMyWorkspaces } from "../../hooks/api/useWorkspace";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationsRead,
} from "../../hooks/api/useNotifications";

const UserHeader = () => {
  const queryClient = useQueryClient();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: workspaces = [] } = useMyWorkspaces({
    enabled: !!isAuthenticated,
  });

  // Notification Hooks
  const { data: countData } = useUnreadNotificationCount({
    enabled: !!isAuthenticated,
  });
  const { data: listData, isLoading: notificationsLoading } = useNotifications(20, {
    enabled: !!isAuthenticated && notificationsOpen,
  });
  const { mutate: markAllRead } = useMarkNotificationsRead();

  const unreadCount = countData?.count || 0;
  const notifications = listData?.notifications || [];

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

  useEffect(() => {
    if (isAuthenticated) {
      // Invalidate notifications with a slight delay to capture SQS Lambda execution on login/signup
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, queryClient]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    else if (hour < 18) return "Good afternoon";
    else return "Good evening";
  };

  const handleLogout = async () => {
    setOpen(false);
    queryClient.resetQueries(); // Reset and refetch React Query cache on logout to refresh public data
    await forceLogout()
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
  };

  const handleNotificationClick = () => {
    setNotificationsOpen((prev) => !prev);
    if (!notificationsOpen && unreadCount > 0) {
      markAllRead();
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
            >
              <FiBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Notification Modal */}
        {notificationsOpen && isAuthenticated && (
          <div className="notification-modal-container absolute top-16 right-4 w-80 bg-gradient-to-b from-black to-blue-950/95 rounded-2xl border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md z-50 max-h-96 overflow-hidden flex flex-col font-['Jura']">
            <div className="p-4 border-b border-blue-500/25 flex justify-between items-center bg-black/40">
              <h3 className="text-sm font-bold text-white tracking-wider">Notifications</h3>
              <div className="flex items-center gap-2.5">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-[11px] text-[#4DB3FF] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 divide-y divide-blue-900/20">
              {notificationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4DB3FF] mx-auto"></div>
                  <p className="text-gray-500 text-[11px] mt-2">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <FiBell className="text-3xl text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-5 py-3.5 flex flex-col gap-1 transition-all cursor-pointer border-b border-blue-900/10 font-sans ${
                      !n.isRead
                        ? "bg-blue-950/40 hover:bg-blue-900/30 border-l-[3px] border-[#4DB3FF]"
                        : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="text-[13px] font-bold text-white tracking-wide">
                      {n.title}
                    </span>
                    <span className="text-xs text-gray-300 leading-relaxed font-normal">
                      {n.body}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1 font-medium">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))
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