// src/components/artist/register/ArtistProfileDetails.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdPerson, MdPublic, MdLanguage, MdShare, MdCloudUpload, MdDescription } from 'react-icons/md';
import { 
  updateField, 
  updateApplicationFormData 
} from '../../../features/artistApplications/artistApplicationSlice';

const ArtistProfileDetails = ({ nextStep, prevStep }) => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.artistApplication);

  const [localProfileImage, setLocalProfileImage] = useState(formData.profileImage);
  const [errors, setErrors] = useState({});

  // Sync local image state with Redux
  useEffect(() => {
    setLocalProfileImage(formData.profileImage);
  }, [formData.profileImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(png|jpg|jpeg|gif|webp)/i)) {
        alert("Please select a valid image file (PNG, JPG, JPEG, GIF, WebP)");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setLocalProfileImage(previewUrl);
      dispatch(updateField({ field: 'profileImage', value: previewUrl }));
    }
  };

  const removeProfileImage = () => {
    setLocalProfileImage(null);
    dispatch(updateField({ field: 'profileImage', value: null }));
  };

  const handleChange = (field, value) => {
    dispatch(updateField({ field, value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.stageName?.trim()) {
      newErrors.stageName = 'Stage Name is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.querySelector(`[name="${firstErrorField}"]`)?.focus();
      }
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
                      name="stageName"
                      placeholder="Lady Gaga"
                      className="input-login pl-10"
                      value={formData.stageName || ''}
                      onChange={(e) => handleChange('stageName', e.target.value)}
                    />
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                  {errors.stageName && (
                    <p className="text-red-500 text-sm mt-1">{errors.stageName}</p>
                  )}
                </div>

                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Country Code (2 letters) *
                  </label>
                  <div className="relative">
                    <select
                      required
                      name="country"
                      className="input-login pl-10 appearance-none"
                      value={formData.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                    >
                      <option value="">Select Country Code</option>
                      <option value="US">US - United States</option>
                      <option value="CA">CA - Canada</option>
                      <option value="GB">GB - United Kingdom</option>
                      <option value="AU">AU - Australia</option>
                      <option value="IN">IN - India</option>
                      <option value="DE">DE - Germany</option>
                      <option value="FR">FR - France</option>
                      <option value="JP">JP - Japan</option>
                      <option value="BR">BR - Brazil</option>
                      <option value="MX">MX - Mexico</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <MdPublic className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Use 2-letter ISO country code
                  </p>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                  )}
                </div>

                {/* Website Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="website"
                      placeholder="https://www.yourmusic.com"
                      className="input-login pl-10"
                      value={formData.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
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
                      name="socialMedia"
                      placeholder="https://www.instagram.com/yourprofile"
                      className="input-login pl-10"
                      value={formData.socialMedia || ''}
                      onChange={(e) => handleChange('socialMedia', e.target.value)}
                    />
                    <MdShare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                {/* Biography Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Biography
                  </label>
                  <div className="relative">
                    <textarea
                      name="bio"
                      placeholder="Tell us about your music journey, inspirations, achievements..."
                      className="input-login pl-10 min-h-[100px] resize-y"
                      value={formData.bio || ''}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      maxLength={2000}
                    />
                    <MdDescription className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Max 2000 characters. This will appear on your artist profile.
                  </p>
                </div>
              </div>
            </div>


              
              {/* Continue Button */}
              <div className="button-wrapper cursor-pointer shadow-sm shadow-black w-full mt-4">
                <button className="custom-button !w-full" type="submit">
                  Continue to Documents
                </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtistProfileDetails;