// ProfileEditForm.js
import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiUser, FiMapPin, FiGlobe } from "react-icons/fi";
import { FaYoutube, FaInstagram, FaFacebookSquare, FaSpotify, FaSoundcloud, FaGlobe } from "react-icons/fa";
import { toast } from "sonner";
import { useUpdateArtistProfile } from "../../../hooks/api/useArtistDashboard";
import SocialMediaInput from "./SocialMediaInput";

const ProfileEditForm = ({ profile, onSave, onClose }) => {
  const { mutate: updateProfile, isLoading } = useUpdateArtistProfile();
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    country: "",
    socials: []
  });

  const [newSocial, setNewSocial] = useState({
    platform: "",
    url: ""
  });

  const [socialError, setSocialError] = useState("");

  const socialPlatforms = [
    { value: "instagram", label: "Instagram", icon: <FaInstagram className="text-pink-500" /> },
    { value: "youtube", label: "YouTube", icon: <FaYoutube className="text-red-500" /> },
    { value: "facebook", label: "Facebook", icon: <FaFacebookSquare className="text-blue-500" /> },
    { value: "spotify", label: "Spotify", icon: <FaSpotify className="text-green-500" /> },
    { value: "soundcloud", label: "SoundCloud", icon: <FaSoundcloud className="text-orange-500" /> },
    { value: "website", label: "Website", icon: <FaGlobe className="text-blue-400" /> },
  ];

  const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
};

  useEffect(() => {
    if (profile) {
      let socialsArray = [];
      if (profile.socials) {
        if (typeof profile.socials === 'string') {
          try {
            socialsArray = JSON.parse(profile.socials);
          } catch (e) {
            socialsArray = [];
          }
        } else if (Array.isArray(profile.socials)) {
          socialsArray = profile.socials;
        }
      }

      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        country: profile.country || "",
        socials: socialsArray
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isDuplicateSocial = (platform) => {
    return formData.socials.some(social => social.platform === platform);
  };

  const handleSocialAdd = () => {
    setSocialError("");
    
    if (!newSocial.platform) {
      setSocialError("Please select a platform");
      return;
    }
    
    if (!isValidUrl(newSocial.url)) {
  setSocialError("Please enter a valid URL (must start with http or https)");
  return;
}

const platformDomainMap = {
  instagram: "instagram.com",
  youtube: "youtube.com",
  facebook: "facebook.com",
  spotify: "spotify.com",
  soundcloud: "soundcloud.com",
};

if (
  platformDomainMap[newSocial.platform] &&
  !newSocial.url.includes(platformDomainMap[newSocial.platform])
) {
  setSocialError(`Please enter a valid ${newSocial.platform} link`);
  return;
}


    if (isDuplicateSocial(newSocial.platform)) {
      setSocialError(`${newSocial.platform} link already exists`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      socials: [...prev.socials, { ...newSocial }]
    }));
    
    setNewSocial({ platform: "", url: "" });
  };

  const handleSocialRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index)
    }));
  };

  const handleSocialChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedSocials = [...prev.socials];
      updatedSocials[index] = {
        ...updatedSocials[index],
        [field]: value
      };
      return {
        ...prev,
        socials: updatedSocials
      };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const profileData = {
      name: formData.name,
      bio: formData.bio || '',
      location: formData.location || '',
      country: formData.country || '',
    };
    
    if (formData.socials.length > 0) {
      profileData.socials = formData.socials;
    }
    
    updateProfile(profileData, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        onSave();
        onClose();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || 'Failed to update profile';
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl my-auto shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              Edit Profile Information
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your profile details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
          >
            <FiX className="text-lg text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                  placeholder="Enter your artist name"
                  required
                  disabled={isLoading}
                />
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biography
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Tell your story..."
                disabled={isLoading}
                maxLength="500"
              />
              <div className="text-right mt-1">
                <span className={`text-xs ${formData.bio.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formData.bio.length}/500
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location (City)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                    placeholder="e.g., Los Angeles"
                    disabled={isLoading}
                  />
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                    placeholder="e.g., United States"
                    disabled={isLoading}
                  />
                  <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <SocialMediaInput
  newSocial={newSocial}
  setNewSocial={setNewSocial}
  socialError={socialError}
  setSocialError={setSocialError}
  socialPlatforms={socialPlatforms}
  isDuplicateSocial={isDuplicateSocial}
  handleSocialAdd={handleSocialAdd}
  formData={formData}
  handleSocialChange={handleSocialChange}
  handleSocialRemove={handleSocialRemove}
  isLoading={isLoading}
/>

          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg transition-all duration-200 font-medium border border-gray-700 hover:border-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;