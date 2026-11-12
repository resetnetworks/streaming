// ProfileDetailSection.jsx
import React, { useState, useEffect } from "react";
import { FiEdit3, FiGlobe } from "react-icons/fi";
import {
  FaSpotify,
  FaInstagram,
  FaSoundcloud,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaBandcamp,
  FaApple,
  FaLink,
} from "react-icons/fa";
import { SiLinktree } from "react-icons/si";
import { useArtistProfile, useUpdateArtistProfile } from "../../../hooks/api/useArtistDashboard";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import ProfileEditForm from "./ProfileEditForm";

const getSocialIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case "spotify":
      return <FaSpotify className="text-[#1DB954]" />;
    case "apple":
    case "applemusic":
    case "apple_music":
    case "apple music":
      return <FaApple className="text-[#FA243C]" />;
    case "portfolio":
    case "website":
      return <FiGlobe className="text-[#38BDF8]" />;
    case "instagram":
      return <FaInstagram className="text-[#E1306C]" />;
    case "soundcloud":
      return <FaSoundcloud className="text-[#FF5500]" />;
    case "youtube":
      return <FaYoutube className="text-[#FF0000]" />;
    case "twitter":
      return <FaTwitter className="text-[#1DA1F2]" />;
    case "tiktok":
      return <FaTiktok className="text-white" />;
    case "facebook":
      return <FaFacebook className="text-[#1877F2]" />;
    case "bandcamp":
      return <FaBandcamp className="text-[#629aa9]" />;
    case "linktree":
      return <SiLinktree className="text-[#43E660]" />;
    default:
      return <FaLink className="text-gray-400" />;
  }
};

const ProfileDetailSection = ({ workspace }) => {
  const user = useSelector(selectCurrentUser);
  const workspaceId = workspace?.workspaceId;
  const { data: artistProfile, isLoading: profileLoading } = useArtistProfile(workspaceId);
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
        businessEmail: artistProfile.email || artistProfile.businessEmail || user.email || "",
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
    if (updatedData && typeof updatedData === "object" && !updatedData.nativeEvent) {
      updateProfile(updatedData, {
        onSuccess: () => {
          setShowEditForm(false);
        },
      });
    } else {
      setShowEditForm(false);
    }
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
    if (typeof value === "object") return "Invalid data";
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
            className={`flex items-center justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200 ${isUpdating ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-tl from-black to-gray-500'
              }`}
            title="Edit Basic Details"
          >
            <FiEdit3 className="text-sm" />
          </button>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                name
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] w-full bg-[#0d1527] border border-white/15 rounded-xl py-3 px-4 text-white font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {renderEmptyValue(formData.name)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                location
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] w-full bg-[#0d1527] border border-white/15 rounded-xl py-3 px-4 text-white font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {renderEmptyValue(formData.location)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                business email
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] w-full bg-[#0d1527] border border-white/15 rounded-xl py-3 px-4 text-white font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {renderEmptyValue(formData.businessEmail)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                country
              </label>
              <div className="relative">
                <div className="input-login !pl-[1rem] appearance-none w-full bg-[#0d1527] border border-white/15 rounded-xl py-3 px-4 text-white font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
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
              <div className="input-login !pl-[1rem] w-full bg-[#0d1527] border border-white/15 rounded-xl py-3 px-4 text-white min-h-[120px] font-medium leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                {renderEmptyValue(formData.bio)}
              </div>
            </div>
          </div>
        </div>

        {/* Social & Streaming Links */}
        {(() => {
          let socialsList = [];
          if (artistProfile?.socials) {
            if (Array.isArray(artistProfile.socials)) {
              socialsList = artistProfile.socials;
            } else if (typeof artistProfile.socials === "string") {
              try {
                socialsList = JSON.parse(artistProfile.socials);
              } catch {
                socialsList = [];
              }
            }
          }

          return (
            <div className="mb-8">
              <h2 className="text-white text-lg font-medium mb-4">
                social & streaming links
              </h2>
              {socialsList && socialsList.length > 0 ? (
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {socialsList.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.platform?.toLowerCase() === "apple" ? "Apple Music" : link.platform}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0d1527] hover:bg-[#111b33] border border-white/15 hover:border-white/30 flex items-center justify-center text-xl sm:text-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="w-full bg-[#0d1527] border border-white/15 rounded-xl py-3 px-4 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  <span className="text-gray-400 italic text-sm">
                    No social links added yet. Click the edit button to add your links.
                  </span>
                </div>
              )}
            </div>
          );
        })()}
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