import React from 'react';
import { MdPerson, MdPublic, MdLanguage, MdShare, MdCloudUpload } from 'react-icons/md';

const ArtistProfileDetails = ({ formData, updateFormData, nextStep, prevStep }) => {

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(png|jpg|jpeg|gif|webp)/i)) {
        alert("Please select a valid image file (PNG, JPG, JPEG, GIF, WebP)");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      updateFormData('profileImage', previewUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.stageName || !formData.country) {
      alert("Please fill all required fields");
      return;
    }
    nextStep();
  };

  return (
    <div className="text-white flex flex-col justify-around items-center">
      <form 
        className="md:max-w-[90%] max-w-full mx-auto mt-4 md:mt-8 w-full"
        onSubmit={handleSubmit}
      >
        <div className='w-full max-w-full md:max-w-[90%] mx-auto'>
          
          {/* Main Form Container */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
            
            {/* Profile Section with Form Fields */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              
              {/* Profile Image Section */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-60 h-40 md:w-80 md:h-80 bg-slate-700 rounded-xl overflow-hidden border-2 border-slate-600">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                      <svg className="w-12 h-12 md:w-16 md:h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="relative mt-3">
                  <input
                    type="file"
                    id="profile-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="profile-upload"
                    className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-all duration-200"
                  >
                    <MdCloudUpload className="w-4 h-4" />
                    {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>

                {/* Remove Photo Button */}
                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={() => updateFormData('profileImage', null)}
                    className="mt-2 w-full px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-transparent hover:bg-red-500/10 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Form Fields Section */}
              <div className="flex-1 space-y-4 md:space-y-5">
                
                {/* Stage Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stage Name *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="Lady Gaga"
                      className="input-login pl-10"
                      value={formData.stageName}
                      onChange={(e) => updateFormData('stageName', e.target.value)}
                    />
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Country *
                  </label>
                  <div className="relative">
                    <select
                      required
                      className="input-login pl-10 appearance-none"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
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
                    <MdPublic className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Website Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="www.allisonmusic.com"
                      className="input-login pl-10"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                    />
                    <MdLanguage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
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
                      className="input-login pl-10"
                      value={formData.socialMedia}
                      onChange={(e) => updateFormData('socialMedia', e.target.value)}
                    />
                    <MdShare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          {/* Action Buttons */}
<div className="flex flex-col sm:flex-row gap-4 mt-8">
  <button
    type="button"
    onClick={prevStep}
    className="w-full sm:w-auto px-6  bg-slate-700 text-white font-medium rounded-lg border border-slate-600"
  >
    Back
  </button>
  
{/* Continue Button */}
<div className="button-wrapper cursor-pointer shadow-sm shadow-black w-full mx-auto">
  <button className="custom-button !w-full" type="submit">
    Continue to Documents
  </button>
</div>
</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtistProfileDetails;