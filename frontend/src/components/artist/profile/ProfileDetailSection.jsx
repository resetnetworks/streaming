// ProfileDetailSection.jsx
import React, { useState, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useArtistProfile, useUpdateArtistProfile } from "../../../hooks/api/useArtistDashboard";
import ProfileEditForm from "./ProfileEditForm";

const ProfileDetailSection = () => {
  const { data: artistProfile, isLoading: profileLoading } = useArtistProfile();
  const { mutate: updateProfile, isLoading: isUpdating } = useUpdateArtistProfile();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    businessEmail: "",
    country: "",
    website: "",
    socialMedia: "",
    name: "",
    location: "",
    bio: ""
  });

  // Update form data when artistProfile changes
  useEffect(() => {
    if (artistProfile) {
      setFormData({
        businessEmail: artistProfile.email || artistProfile.businessEmail || "",
        country: artistProfile.country || "",
        website: artistProfile.website || "",
        socialMedia: artistProfile.socialMedia || "",
        name: artistProfile.name || "",
        location: artistProfile.location || "",
        bio: artistProfile.bio || ""
      });
    }
  }, [artistProfile]);

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleSaveProfile = (updatedData) => {
    updateProfile(updatedData, {
      onSuccess: () => {
        setShowEditForm(false);
      }
    });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (profileLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderEmptyValue = (value) => {
    return value || <span className="text-gray-400 italic">Not provided</span>;
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className="text-white text-xl sm:text-2xl font-medium">basic details</h1>
            {isUpdating && (
              <span className="ml-3 text-xs text-blue-400 animate-pulse">
                Updating...
              </span>
            )}
          </div>
          
          <button 
            onClick={handleEditClick}
            disabled={isUpdating}
            className={`flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200 ${
              isUpdating ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-tl from-black to-gray-500'
            }`}
            title="Edit Basic Details"
          >
            <FiEdit3 className="text-sm" />
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-white text-lg font-medium mb-4">personal information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                name
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white">
                  {renderEmptyValue(formData.name)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                location
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white">
                  {renderEmptyValue(formData.location)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-white text-lg font-medium mb-4">contact information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                business email
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white">
                  {renderEmptyValue(formData.businessEmail)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                country
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] appearance-none w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white">
                  {renderEmptyValue(formData.country)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-white text-lg font-medium mb-4">bio / description</h2>
          <div>
            <div className="relative">
              <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white min-h-[120px]">
                {renderEmptyValue(formData.bio)}
              </div>
            </div>
          </div>
        </div>

        <div className="h-0.5 w-full bg-[#8172bc2d] mt-4"></div>
      </div>

      {showEditForm && artistProfile && (
        <ProfileEditForm
          profile={artistProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditForm(false)}
          isSaving={isUpdating}
        />
      )}
    </>
  );
};

export default ProfileDetailSection;