import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSubmitApplication } from '../../../hooks/api/useArtistApplications';
import { ArtistApplicationFormContext } from '../../../pages/artist/ArtistRegister';
import { countries } from '../../../utills/countries';
import { MdPerson, MdPublic, MdFolderOpen, MdKeyboardDoubleArrowLeft } from 'react-icons/md';
import { toast } from 'sonner';

const DOCUMENT_TYPES = {
  GOV_ID: 'gov_id',
  OTHER: 'other'
};

const ArtistProfileDetails = ({ nextStep, prevStep, submitForm }) => {
  const {
    formData,
    isSaving,
    updateField,
    updateApplicationFormData,
    addDocument,
    removeDocument,
    clearFormData
  } = React.useContext(ArtistApplicationFormContext);

  const submitApplicationMutation = useSubmitApplication();
  const submitLoading = submitApplicationMutation.isLoading;
  const submitError = submitApplicationMutation.error?.message;

  const [stageName, setStageName] = useState(formData.stageName || '');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectCountry = (code) => {
    handleChange('country', code);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const documents = formData?.documents || [];

  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return sortedCountries;
    const query = searchQuery.toLowerCase();
    return sortedCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [sortedCountries, searchQuery]);

  const countryOptions = useMemo(() => {
    return sortedCountries.map((country) => (
      <option key={country.code} value={country.code}>
        {country.name} ({country.code})
      </option>
    ));
  }, [sortedCountries]);

  const handleStageNameChange = (value) => {
    setStageName(value);
    updateField('stageName', value);
  };

  const handleChange = useCallback((field, value) => {
    updateField(field, value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [updateField, errors]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (documents.length >= 1) {
      toast.error("You can only upload one Government ID. Remove the existing one first.");
      e.target.value = '';
      return;
    }

    const file = files[0];
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name}: Invalid file type. Please upload PDF, JPG, or PNG.`);
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name}: File too large. Max size is 5MB.`);
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const document = {
      previewUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      docType: DOCUMENT_TYPES.GOV_ID,
      uploadedAt: new Date().toISOString(),
      file: file
    };

    addDocument(document);
    e.target.value = '';
    if (errors.documents) {
      setErrors(prev => ({ ...prev, documents: undefined }));
    }
    toast.success('Government ID uploaded successfully!');
  };

  const handleRemoveDocument = (index) => {
    const doc = documents[index];
    if (doc && doc.previewUrl) {
      URL.revokeObjectURL(doc.previewUrl);
    }
    removeDocument(index);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stageName?.trim()) {
      newErrors.stageName = 'Stage Name is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (documents.length === 0) {
      newErrors.documents = 'Government ID is required';
    }
    if (!termsAccepted) {
      newErrors.terms = 'You must accept terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareFormDataForSubmission = () => {
    const formDataToSend = new FormData();
    formDataToSend.append('stageName', formData?.stageName?.trim() || '');
    formDataToSend.append('legalName', (formData?.firstName || '').trim());
    formDataToSend.append('bio', formData?.bio?.trim() || "");
    formDataToSend.append('country', (formData?.country || '').toUpperCase());
    formDataToSend.append('contact[email]', formData?.email || '');

    documents.forEach((doc, index) => {
      if (doc.file && doc.file instanceof File) {
        formDataToSend.append('documents', doc.file, doc.filename || `document-${index}`);
        formDataToSend.append(`documentTypes[${index}]`, doc.docType || DOCUMENT_TYPES.OTHER);
        formDataToSend.append(`documentFilenames[${index}]`, doc.filename || `document-${index}.${doc.mimeType?.split('/')[1] || 'pdf'}`);
      }
    });

    return formDataToSend;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        toast.error(errors[firstError]);
      }
      return;
    }

    try {
      const formDataToSend = prepareFormDataForSubmission();
      await submitApplicationMutation.mutateAsync(formDataToSend);

      documents.forEach(doc => {
        if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      });

      clearFormData();
      submitForm();
    } catch (error) {
      console.error('Submission error:', error);
      const errMsg = error?.response?.data?.message || error?.message || "";
      toast.error(errMsg || "Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="text-white flex flex-col justify-around items-center w-full max-w-[650px] mx-auto mt-6">
      <form
        className="w-full rounded-[24px] p-8 mt-4 flex flex-col items-center"
        style={{
          background: 'linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)',
          boxShadow: `
            12px 12px 40px rgba(0,0,0,0.7),
            -8px -8px 30px rgba(59,130,246,0.08),
            inset 1px 1px 1px rgba(255,255,255,0.05),
            0 0 0 1px rgba(59,130,246,0.1)
          `,
        }}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Stage Name Field */}
        <div className="w-full mb-2 text-left">
          <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
            Artist Name <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="w-full relative">
          <input
            required
            type="text"
            name="stageName"
            placeholder="e.g. Enter artist name"
            className="input-login pl-10"
            value={stageName}
            onChange={(e) => handleStageNameChange(e.target.value)}
          />
          <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        </div>
        {errors.stageName && (
          <p className="text-red-500 text-xs text-left w-full mt-1">{errors.stageName}</p>
        )}

        {/* Country Selection */}
        <div className="w-full mt-5 mb-2 text-left">
          <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
            Country <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="w-full relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="input-login pl-10 pr-10 flex items-center justify-between cursor-pointer select-none text-left min-h-[48px]"
          >
            {isDropdownOpen ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-transparent text-white outline-none border-none p-0 text-sm placeholder-slate-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={formData.country ? "text-slate-200 text-sm" : "text-slate-400 text-sm"}>
                {formData.country 
                  ? (sortedCountries.find(c => c.code === formData.country)?.name || formData.country) 
                  : "Select Country"}
              </span>
            )}
          </div>
          <MdPublic className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Custom Dropdown Overlay */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-[#0a0f24] border border-slate-700/80 rounded-xl z-50 shadow-2xl p-1.5 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredCountries.length === 0 ? (
                <div className="text-slate-500 text-xs py-3 text-center">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = formData.country === country.code;
                  return (
                    <div
                      key={country.code}
                      onClick={() => selectCountry(country.code)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/20' 
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <span>{country.name}</span>
                      <span className="text-xs opacity-50 uppercase">{country.code}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        {errors.country && (
          <p className="text-red-500 text-xs text-left w-full mt-1">{errors.country}</p>
        )}

        {/* Government ID Document Upload */}
        <div className="w-full mt-5 mb-2 text-left">
          <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
            Government ID <span className="text-red-500">*</span>
          </label>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Please upload a valid Government ID to verify your identity. ID proof is required for secure payouts and to ensure authenticity against AI-generated content.
          </p>
        </div>
        <div className="w-full relative">
          <div className="flex flex-col gap-3">
            {documents.length === 0 ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-slate-500 transition-colors bg-slate-950/20">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <MdFolderOpen className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-400">Click to upload Government ID</p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG files only. Max 5MB.</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,image/jpeg,image/png,image/jpg" 
                  onChange={handleFileUpload} 
                />
              </label>
            ) : (
              <div className="flex flex-col gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-700/60 w-full">
                {documents[0].mimeType?.startsWith('image/') && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-700/80">
                    <img 
                      src={documents[0].previewUrl} 
                      alt="ID Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 truncate max-w-[80%] font-medium">
                    {documents[0].filename}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(0)}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-1 bg-red-950/20 rounded-lg transition-colors border border-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {errors.documents && (
          <p className="text-red-500 text-xs text-left w-full mt-1">{errors.documents}</p>
        )}

        {/* Terms and Conditions Checkbox */}
        <div className="w-full mt-6">
          <div className="flex items-start space-x-3 p-4 border border-slate-700/50 bg-slate-800/10 rounded-xl">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 rounded bg-slate-800 border-slate-700"
            />
            <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
              I confirm that all information is accurate and agree to the{' '}
              <a href="/terms-and-conditions" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a>.
            </label>
          </div>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs text-left w-full mt-1">{errors.terms}</p>
        )}

        {/* Actions Button (Back button removed) */}
        <div className="w-full max-w-[380px] mt-9 flex justify-center">
          <button 
            className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
              boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
            }}
            type="submit"
            disabled={submitLoading}
          >
            {submitLoading ? "Submitting..." : "Submit Application"}
          </button>
        </div>

        {submitError && (
          <p className="text-red-500 text-xs mt-4">{submitError}</p>
        )}
      </form>
    </div>
  );
};

export default React.memo(ArtistProfileDetails);