// src/components/UserHeader.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiSettings,
  FiHelpCircle,
  FiClock,
  FiCreditCard,
  FiLogOut,
} from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast } from "sonner";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { logoutUser } from "../features/auth/authSlice";

const UserHeader = () => {
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    else if (hour < 18) return "Good afternoon";
    else return "Good evening";
  };

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="w-full flex justify-between items-center px-4 py-4 relative">
      {isHomePage ? (
        <h1 className="md:text-3xl text-xl">
          {getTimeBasedGreeting()},{" "}
          <span className="text-blue-700">{user ? user.name : "Guest"}</span>
        </h1>
      ) : (
        <div
          className="flex items-center cursor-pointer text-white hover:text-blue-800"
          onClick={() => navigate(-1)}
        >
          <IoChevronBackOutline className="text-2xl mr-2 " />
        </div>
      )}

      {user.role === "admin" ? (
        <div
          className="button-wrapper shadow-md shadow-gray-800"
          onClick={() => navigate("/admin")}
        >
          <button className="player-button">Admin</button>
        </div>
      ) : (
        <div className="relative">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070"
              alt="user profile"
              className="md:w-8 md:h-8 w-6 h-6 rounded-full object-cover"
            />
            <p className="md:ml-3 ml-2 md:text-sm text-sm">
              {user ? user.name : "Guest"}
            </p>
            {open ? (
              <FiChevronUp className="md:text-sm text-xs md:ml-3 ml-2 text-gray-500" />
            ) : (
              <FiChevronDown className="md:text-sm text-xs md:ml-3 ml-2 text-gray-500" />
            )}
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-52 bg-image rounded-xl border border-blue-500 shadow-[0_0_8px_1px_#3b82f6] z-50">
              <ul className="py-2 text-sm text-gray-400">
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-blue-500"
                  onClick={() => {
                    setOpen(false);
                    navigate("/subscription");
                  }}
                >
                  <FiCreditCard />
                  Manage Subscription
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-blue-500"
                  onClick={() => {
                    setOpen(false);
                    navigate("/history");
                  }}
                >
                  <FiClock />
                  History
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-blue-500"
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                >
                  <FiSettings />
                  Settings
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-blue-500"
                  onClick={() => {
                    setOpen(false);
                    navigate("/help");
                  }}
                >
                  <FiHelpCircle />
                  Help & Support
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
      )}
    </div>
  );
};

export default UserHeader;
