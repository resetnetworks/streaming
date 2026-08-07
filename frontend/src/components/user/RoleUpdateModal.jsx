import React from "react";
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setRoleUpdateModal } from "../../features/auth/authSlice";
import { selectRoleUpdateModalOpen, selectIsAuthenticated } from "../../features/auth/authSelectors";

const RoleUpdateModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector(selectRoleUpdateModalOpen); // ✅ Redux se lo
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!open || !isAuthenticated) return null;

  const handleGoToDashboard = () => {
    dispatch(setRoleUpdateModal(false));
    // Hard refresh and go to dashboard
    window.location.href = "/artist/dashboard";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm mx-4">
        <div className="player-wrapper">
          <div className="player-card rounded-2xl p-8 flex flex-col items-center gap-6 animate-scaleIn">

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0d1b3f] to-[#020216] rounded-full flex items-center justify-center shadow-2xl border border-green-500/30">
                <FaCheckCircle className="text-3xl text-green-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-20"></div>
            </div>

            <div className="px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full text-xs font-medium text-white flex items-center space-x-2">
              <FaCheckCircle className="text-sm" />
              <span style={{ fontFamily: 'Jura' }}>Role Updated</span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Jura' }}>
                Congratulations!
              </h2>
            </div>

            <div className="text-center space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: 'Jura' }}>
                You have successfully become an artist!
              </p>
              <p className="text-gray-400 text-xs leading-relaxed" style={{ fontFamily: 'Jura' }}>
                Your session is automatically updated. Click below to enter your dashboard.
              </p>
            </div>

            <div className="w-full">
              <button
                className="w-full py-3 px-4 bg-transparent border border-green-500/60 hover:border-green-500 rounded-lg text-white transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2"
                onClick={handleGoToDashboard}
                style={{ fontFamily: 'Jura' }}
              >
                <span>Setup Your Dashboard</span>
                <FaArrowRight className="text-sm ml-2" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleUpdateModal;