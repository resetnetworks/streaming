import React, { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { PiHeadphonesFill } from "react-icons/pi";
import { IoLogOutOutline } from "react-icons/io5";
import MonetizationModal from "../monetization/MonitizationModal";
import { logoutUser } from "../../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfileHeroSection = () => {
  // Example data - Hardcoded values
  const profile = {
    name: "Alex Johnson",
    image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    isVerified: true,
    artistId: "artist-123",
    monthlyListeners: "31.7k",
    isMonetized: false
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //logout function
  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Background image
  const backgroundImage = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  // State for modals
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Edit handler function - now opens monetization modal
  const handleEditClick = () => {
    setShowMonetizationModal(true);
  };

  // Change password handler
  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
  };

  // Handle monetization setup completion
  const handleMonetizationComplete = () => {
    setShowMonetizationModal(false);
    // You can update the profile state here to show monetized status
  };

  return (
    <>
      <div className="relative h-[16rem] sm:h-[20rem] md:h-[22rem] w-full">
        {/* Background Image with Overlay */}
        <img
          src={backgroundImage}
          className="w-full h-full object-cover opacity-80"
          alt="Profile Background"
        />
        
        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
        
        {/* Middle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-black/70 to-transparent z-20" />
        
        {/* Slim Bottom Gradient Border */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-30"></div>
        
        {/* Edit Icon Button - Top Right - Now for Monetization */}
        <button 
          onClick={handleEditClick}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center bg-gradient-to-tl from-black to-gray-500 justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200 group"
          title="Setup Monetization"
        >
          <FiEdit3 className="text-lg sm:text-xl" />
          {/* Tooltip */}
          <div className="absolute top-full mt-2 right-0 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Setup Monetization
          </div>
        </button>
        
        {/* Profile Content */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white">
          {/* Left Side: Profile Image and Name */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-0">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_10px_2px_#3b82f6]"
              />
              {/* Monetization Badge if already monetized */}
              {profile.isMonetized && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <span className="text-[10px]">💎 Monetized</span>
                </div>
              )}
            </div>
            
            {/* Profile Details */}
            <div>
              {/* Artist Label and Verified Badge */}
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <span className="text-xs sm:text-sm">artist</span>
                <img src="/Verified.svg" alt="verified badge" className="w-4 h-4 sm:w-5 sm:h-5" />
                {!profile.isMonetized && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                    Not Monetized
                  </span>
                )}
              </div>
              
              {/* Profile Name */}
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold">
                {profile.name}
              </h1>
              
              {/* Monthly Listeners */}
              <div className="flex items-center gap-1 mt-1 sm:mt-2 text-gray-200">
                <PiHeadphonesFill size={16} className="sm:w-5 sm:h-5"/>
                <span className="text-sm sm:text-base md:text-lg ml-1 sm:ml-2 font-light">
                  {profile.monthlyListeners} monthly listeners
                </span>
              </div>

              {/* Monetization CTA */}
              {!profile.isMonetized && (
                <button
                  onClick={() => setShowMonetizationModal(true)}
                  className="mt-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg flex items-center gap-2"
                >
                  <span>💰 Start Earning Money</span>
                  <FiEdit3 className="text-sm" />
                </button>
              )}
            </div>
          </div>
          
          {/* Right Side: Logout Button and Change Password */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-8 w-full sm:w-auto">
            {/* Change Password Link - Hidden on very small screens */}
            <div className="sm:block hidden">
              <button
                onClick={handleChangePasswordClick}
                className="text-gray-300 text-sm sm:text-base md:text-lg hover:text-white transition-colors duration-200 relative group"
              >
                change password
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>

            {/* Logout Button - Simplified Blue */}
            <button 
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <span>Logout</span>
              <IoLogOutOutline className="text-base sm:text-lg" />
            </button>

            {/* Change Password Link - Show on small screens only (below sm) */}
            <div className="sm:hidden block w-full">
              <button
                onClick={handleChangePasswordClick}
                className="text-gray-300 text-sm hover:text-white transition-colors duration-200 w-full text-center py-2"
              >
                change password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monetization Modal */}
      <MonetizationModal
        isOpen={showMonetizationModal}
        onClose={() => setShowMonetizationModal(false)}
        onComplete={handleMonetizationComplete}
      />

      {/* Password Change Modal (Minimal) */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  alert("Password change functionality to be implemented");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileHeroSection;