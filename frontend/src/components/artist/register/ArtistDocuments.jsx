// src/components/artist/register/ArtistDocuments.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { MdKeyboardDoubleArrowLeft, MdLink } from "react-icons/md";
import { 
  submitArtistApplication,
  addDocument,
  removeDocument,
  addSample,
  removeSample,
  clearSubmitState
} from '../../../features/artistApplications/artistApplicationSlice';

const DOCUMENT_TYPES = {
  GOV_ID: 'gov_id',
  PROOF_OF_ADDRESS: 'proof_of_address',
  TAX_ID: 'tax_id',
  PORTFOLIO: 'portfolio',
  OTHER: 'other'
};

const ArtistDocuments = ({ prevStep, submitForm }) => {
  const dispatch = useDispatch();
  const { formData, submitLoading, submitError } = useSelector((state) => state.artistApplication);

  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES.GOV_ID);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sampleUrl, setSampleUrl] = useState('');
  const [sampleTitle, setSampleTitle] = useState('profile');

  // Ensure documents array exists
  const documents = formData?.documents || [];
  const samples = formData?.samples || [];

  const handleFileUpload = (e) => {    
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      return;
    }

    files.forEach(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Please upload PDF, JPG, or PNG files.`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Max size is 5MB.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      const document = {
        previewUrl,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        docType: selectedDocType,
        uploadedAt: new Date().toISOString(),
        file: file
      };
      
      dispatch(addDocument(document));
    });

    e.target.value = '';
  };

  const handleRemoveDocument = (index) => {
    const doc = documents[index];
    if (doc && doc.previewUrl) {
      URL.revokeObjectURL(doc.previewUrl);
    }
    dispatch(removeDocument(index));
  };

  const handleAddSample = () => {
    if (!sampleUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (!sampleTitle.trim()) {
      toast.error('Please enter a title for the sample');
      return;
    }

    try {
      const url = new URL(sampleUrl);
      
      const sample = {
        title: sampleTitle.trim(),
        url: sampleUrl.trim(),
        durationSeconds: null,
        addedAt: new Date().toISOString()
      };
      
      dispatch(addSample(sample));
      setSampleUrl('');
      setSampleTitle('');
      toast.success('Sample added successfully!');
    } catch (error) {
      toast.error('Please enter a valid URL (e.g., https://soundcloud.com/artist/track)');
    }
  };

  const handleRemoveSample = (index) => {
    dispatch(removeSample(index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.stageName?.trim()) {
      newErrors.stageName = 'Stage Name is required';
    }
    
    if (!formData?.country) {
      newErrors.country = 'Country is required';
    }
    
    if (documents.length === 0) {
      newErrors.documents = 'At least one document is required';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareFormDataForSubmission = () => {
    const formDataToSend = new FormData();
    
    // 1. Basic Text Fields
    formDataToSend.append('stageName', formData?.stageName?.trim() || '');
    formDataToSend.append('legalName', `${formData?.firstName || ''}${formData?.lastName ? ' ' + formData.lastName : ''}`.trim());
    formDataToSend.append('bio', formData?.bio?.trim() || "");
    formDataToSend.append('country', (formData?.country || '').toUpperCase());
    
    // 2. Contact Information
    formDataToSend.append('contact[email]', formData?.email || '');
    if (formData?.website && formData.website.trim() !== '') {
      formDataToSend.append('contact[website]', formData.website.trim());
    }
    
    // 3. Social Media Links
    if (formData?.socialMedia && formData.socialMedia.trim() !== '') {
      formDataToSend.append('socials[0][provider]', 'website');
      formDataToSend.append('socials[0][url]', formData.socialMedia.trim());
    }
    
    // 4. Documents - Actual Files and Metadata
    documents.forEach((doc, index) => {
      if (doc.file && doc.file instanceof File) {
        // Append the actual file with a proper name
        formDataToSend.append('documents', doc.file, doc.filename || `document-${index}`);
        
        // Append metadata using array notation
        formDataToSend.append(`documentTypes[${index}]`, doc.docType || DOCUMENT_TYPES.OTHER);
        formDataToSend.append(`documentFilenames[${index}]`, doc.filename || `document-${index}.${doc.mimeType?.split('/')[1] || 'pdf'}`);
      }
    });
    
    // 5. Samples
    samples.forEach((sample, index) => {
      formDataToSend.append(`samples[${index}][title]`, sample.title || '');
      formDataToSend.append(`samples[${index}][url]`, sample.url || '');
      formDataToSend.append(`samples[${index}][durationSeconds]`, sample.durationSeconds || '');
    });

    return formDataToSend;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch(clearSubmitState());
    
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        toast.error(errors[firstError]);
      }
      return;
    }

    try {
      const formDataToSend = prepareFormDataForSubmission();
      
      const result = await dispatch(submitArtistApplication(formDataToSend)).unwrap();
      
      toast.success("Artist application submitted successfully!");
      
      // Clean up preview URLs
      documents.forEach(doc => {
        if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      });
      
      submitForm();
      
    } catch (error) {
      console.error('Submission error:', error);
      if (typeof error === 'string') {
        if (error.includes('Cast to Embedded failed for value')) {
          toast.error("Data format error. Please check your information.");
        } else if (error.includes('country')) {
          toast.error("Invalid country code. Please select a valid 2-letter country code.");
        } else if (error.includes('stageName')) {
          toast.error("Stage Name is required. Please enter your stage name.");
        } else if (error.includes('file')) {
          toast.error("File upload error. Please check file sizes and formats.");
        } else {
          toast.error(error || "Failed to submit application. Please try again.");
        }
      } else if (error?.message) {
        toast.error(error.message || "Failed to submit application. Please try again.");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    }
  };

  // Fixed reduce calculation with optional chaining
  const totalDocSize = documents.reduce((sum, doc) => sum + (doc?.size || 0), 0);

  return (
    <div className="text-white flex flex-col justify-around items-center">
      <form 
        className="md:max-w-[90%] max-w-full mx-auto mt-4 md:mt-8 w-full"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className='w-full max-w-full md:max-w-[90%] mx-auto'>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
            
            <div className="mb-8 p-4 bg-slate-800/30 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Profile Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">Stage Name:</span>
                  <span className="text-slate-200 ml-2 font-medium">{formData?.stageName || 'Not set'}</span>
                  {errors.stageName && <p className="text-red-500 text-xs mt-1">{errors.stageName}</p>}
                </div>
                <div>
                  <span className="text-slate-400">Country:</span>
                  <span className="text-slate-200 ml-2 font-medium">{formData?.country || 'Not set'}</span>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200 ml-2">{formData?.email || 'Not set'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400">Bio:</span>
                  <span className="text-slate-200 ml-2">
                    {formData?.bio ? `${formData.bio.substring(0, 50)}${formData.bio.length > 50 ? '...' : ''}` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Document Type *
              </label>
              <select
                className="input-login"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                required
              >
                <option value={DOCUMENT_TYPES.GOV_ID}>Government ID (Passport/Driver's License)</option>
                <option value={DOCUMENT_TYPES.PROOF_OF_ADDRESS}>Proof of Address (Utility Bill/Bank Statement)</option>
                <option value={DOCUMENT_TYPES.TAX_ID}>Tax ID (PAN/GSTIN)</option>
                <option value={DOCUMENT_TYPES.PORTFOLIO}>Portfolio/Music Credentials</option>
                <option value={DOCUMENT_TYPES.OTHER}>Other Document</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select the type of document you're uploading
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-300 mb-4">
                Required Documents *
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Upload your {selectedDocType.replace('_', ' ')} document for verification
              </p>
              
              <label className="block relative border-2 border-dashed border-slate-600 rounded-xl p-8 text-center bg-slate-800/30 hover:border-slate-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">
                    Drop documents here or{' '}
                    <span className="text-blue-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG files only. Max 5MB per file.
                  </p>
                </div>
              </label>
              
              {errors.documents && (
                <p className="text-red-500 text-sm mt-2">{errors.documents}</p>
              )}

              {documents.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-300">
                      Uploaded Documents ({documents.length})
                    </h4>
                    <span className="text-xs text-slate-500">
                      Total: {(totalDocSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <span className="text-slate-300 text-sm block">{doc.filename}</span>
                            <span className="text-xs text-slate-500">
                              {(doc.size / 1024).toFixed(1)} KB • {doc.docType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-300 mb-4">
                Music Samples (Optional)
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Add links to your music on platforms like SoundCloud, YouTube, Spotify, etc.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      bandcamp/soundcloud url
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://soundcloud.com/artist/track"
                        className="input-login pl-10"
                        value={sampleUrl}
                        onChange={(e) => setSampleUrl(e.target.value)}
                      />
                      <MdLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddSample}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 w-full sm:w-auto"
                >
                  Add Sample
                </button>
              </div>

              {samples.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Added Samples ({samples.length})
                  </h4>
                  <div className="space-y-2">
                    {samples.map((sample, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <div>
                            <span className="text-slate-300 text-sm block">{sample.title}</span>
                            <span className="text-xs text-slate-500 truncate max-w-xs block">
                              {sample.url}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSample(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 space-y-4">
              <div className={`p-4 border rounded-lg transition-colors ${errors.terms ? 'border-red-500/20 bg-red-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: undefined }));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 bg-slate-700 border-slate-600"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-300">
                    I confirm that all information provided is accurate and complete. 
                    I agree to the <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a> and 
                    <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline ml-1">Privacy Policy</a>. 
                    I understand that submitting false information may result in rejection or 
                    termination of my artist account.
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm mt-2">{errors.terms}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg border border-slate-600 transition-colors duration-200"
                disabled={submitLoading}
              >
                <MdKeyboardDoubleArrowLeft />
              </button>
              
              <div className="button-wrapper cursor-pointer shadow-sm shadow-black w-full mx-auto">
                <button 
                  className="custom-button !w-full" 
                  type="submit"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm font-medium mb-1">Submission Error</p>
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            {submitLoading && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Submitting your application. Please don't close this window...
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtistDocuments;