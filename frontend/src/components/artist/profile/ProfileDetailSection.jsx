// ProfileDetailSection.jsx
import React from "react";
import { FiEdit3 } from "react-icons/fi";

const ProfileDetailSection = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-4 items-center">
        <h1 className="text-white text-xl sm:text-2xl">basic details</h1>{" "}
        <button className="z-30 flex items-center bg-gradient-to-tl from-black to-gray-500 justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200">
          <FiEdit3 className="text-lg sm:text-xl" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6">
        {/* Stage Name Field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            bussiness email
          </label>
          <div className="relative">
            <input
              required
              type="email"
              placeholder="allison.malone@smentertainment.com"
              className="input-login !pl-[1rem] w-full"
              onChange={(e) => updateFormData("stageName", e.target.value)}
            />
          </div>
        </div>

        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Country
          </label>
          <div className="relative">
            <select
              required
              className="input-login !pl-[1rem] appearance-none w-full"
              onChange={(e) => updateFormData("country", e.target.value)}
            >
              <option value="">Select Country</option>
              <option value="united states">United States</option>
              <option value="canada">Canada</option>
              <option value="united kingdom">United Kingdom</option>
              <option value="australia">Australia</option>
              <option value="india">India</option>
              <option value="germany">Germany</option>
              <option value="france">France</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6">
        {/* Website Field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="www.allisonmusic.com"
              className="input-login !pl-[1rem] w-full"
              onChange={(e) => updateFormData("website", e.target.value)}
            />
          </div>
        </div>

        {/* Social Media Field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Social Media Profile
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://www.twitter.com/allisonmalone"
              className="input-login !pl-[1rem] w-full"
              onChange={(e) => updateFormData("socialMedia", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="h-0.5 w-full bg-[#8172bc2d] mt-4"></div>
    </div>
  );
};

export default ProfileDetailSection;