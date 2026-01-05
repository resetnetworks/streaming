// ProfileHeroSection.js - UPDATED VERSION
import React, { useState, useEffect, useRef } from "react";
import { FiEdit3 } from "react-icons/fi";
import { CgRepeat } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { logoutUser } from "../../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProfileEditForm from "./ProfileEditForm";


const ProfileHeroSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get artist profile from Redux state
  const { artistProfile, profileLoading } = useSelector((state) => state.artists);

  // console.log("---artist data---",artistProfile)
  
  // Get monetization status from Redux state
  const { setupStatus } = useSelector((state) => state.monetization);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const profileImageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);


  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Temporarily update UI, actual update will happen via edit form
        toast.success(`${type === 'image' ? 'Profile' : 'Background'} image updated - please save in edit form`);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = (type) => {
    if (type === 'profile') {
      profileImageInputRef.current.click();
    } else {
      backgroundImageInputRef.current.click();
    }
  };

  const handleEditProfileClick = () => {
    setShowEditForm(true);
  };

  const handleSaveProfile = (updatedData) => {
    // Profile will be updated in Redux via the updateArtistProfile thunk
    setShowEditForm(false);
    // Refetch profile to get updated data
    dispatch(fetchArtistProfile());
    toast.success('Profile updated successfully');
  };

  // Check if monetization is complete
  const isMonetized = setupStatus?.isMonetizationComplete || localStorage.getItem('artistMonetized') === 'true';

  // Calculate monthly listeners (you might want to get this from API)
  const calculateSubscriptionFees = () => {
    const amount = artistProfile?.monetization?.plans?.[0]?.basePrice?.amount ?? 10;
    const cycle  = artistProfile?.monetization?.plans?.[0]?.cycle ?? "month";
    if(cycle === "1m") {
      return `$${amount.toFixed(2)} / month`;
    } else if(cycle === "3m") {
      return `$${amount.toFixed(2)} / 3 months`;
    } else if(cycle === "6m") {
      return `$${amount.toFixed(2)} / 6 months`;
    }


  };

  return (
    <>
      <div className="relative h-[16rem] sm:h-[20rem] md:h-[22rem] w-full">
        {/* Background Image or Placeholder */}
        {artistProfile?.coverImage ? (
          <img
            src={artistProfile.coverImage}
            className="w-full h-full object-cover opacity-80"
            alt="Profile Background"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <button
              onClick={handleEditProfileClick}
              className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <IoAddCircleOutline className="text-4xl mb-2" />
              <span className="text-sm">Add background image</span>
              <span className="text-xs text-white/50">Click edit icon above</span>
            </button>
          </div>
        )}
        
        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
        
        {/* Middle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-black/70 to-transparent z-20" />
        
        {/* Slim Bottom Gradient Border */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-30"></div>
        
        {/* Edit Profile Button - Top Right */}
        <button 
          onClick={handleEditProfileClick}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center bg-gradient-to-tl from-black to-gray-500 justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200 group"
          title="Edit Profile"
        >
          <FiEdit3 className="text-lg sm:text-xl" />
          <div className="absolute top-full mt-2 right-0 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Edit Profile
          </div>
        </button>
        
        {/* Hidden file inputs (for quick uploads) */}
        <input
          type="file"
          ref={profileImageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'image')}
        />
        <input
          type="file"
          ref={backgroundImageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'backgroundImage')}
        />
        
        {/* Profile Content */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white">
          {/* Left Side: Profile Image and Name */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-0">
            {/* Profile Image with Edit */}
            <div className="relative group">
              {artistProfile?.profileImage ? (
                <img
                  src={artistProfile.profileImage}
                  alt={artistProfile?.name || 'Artist'}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_10px_2px_#3b82f6] cursor-pointer"
                  onClick={handleEditProfileClick}
                />
              ) : (
                <div 
                  onClick={handleEditProfileClick}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-blue-500/50 flex items-center justify-center bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
                >
                  <IoAddCircleOutline className="text-2xl text-white/60" />
                </div>
              )}
              
              {/* Edit Overlay for Profile Image */}
              <button
                onClick={handleEditProfileClick}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <FiEdit3 className="text-white text-lg" />
              </button>
            </div>
            
            {/* Profile Details - Consistent text sizes */}
            <div>
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <span className="text-xs sm:text-sm font-medium">artist</span>
                <img src="/Verified.svg" alt="verified badge" className="w-4 h-4 sm:w-5 sm:h-5" />
                {!isMonetized && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                    Setup Monetization Required
                  </span>
                )}
              </div>
              
              <h1 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold cursor-pointer hover:text-blue-200 transition-colors"
                onClick={handleEditProfileClick}
              >
                {artistProfile?.name || 'Artist Name'}
              </h1>
              
              <div className="flex items-center gap-1 mt-1 sm:mt-2 text-gray-200">
                <span className="text-base text-blue-500 font-bold sm:text-xl">
                  {calculateSubscriptionFees()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Side: Logout Button and Change Password */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-8 w-full sm:w-auto">
            {/* <div className="sm:block hidden">
              <button
                onClick={handleChangePasswordClick}
                className="text-gray-300 text-sm hover:text-white transition-colors duration-200 relative group"
              >
                change password
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div> */}

            <button 
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-7 md:py-2.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-1.5 sm:gap-2 text-sm w-full sm:w-auto justify-center"
            >
              <span>Logout</span>
              <IoLogOutOutline className="text-base" />
            </button>

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

      {/* Profile Edit Form Modal */}
      {showEditForm && artistProfile && (
        <ProfileEditForm
          profile={artistProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditForm(false)}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200 font-medium border border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  toast.success('Password changed successfully');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium"
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