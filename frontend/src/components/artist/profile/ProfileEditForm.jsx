// ProfileEditForm.js - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from "react";
import { FiUpload, FiX, FiEdit3, FiUser, FiImage, FiGlobe, FiMapPin } from "react-icons/fi";
import { FaYoutube, FaInstagram, FaFacebookSquare, FaSpotify, FaSoundcloud, FaGlobe } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { updateArtistProfile } from "../../../features/artists/artistsSlice"; // CORRECT IMPORT
import { compressArtistCoverImage,compressProfileImage } from "../../../utills/imageCompression";

const ProfileEditForm = ({ 
  profile, 
  onSave, 
  onClose
}) => {
  const dispatch = useDispatch();
  const { profileLoading } = useSelector((state) => state.artists || {});
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    country: "",
    socials: []
  });

  const [previewImage, setPreviewImage] = useState({
    profile: "",
    background: ""
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [newSocial, setNewSocial] = useState({
    platform: "instagram",
    url: ""
  });

  // Available social media platforms
  const socialPlatforms = [
    { 
      value: "instagram", 
      label: "Instagram", 
      icon: <FaInstagram className="text-pink-500" /> 
    },
    { 
      value: "youtube", 
      label: "YouTube", 
      icon: <FaYoutube className="text-red-500" /> 
    },
    { 
      value: "facebook", 
      label: "Facebook", 
      icon: <FaFacebookSquare className="text-blue-500" /> 
    },
    { 
      value: "spotify", 
      label: "Spotify", 
      icon: <FaSpotify className="text-green-500" /> 
    },
    { 
      value: "soundcloud", 
      label: "SoundCloud", 
      icon: <FaSoundcloud className="text-orange-500" /> 
    },
    { 
      value: "website", 
      label: "Website", 
      icon: <FaGlobe className="text-blue-400" /> 
    },
  ];

  useEffect(() => {
    if (profile) {
      // Parse socials if it's a string
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
      
      setPreviewImage({
        profile: profile.profileImage || "",
        background: profile.coverImage || ""
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

const handleImageChange = async (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    return;
  }

  try {
    let compressedFile;
    if (type === "profile") {
      compressedFile = await compressProfileImage(file);
      setProfileImageFile(compressedFile);
    } else {
      compressedFile = await compressArtistCoverImage(file);
      setCoverImageFile(compressedFile);
    }

    // Preview ke liye
    setPreviewImage(prev => ({
      ...prev,
      [type]: URL.createObjectURL(compressedFile),
    }));
  } catch (err) {
    console.error(err);
  }
};


  const handleSocialAdd = () => {
    if (newSocial.url.trim()) {
      const updatedSocials = [...formData.socials, { ...newSocial }];
      setFormData(prev => ({
        ...prev,
        socials: updatedSocials
      }));
      setNewSocial({ platform: "instagram", url: "" });
    }
  };

  const handleSocialRemove = (index) => {
    const updatedSocials = formData.socials.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      socials: updatedSocials
    }));
  };

  const handleSocialChange = (index, field, value) => {
    const updatedSocials = [...formData.socials];
    updatedSocials[index][field] = value;
    setFormData(prev => ({
      ...prev,
      socials: updatedSocials
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use profile.id (from /profile/me endpoint) or profile._id (from other endpoints)
    const artistId = profile?.id || profile?._id;
    
    if (!artistId) {
      toast.error('Artist ID not found');
      return;
    }
    
    try {
      // Prepare form data with images
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio || '');
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('country', formData.country || '');
      
      // Add socials as JSON string if they exist
      if (formData.socials.length > 0) {
        formDataToSend.append('socials', JSON.stringify(formData.socials));
      }
      
      // Add image files if they exist
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile);
      } else if (!previewImage.profile && profile?.profileImage) {
        // If removing existing image (preview is empty but profile had image)
        formDataToSend.append('profileImage', '');
      }
      
      if (coverImageFile) {
        formDataToSend.append('coverImage', coverImageFile);
      } else if (!previewImage.background && profile?.coverImage) {
        // If removing existing image (preview is empty but profile had image)
        formDataToSend.append('coverImage', '');
      }
      
      // Call the updateArtistProfile action with artist ID and formData
      const result = await dispatch(updateArtistProfile({ 
        id: artistId, 
        formData: formDataToSend 
      })).unwrap();
      
      // Call onSave with the updated artist data
      if (onSave) {
        onSave(result);
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error || 'Failed to update profile');
    }
  };

  const ImageUploader = ({ type, label }) => {
    const isProfile = type === 'profile';
    const currentImage = previewImage[type];
    const hasImage = currentImage || (profile && (isProfile ? profile.profileImage : profile.coverImage));
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        
        <div className={`relative ${isProfile ? 'w-32 h-32 mx-auto' : 'w-full h-40'} border-2 border-dashed border-gray-600 rounded-xl overflow-hidden bg-gray-900/30 group`}>
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt={label}
                className={`w-full h-full object-cover ${isProfile ? 'rounded-full' : ''}`}
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                <FiEdit3 className="text-white text-xl mb-1" />
                <span className="text-white text-xs font-medium">Change Image</span>
              </div>
            </>
          ) : hasImage && !currentImage ? (
            <>
              <img 
                src={isProfile ? profile.profileImage : profile.coverImage} 
                alt={label}
                className={`w-full h-full object-cover ${isProfile ? 'rounded-full' : ''}`}
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                <FiEdit3 className="text-white text-xl mb-1" />
                <span className="text-white text-xs font-medium">Change Image</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              {isProfile ? (
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                  <FiUser className="text-xl text-gray-500" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-2">
                  <FiImage className="text-xl text-gray-500" />
                </div>
              )}
              <span className="text-xs font-medium">Click to upload</span>
            </div>
          )}
          
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={(e) => handleImageChange(e, type)}
            disabled={profileLoading}
          />
        </div>
        
        {/* Combined Upload/Remove Button */}
        {currentImage ? (
          <button
            type="button"
            onClick={() => {
              setPreviewImage(prev => ({
                ...prev,
                [type]: ""
              }));
              if (type === 'profile') {
                setProfileImageFile(null);
              } else {
                setCoverImageFile(null);
              }
            }}
            className="w-full py-2 bg-gradient-to-r from-red-600/20 to-red-700/10 hover:from-red-600/30 hover:to-red-700/20 text-red-400 text-sm rounded-lg transition-all duration-200 font-medium border border-red-700/30 hover:border-red-600/50 text-center"
            disabled={profileLoading}
          >
            Remove Photo
          </button>
        ) : (
          <label className="block w-full cursor-pointer">
            <div className="w-full py-2 bg-gradient-to-r from-blue-600/20 to-blue-700/10 hover:from-blue-600/30 hover:to-blue-700/20 text-blue-400 text-sm rounded-lg transition-all duration-200 font-medium border border-blue-700/30 hover:border-blue-600/50 text-center">
              <FiUpload className="inline mr-2 mb-0.5" />
              Upload Photo
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, type)}
              disabled={profileLoading}
            />
          </label>
        )}
      </div>
    );
  };

  const SocialMediaInput = () => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Social Media Links
      </label>
      
      {/* Add new social media */}
      <div className="flex gap-2">
        <div className="flex-1">
          <select
            value={newSocial.platform}
            onChange={(e) => setNewSocial(prev => ({ ...prev, platform: e.target.value }))}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={profileLoading}
          >
            {socialPlatforms.map(platform => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <input
            type="url"
            value={newSocial.url}
            onChange={(e) => setNewSocial(prev => ({ ...prev, url: e.target.value }))}
            placeholder="Enter URL (e.g., https://instagram.com/username)"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={profileLoading}
          />
        </div>
        <button
          type="button"
          onClick={handleSocialAdd}
          className="px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
          disabled={profileLoading}
        >
          Add
        </button>
      </div>

      {/* List of added social media */}
      {formData.socials.length > 0 && (
        <div className="space-y-2">
          {formData.socials.map((social, index) => {
            const platformInfo = socialPlatforms.find(p => p.value === social.platform);
            return (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                <div className="p-2 rounded-lg bg-gray-800">
                  <div className="text-lg text-gray-300">
                    {platformInfo?.icon || "🔗"}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-300">
                    {platformInfo?.label || social.platform}
                  </span>
                </div>
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                  className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL"
                  disabled={profileLoading}
                />
                <button
                  type="button"
                  onClick={() => handleSocialRemove(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                  disabled={profileLoading}
                >
                  <FiX />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Get artist ID for display
  const artistId = profile?.id || profile?._id || 'N/A';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl my-auto shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              Edit Artist Profile
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your profile information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={profileLoading}
          >
            <FiX className="text-lg text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile and Background Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <ImageUploader type="profile" label="Profile Picture" />
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <ImageUploader type="background" label="Cover Photo" />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            {/* Display Name */}
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
                  disabled={profileLoading}
                />
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biography
              </label>
              <div className="relative">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Tell your story..."
                  disabled={profileLoading}
                />
              </div>
              <div className="text-right mt-1">
                <span className={`text-xs ${formData.bio.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formData.bio.length}/500
                </span>
              </div>
            </div>

            {/* Location and Country */}
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
                    disabled={profileLoading}
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
                    disabled={profileLoading}
                  />
                  <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <SocialMediaInput />
          </div>

          {/* Read-only Information */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white text-sm">Verified Artist</h4>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    This status is permanent and cannot be edited
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg transition-all duration-200 font-medium border border-gray-700 hover:border-gray-600 disabled:opacity-50"
              disabled={profileLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={profileLoading}
            >
              {profileLoading ? (
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