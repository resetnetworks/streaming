// SocialMediaInput.js
import React from "react";
import { FiX } from "react-icons/fi";

const SocialMediaInput = React.memo(({
  newSocial,
  setNewSocial,
  socialError,
  setSocialError,
  socialPlatforms,
  isDuplicateSocial,
  handleSocialAdd,
  formData,
  handleSocialChange,
  handleSocialRemove,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Social Media Links
      </label>

      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Platform Select */}
          <div className="flex-1">
            <select
              value={newSocial.platform}
              onChange={(e) => {
                setNewSocial(prev => ({ ...prev, platform: e.target.value }));
                setSocialError("");
              }}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">Select Platform</option>
              {socialPlatforms.map(platform => (
                <option
                  key={platform.value}
                  value={platform.value}
                  disabled={isDuplicateSocial(platform.value)}
                >
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          {/* URL Input */}
          <div className="flex-1">
            <input
              type="url"
              value={newSocial.url}
              onChange={(e) => {
                setNewSocial(prev => ({ ...prev, url: e.target.value }));
                setSocialError("");
              }}
              placeholder="Enter URL"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleSocialAdd}
            className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
            disabled={isLoading || !newSocial.platform || !newSocial.url.trim()}
          >
            Add Link
          </button>
        </div>

        {socialError && (
          <p className="text-sm text-red-400 mt-1">{socialError}</p>
        )}
      </div>

      {/* Added Links */}
      {formData.socials.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-xs text-gray-400">Added Links:</p>

          {formData.socials.map((social, index) => {
            const platformInfo = socialPlatforms.find(
              p => p.value === social.platform
            );

            return (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
              >
                {/* ICON */}
                <div className="p-2 rounded-lg bg-gray-800">
                  <div className="text-lg text-gray-300">
                    {platformInfo?.icon || "🔗"}
                  </div>
                </div>

                <span className="text-sm font-medium text-gray-300 min-w-[80px]">
                  {platformInfo?.label || social.platform}
                </span>

                <input
                  type="url"
                  value={social.url}
                  onChange={(e) =>
                    handleSocialChange(index, "url", e.target.value)
                  }
                  className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => handleSocialRemove(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  disabled={isLoading}
                  title="Remove link"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default SocialMediaInput;
