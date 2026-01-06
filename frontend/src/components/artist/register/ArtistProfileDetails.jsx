// src/components/artist/register/ArtistProfileDetails.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdPerson, MdPublic, MdLanguage, MdShare, MdDescription } from 'react-icons/md';
import { useCallback } from 'react';
import { 
  updateField, 
  updateApplicationFormData,
  saveToLocalStorage
} from '../../../features/artistApplications/artistApplicationSlice';
import { countries } from '../../../utills/countries';

const ArtistProfileDetails = ({ nextStep, prevStep }) => {
  const dispatch = useDispatch();
  const { formData, isSaving } = useSelector((state) => state.artistApplication);

  const [localProfileImage, setLocalProfileImage] = useState(formData.profileImage || '');
  const [errors, setErrors] = useState({});

  // Optimize: Use useMemo for sorted countries to prevent re-sorting on every render
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Optimize: Cache country options in useMemo
  const countryOptions = useMemo(() => {
    return sortedCountries.map((country) => (
      <option key={country.code} value={country.code}>
        {country.code} - {country.name}
      </option>
    ));
  }, [sortedCountries]);

  // Debounce saving to localStorage with optimized dependency array
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if there's actual data
      if (formData && Object.keys(formData).length > 0) {
        dispatch(saveToLocalStorage());
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, dispatch]);

  // Load from localStorage on component mount - optimized
  useEffect(() => {
    // Check if we need to load data
    const shouldLoadData = !formData.stageName && !formData.country;
    
    if (shouldLoadData) {
      const savedData = localStorage.getItem('artistApplicationData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          dispatch(updateApplicationFormData(parsedData));
          if (parsedData.profileImage) {
            setLocalProfileImage(parsedData.profileImage);
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
  }, [dispatch, formData.stageName, formData.country]);

  // Sync local image state with Redux
  useEffect(() => {
    if (formData.profileImage) {
      setLocalProfileImage(formData.profileImage);
    }
  }, [formData.profileImage]);

  const handleChange = useCallback((field, value) => {
    dispatch(updateField({ field, value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [dispatch, errors]);

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
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.focus();
          // Smooth scroll to element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    // Save to localStorage before proceeding
    dispatch(saveToLocalStorage());
    nextStep();
  };

  return (
    <div className="text-white flex flex-col justify-around items-center">
      <form 
        className="md:max-w-[90%] max-w-full mx-auto mt-4 md:mt-8 w-full"
        onSubmit={handleSubmit}
        noValidate
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
                      aria-invalid={!!errors.stageName}
                      aria-describedby={errors.stageName ? "stageName-error" : undefined}
                    />
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                  {errors.stageName && (
                    <p id="stageName-error" className="text-red-500 text-sm mt-1">{errors.stageName}</p>
                  )}
                </div>

                {/* Country Selection - Optimized */}
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
                      aria-invalid={!!errors.country}
                      aria-describedby={errors.country ? "country-error" : undefined}
                    >
                      <option value="">Select Country Code</option>
                      {countryOptions}
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
                    <p id="country-error" className="text-red-500 text-sm mt-1">{errors.country}</p>
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
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500">
                      Max 2000 characters. This will appear on your artist profile.
                    </p>
                    <span className={`text-xs ${(formData.bio?.length || 0) >= 1900 ? 'text-yellow-500' : 'text-slate-500'}`}>
                      {formData.bio?.length || 0}/2000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-save status indicator */}
            <div className="mt-4 flex items-center justify-end">
              {isSaving && (
                <span className="text-xs text-green-400 flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              )}
            </div>
              
            {/* Continue Button */}
            <div className="button-wrapper cursor-pointer shadow-sm shadow-black w-full mt-4">
              <button 
                className="custom-button !w-full" 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Continue to Documents'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default React.memo(ArtistProfileDetails);