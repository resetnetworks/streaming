// ProfileEditForm.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiUser,
  FiMapPin,
  FiGlobe,
  FiPlus,
  FiChevronDown,
  FiTrash2,
  FiCheck,
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

const ALL_LINK_OPTIONS = [
  {
    key: "portfolio",
    label: "Website",
    placeholder: "https://yourportfolio.com",
    icon: <FiGlobe className="text-[#38BDF8]" />,
  },
  {
    key: "bandcamp",
    label: "Bandcamp",
    placeholder: "https://yourhandle.bandcamp.com",
    icon: <FaBandcamp className="text-[#629aa9]" />,
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    placeholder: "https://soundcloud.com/yourhandle",
    icon: <FaSoundcloud className="text-[#FF5500]" />,
  },
  {
    key: "spotify",
    label: "Spotify",
    placeholder: "https://open.spotify.com/artist/...",
    icon: <FaSpotify className="text-[#1DB954]" />,
  },
  {
    key: "apple",
    label: "Apple Music",
    placeholder: "https://music.apple.com/...",
    icon: <FaApple className="text-[#FA243C]" />,
  },
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
    label: "Other",
    icon: <FaLink className="text-gray-400" />,
    placeholder: "https://...",
  },
];

const getPlatformInfo = (key) =>
  ALL_LINK_OPTIONS.find((o) => o.key === key) || {
    key,
    label: key,
    placeholder: "https://...",
    icon: <FaLink className="text-gray-400" />,
  };

