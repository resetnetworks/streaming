// ProfileDetailSection.jsx
import React, { useState, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useSelector } from "react-redux";

const ProfileDetailSection = () => {
  const { artistProfile, profileLoading } = useSelector((state) => state.artists);
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
        businessEmail: artistProfile.businessEmail || "",
        country: artistProfile.country || "",
        website: artistProfile.website || "",
        socialMedia: artistProfile.socialMedia || "",
        name: artistProfile.name || "",
        location: artistProfile.location || "",
        bio: artistProfile.bio || ""
      });
    }
  }, [artistProfile]);

  const updateFormData = (field, value) => {
    // This function is kept for consistency but won't be used
    // since all fields are now read-only
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

  // Function to render empty state
  const renderEmptyValue = (value) => {
    return value || <span className="text-gray-400 italic">Not provided</span>;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-4 items-center mb-6">
        <h1 className="text-white text-xl sm:text-2xl font-medium">basic details</h1>
      </div>

      {/* Personal Information Section */}
      <div className="mb-8">
        <h2 className="text-white text-lg font-medium mb-4">personal information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Name Field */}
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

          {/* Location Field */}
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

      {/* Contact Information Section */}
      <div className="mb-8">
        <h2 className="text-white text-lg font-medium mb-4">contact information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Business Email Field */}
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

          {/* Country Selection */}
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

      {/* Online Presence Section */}
      <div className="mb-8">
        <h2 className="text-white text-lg font-medium mb-4">online presence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Website Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              website url
            </label>
            <div className="relative">
              <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white">
                {renderEmptyValue(formData.website)}
              </div>
            </div>
          </div>

          {/* Social Media Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              social media profile
            </label>
            <div className="relative">
              <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white">
                {renderEmptyValue(formData.socialMedia)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mb-8">
        <h2 className="text-white text-lg font-medium mb-4">bio / description</h2>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            about you
          </label>
          <div className="relative">
            <div className="input-login !pl-[1rem] w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 px-4 text-white min-h-[120px]">
              {renderEmptyValue(formData.bio)}
            </div>
          </div>
        </div>
      </div>

      <div className="h-0.5 w-full bg-[#8172bc2d] mt-4"></div>
    </div>
  );
};

export default ProfileDetailSection;