// ProfileEditForm.jsx
import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMapPin, FiGlobe } from "react-icons/fi";
import {
  FaSpotify,
  FaInstagram,
  FaSoundcloud,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaBandcamp,
} from "react-icons/fa";
import { toast } from "sonner";
import { useUpdateArtistProfile } from "../../../hooks/api/useArtistDashboard";

const SOCIAL_PLATFORMS = [
  {
    key: "spotify",
    label: "Spotify Profile URL",
    placeholder: "https://open.spotify.com/artist/...",
    icon: <FaSpotify className="text-[#1DB954] text-lg" />,
  },
  {
    key: "instagram",
    label: "Instagram URL",
    placeholder: "https://instagram.com/yourhandle",
    icon: <FaInstagram className="text-[#E1306C] text-lg" />,
  },
  {
    key: "soundcloud",
    label: "SoundCloud URL",
    placeholder: "https://soundcloud.com/yourhandle",
    icon: <FaSoundcloud className="text-[#FF5500] text-lg" />,
  },
  {
    key: "youtube",
    label: "YouTube URL",
    placeholder: "https://youtube.com/@yourhandle",
    icon: <FaYoutube className="text-[#FF0000] text-lg" />,
  },
  {
    key: "twitter",
    label: "Twitter / X URL",
    placeholder: "https://x.com/yourhandle",
    icon: <FaTwitter className="text-[#1DA1F2] text-lg" />,
  },
  {
    key: "tiktok",
    label: "TikTok URL",
    placeholder: "https://tiktok.com/@yourhandle",
    icon: <FaTiktok className="text-white text-lg" />,
  },
  {
    key: "facebook",
    label: "Facebook URL",
    placeholder: "https://facebook.com/yourpage",
    icon: <FaFacebook className="text-[#1877F2] text-lg" />,
  },
  {
    key: "bandcamp",
    label: "Bandcamp URL",
    placeholder: "https://yourhandle.bandcamp.com",
    icon: <FaBandcamp className="text-[#629aa9] text-lg" />,
  },
];

const normalizeUrl = (url) => {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
};

const ProfileEditForm = ({ profile, onSave, onClose }) => {
  const { mutate: updateProfile, isLoading } = useUpdateArtistProfile();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    country: "",
  });

  const [socialsForm, setSocialsForm] = useState({
    spotify: "",
    instagram: "",
    soundcloud: "",
    youtube: "",
    twitter: "",
    tiktok: "",
    facebook: "",
    bandcamp: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        country: profile.country || "",
      });

      const initial = {
        spotify: "",
        instagram: "",
        soundcloud: "",
        youtube: "",
        twitter: "",
        tiktok: "",
        facebook: "",
        bandcamp: "",
      };

      if (profile.socials) {
        let socialsArray = [];
        if (typeof profile.socials === "string") {
          try {
            socialsArray = JSON.parse(profile.socials);
          } catch (e) {
            socialsArray = [];
          }
        } else if (Array.isArray(profile.socials)) {
          socialsArray = profile.socials;
        }

        socialsArray.forEach((item) => {
          if (
            item &&
            item.platform &&
            Object.prototype.hasOwnProperty.call(initial, item.platform.toLowerCase())
          ) {
            initial[item.platform.toLowerCase()] = item.url || "";
          }
        });
      }

      setSocialsForm(initial);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert object to array of { platform, url }, skipping empty inputs
    // Auto-prepend https:// if missing as backend validator strictly checks require_protocol: true
    const socialsPayload = Object.entries(socialsForm)
      .filter(([_, url]) => url && url.trim().length > 0)
      .map(([platform, url]) => ({
        platform,
        url: normalizeUrl(url),
      }));

    const profileData = {
      name: formData.name,
      bio: formData.bio || "",
      location: formData.location || "",
      country: formData.country || "",
      socials: socialsPayload,
    };

    updateProfile(profileData, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        if (onSave) onSave();
        if (onClose) onClose();
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message || "Failed to update profile";
        toast.error(errorMessage);
      },
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
            <p className="text-xs text-gray-400 mt-0.5">
              Update your profile details and streaming links
            </p>
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
                <span
                  className={`text-xs ${
                    formData.bio.length > 500
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
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

          {/* Social & Streaming Links Section */}
          <div className="pt-2 border-t border-gray-800">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white">
                Social & Streaming Links
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Add links to your profiles so listeners can connect with you across platforms
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key}>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    {platform.label}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder={platform.placeholder}
                      value={socialsForm[platform.key] || ""}
                      onChange={(e) =>
                        setSocialsForm((prev) => ({
                          ...prev,
                          [platform.key]: e.target.value,
                        }))
                      }
                      className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      {platform.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;