const normalizeUrl = (url) => {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`;
  return trimmed;
};

const PRIMARY_KEYS = ["portfolio", "bandcamp", "soundcloud", "spotify", "apple"];

// Input row for a link
const LinkRow = ({ item, onPlatformChange, onUrlChange, onRemove, isLoading }) => {
  const info = getPlatformInfo(item.platform);

  return (
    <div className="flex items-center gap-2 group">
      {/* Platform selector */}
      <div className="relative flex-shrink-0 w-36">
        <select
          value={item.platform}
          onChange={(e) => onPlatformChange(item.id, e.target.value)}
          disabled={isLoading}
          className="w-full h-11 bg-[#0a0f1e] border border-white/15 rounded-lg px-3 pr-7 text-sm text-white/85 appearance-none focus:outline-none focus:border-blue-500/60 cursor-pointer disabled:opacity-50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]"
        >
          {ALL_LINK_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key} className="bg-[#0d1527] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none text-xs" />
      </div>

      {/* URL input */}
      <input
        type="url"
        placeholder={info.placeholder}
        value={item.url}
        onChange={(e) => onUrlChange(item.id, e.target.value)}
        disabled={isLoading}
        className="flex-1 h-11 bg-[#0a0f1e] border border-white/15 rounded-lg px-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-[#0c1326] transition-colors shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] disabled:opacity-50"
      />

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={isLoading}
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        title="Remove"
      >
        <FiTrash2 className="text-sm" />
      </button>
    </div>
  );
};

const ProfileEditForm = ({ profile, onSave, onClose }) => {
  const { mutate: updateProfile, isLoading } = useUpdateArtistProfile();
  const [isClosing, setIsClosing] = useState(false);

  const [formData, setFormData] = useState({ name: "", bio: "", location: "", country: "" });

  // Single unified links list: [{id, platform, url}]
  const [links, setLinks] = useState([{ id: 1, platform: "portfolio", url: "" }]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        country: profile.country || "",
      });

      const collected = [];

      if (profile.socials) {
        let arr = [];
        if (typeof profile.socials === "string") {
          try { arr = JSON.parse(profile.socials); } catch { arr = []; }
        } else if (Array.isArray(profile.socials)) {
          arr = profile.socials;
        }

        arr.forEach((item, idx) => {
          if (!item?.url) return;
          let key = (item.platform || "").toLowerCase().replace(/[^a-z]/g, "");
          if (key === "applemusic" || key === "applemusic" || key === "applemusic") key = "apple";
          if (key === "portfoliolink" || key === "website") key = "portfolio";
          if (!ALL_LINK_OPTIONS.find((o) => o.key === key)) key = "other";
          collected.push({ id: Date.now() + idx, platform: key, url: item.url });
        });
      }

      // portfolio from dedicated field
      if (!collected.find((l) => l.platform === "portfolio")) {
        const pUrl = profile.portfolioLink || profile.portfolio || profile.website || "";
        if (pUrl) collected.unshift({ id: Date.now(), platform: "portfolio", url: pUrl });
      }

      setLinks(
        collected.length > 0
          ? collected
          : [{ id: Date.now(), platform: "portfolio", url: "" }]
      );
    }
  }, [profile]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { onClose(); setIsClosing(false); }, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLink = () => {
    const usedKeys = links.map((l) => l.platform);
    const next = ALL_LINK_OPTIONS.find((o) => o.key !== "other" && !usedKeys.includes(o.key));
    setLinks((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), platform: next?.key || "other", url: "" },
    ]);
  };

  const updatePlatform = (id, plat) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, platform: plat } : l)));

  const updateUrl = (id, url) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, url } : l)));

  const removeLink = (id) =>
    setLinks((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length === 0 ? [{ id: Date.now(), platform: "portfolio", url: "" }] : next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const socialsPayload = links
      .filter((l) => l.url?.trim())
      .map((l) => ({ platform: l.platform, url: normalizeUrl(l.url) }));

    updateProfile(
      { name: formData.name, bio: formData.bio || "", location: formData.location || "", country: formData.country || "", socials: socialsPayload },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          if (onSave) onSave();
          handleClose();
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to update profile");
        },
      }
    );
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[99998] transition-all duration-250 ease-out ${
          isClosing ? "opacity-0" : "bg-black/70 backdrop-blur-sm"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={`subscription-wrapper w-full max-w-[32rem] transition-all duration-250 ease-out transform ${
            isClosing ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative subscription-card text-left max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-3 right-3 text-white/30 hover:text-white/70 p-1.5 rounded-lg hover:bg-white/5 transition-all z-10 cursor-pointer"
            >
              <FiX className="text-base" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-white/8 text-left">
              <div className="flex items-center gap-3">
                <div className="button-wrapper w-10 h-10 rounded-xl flex-shrink-0">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center">
                    <FiUser className="text-lg text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Edit Profile</h2>
                  <p className="text-sm text-white/40">Update your profile and links</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 pt-5 pb-2 space-y-4 text-left">
                {/* Artist Name */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                    Artist Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-sm pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      placeholder="Your artist name"
                      className="w-full h-11 bg-[#0a0f1e] border border-white/15 rounded-lg pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-[#0c1326] transition-colors shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Bio
                    </label>
                    <span className={`text-xs font-medium ${formData.bio.length > 450 ? "text-red-400" : "text-white/35"}`}>
                      {formData.bio.length}/500
                    </span>
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    maxLength="500"
                    disabled={isLoading}
                    placeholder="Write a short bio..."
                    className="w-full bg-[#0a0f1e] border border-white/15 rounded-lg px-3.5 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-[#0c1326] transition-colors shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] resize-none disabled:opacity-50"
                  />
                </div>

                {/* City + Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                      City
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-sm pointer-events-none" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Los Angeles"
                        className="w-full h-11 bg-[#0a0f1e] border border-white/15 rounded-lg pl-10 pr-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-[#0c1326] transition-colors shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-sm pointer-events-none" />
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="United States"
                        className="w-full h-11 bg-[#0a0f1e] border border-white/15 rounded-lg pl-10 pr-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-[#0c1326] transition-colors shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/8" />

                {/* Links */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                    Links
                  </label>

                  <div className="space-y-2.5">
                    {links.map((item) => (
                      <LinkRow
                        key={item.id}
                        item={item}
                        onPlatformChange={updatePlatform}
                        onUrlChange={updateUrl}
                        onRemove={removeLink}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>

                  {/* Add link — full width, below links */}
                  <button
                    type="button"
                    onClick={addLink}
                    disabled={isLoading}
                    className="mt-2.5 w-full h-10 flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-blue-400/40 hover:bg-blue-500/5 text-white/35 hover:text-blue-300 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-40"
                  >
                    <FiPlus className="text-sm" />
                    <span>Add Link</span>
                  </button>
                </div>
              </div>

              {/* Actions — only Save */}
              <div className="px-6 pt-5 pb-6">
                <div className="button-wrapper !w-full !inline-block">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="custom-button !w-full !h-11 !text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="text-sm" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ProfileEditForm;
