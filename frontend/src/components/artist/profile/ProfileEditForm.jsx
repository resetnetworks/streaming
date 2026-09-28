// ProfileEditForm.jsx
import React, { useState, useEffect } from "react";
import {
  FiX,
  FiUser,
  FiMapPin,
  FiGlobe,
  FiPlus,
  FiChevronDown,
  FiTrash2,
} from "react-icons/fi";
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
import { toast } from "sonner";
import { useUpdateArtistProfile } from "../../../hooks/api/useArtistDashboard";

const PRIMARY_PLATFORMS = [
  {
    key: "portfolio",
    label: "Portfolio / Website URL",
    placeholder: "https://yourportfolio.com",
    icon: <FiGlobe className="text-[#38BDF8] text-lg" />,
  },
  {
    key: "bandcamp",
    label: "Bandcamp URL",
    placeholder: "https://yourhandle.bandcamp.com",
    icon: <FaBandcamp className="text-[#629aa9] text-lg" />,
  },
  {
    key: "soundcloud",
    label: "SoundCloud URL",
    placeholder: "https://soundcloud.com/yourhandle",
    icon: <FaSoundcloud className="text-[#FF5500] text-lg" />,
  },
  {
    key: "spotify",
    label: "Spotify Profile URL",
    placeholder: "https://open.spotify.com/artist/...",
    icon: <FaSpotify className="text-[#1DB954] text-lg" />,
  },
  {
    key: "apple",
    label: "Apple Music URL",
    placeholder: "https://music.apple.com/...",
    icon: <FaApple className="text-[#FA243C] text-lg" />,
  }
];

const SOCIAL_DROPDOWN_OPTIONS = [
  {
    key: "instagram",
    label: "Instagram",
    icon: <FaInstagram className="text-[#E1306C]" />,
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: <FaYoutube className="text-[#FF0000]" />,
    placeholder: "https://youtube.com/@yourhandle",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: <FaTwitter className="text-[#1DA1F2]" />,
    placeholder: "https://x.com/yourhandle",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: <FaTiktok className="text-white" />,
    placeholder: "https://tiktok.com/@yourhandle",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: <FaFacebook className="text-[#1877F2]" />,
    placeholder: "https://facebook.com/yourpage",
  },
  {
    key: "other",
    label: "Other Link",
    icon: <FaLink className="text-gray-400" />,
    placeholder: "https://...",
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
    bandcamp: "",
    soundcloud: "",
    spotify: "",
    apple: "",
    portfolio: "",
  });

  const [customSocials, setCustomSocials] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        country: profile.country || "",
      });

      const initialPrimary = {
        bandcamp: "",
        soundcloud: "",
        spotify: "",
        apple: "",
        portfolio: "",
      };
      const initialCustom = [];

      if (profile.socials) {
        let socialsArray = [];
        if (typeof profile.socials === "string") {
          try {
            socialsArray = JSON.parse(profile.socials);
          } catch {
            socialsArray = [];
          }
        } else if (Array.isArray(profile.socials)) {
          socialsArray = profile.socials;
        }

        socialsArray.forEach((item, index) => {
          if (!item || !item.url) return;
          const platKey = (item.platform || "").toLowerCase();
          if (
            platKey === "apple music" ||
            platKey === "applemusic" ||
            platKey === "apple_music" ||
            platKey === "apple"
          ) {
            initialPrimary.apple = item.url;
          } else if (
            platKey === "portfolio link" ||
            platKey === "portfoliolink" ||
            platKey === "website" ||
            platKey === "portfolio"
          ) {
            initialPrimary.portfolio = item.url;
          } else if (
            Object.prototype.hasOwnProperty.call(initialPrimary, platKey)
          ) {
            initialPrimary[platKey] = item.url;
          } else {
            initialCustom.push({
              id: Date.now() + index,
              platform: platKey,
              url: item.url,
            });
          }
        });
      }

      if (
        !initialPrimary.portfolio &&
        (profile.portfolioLink || profile.portfolio || profile.website)
      ) {
        initialPrimary.portfolio =
          profile.portfolioLink || profile.portfolio || profile.website || "";
      }

      setSocialsForm(initialPrimary);
      setCustomSocials(initialCustom);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSocial = () => {
    const usedKeys = customSocials.map((s) => s.platform);
    const available = SOCIAL_DROPDOWN_OPTIONS.find(
      (opt) => opt.key !== "other" && !usedKeys.includes(opt.key)
    );
    const nextPlatform = available ? available.key : "instagram";
    setCustomSocials((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), platform: nextPlatform, url: "" },
    ]);
  };

  const handlePlatformChange = (id, newPlatform) => {
    setCustomSocials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, platform: newPlatform } : item
      )
    );
  };

  const handleUrlChange = (id, newUrl) => {
    setCustomSocials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, url: newUrl } : item
      )
    );
  };

  const handleRemoveSocial = (id) => {
    setCustomSocials((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Primary 5 links
    const primaryPayload = Object.entries(socialsForm)
      .filter(([, url]) => url && url.trim().length > 0)
      .map(([platform, url]) => ({
        platform,
        url: normalizeUrl(url),
      }));

    // Dynamic additional links
    const customPayload = customSocials
      .filter((item) => item.url && item.url.trim().length > 0)
      .map((item) => ({
        platform: item.platform,
        url: normalizeUrl(item.url),
      }));

    const socialsPayload = [...primaryPayload, ...customPayload];

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
                  className={`text-xs ${formData.bio.length > 500
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Social & Streaming Links
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add links to your profiles so listeners can connect with you across platforms
                </p>
              </div>
              {customSocials.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddSocial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition-all cursor-pointer flex-shrink-0"
                >
                  <FiPlus className="text-sm" />
                  <span>Add Link</span>
                </button>
              )}
            </div>

            {/* Combined 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary 5 Platforms */}
              {PRIMARY_PLATFORMS.map((platform) => (
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

              {/* Dynamic Added Social Links */}
              {customSocials.map((item) => {
                const selectedOption =
                  SOCIAL_DROPDOWN_OPTIONS.find(
                    (opt) => opt.key === item.platform
                  ) || {
                    key: item.platform,
                    label: item.platform,
                    placeholder: "https://...",
                    icon: <FaLink className="text-gray-400" />,
                  };

                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-gray-300">
                        {selectedOption.label} URL
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocial(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer text-xs flex items-center gap-1"
                        title="Remove link"
                      >
                        <FiTrash2 className="text-xs" />
                        <span className="text-[10px]">Remove</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Platform Dropdown */}
                      <div className="relative w-32 sm:w-36 flex-shrink-0">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
                          {selectedOption.icon}
                        </div>
                        <select
                          value={item.platform}
                          onChange={(e) =>
                            handlePlatformChange(item.id, e.target.value)
                          }
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-7 pr-6 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                          disabled={isLoading}
                        >
                          {SOCIAL_DROPDOWN_OPTIONS.map((opt) => (
                            <option
                              key={opt.key}
                              value={opt.key}
                              className="bg-gray-800 text-white"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                      </div>

                      {/* URL Input */}
                      <div className="relative flex-1">
                        <input
                          type="url"
                          placeholder={selectedOption.placeholder}
                          value={item.url}
                          onChange={(e) =>
                            handleUrlChange(item.id, e.target.value)
                          }
                          className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* When total items in grid is odd, fill the next slot with "+ Add Link" card */}
              {(PRIMARY_PLATFORMS.length + customSocials.length) % 2 !== 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    {customSocials.length === 0
                      ? "Additional Socials"
                      : "Add Another"}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="w-full h-[42px] px-3 bg-gray-900/60 hover:bg-gray-800/80 border border-dashed border-gray-700 hover:border-gray-500 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <FiPlus className="text-blue-400 group-hover:scale-110 transition-transform text-sm" />
                    <span>
                      {customSocials.length === 0
                        ? "Add More (Instagram, YouTube, etc.)"
                        : "Add Another Social Link"}
                    </span>
                  </button>
                </div>
              )}
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