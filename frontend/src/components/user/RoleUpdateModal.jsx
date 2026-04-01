import React from "react";
import { FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../features/auth/authSlice";
import { forceLogout } from "../../utills/axiosInstance";

const RoleUpdateModal = ({ open }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!open) return null;

const handleLogout = async () => {
  try {
    await forceLogout();   // wait for API / cookie clear
    dispatch(logoutUser()); 
    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Logout failed:", error);
    navigate("/login", { replace: true }); // fallback
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm mx-4">
        <div className="player-wrapper">
          <div className="player-card rounded-2xl p-8 flex flex-col items-center gap-6 animate-scaleIn">
            
            {/* No close button – user must logout */}

            {/* Icon */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0d1b3f] to-[#020216] rounded-full flex items-center justify-center shadow-2xl border border-[#88b2ef]/30">
                <FaExclamationTriangle className="text-3xl text-yellow-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500 animate-ping opacity-20"></div>
            </div>

            {/* Badge */}
            <div className="px-4 py-1 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full text-xs font-medium text-white flex items-center space-x-2">
              <FaExclamationTriangle className="text-sm" />
              <span style={{ fontFamily: 'Jura' }}>Role Updated</span>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Jura' }}>
                Your Role Has Been Updated
              </h2>
            </div>

            {/* Description */}
            <div className="text-center space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: 'Jura' }}>
                Please log out and log back in to continue using the platform with your updated permissions.
              </p>
            </div>

            {/* Logout Button */}
            <div className="w-full">
              <button
                className="w-full py-3 px-4 bg-transparent border border-yellow-500/60 hover:border-yellow-500 rounded-lg text-white transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2"
                onClick={handleLogout}
                style={{ fontFamily: 'Jura' }}
              >
                <FaSignOutAlt className="text-sm" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleUpdateModal;