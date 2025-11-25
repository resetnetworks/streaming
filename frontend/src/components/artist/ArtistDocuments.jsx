import React from 'react';
import { MdPerson, MdAccountBalance, MdPayment } from 'react-icons/md';

const ArtistDocuments = ({ formData, updateFormData, prevStep, submitForm }) => {

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    updateFormData('documents', [...formData.documents, ...files]);
  };

  const removeDocument = (index) => {
    const updatedDocs = formData.documents.filter((_, i) => i !== index);
    updateFormData('documents', updatedDocs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.documents.length === 0) {
      alert("Please upload at least one document");
      return;
    }
    if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode) {
      alert("Please fill all account details");
      return;
    }
    submitForm();
  };

  return (
    <div className="text-white flex flex-col justify-around items-center">
      <form 
        className="md:max-w-[90%] max-w-full mx-auto mt-4 md:mt-8 w-full"
        onSubmit={handleSubmit}
      >
        <div className='w-full md:max-w-[90%] max-w-full mx-auto'>
          
          {/* Main Form Container */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
            
            {/* Account Details Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-300 mb-6">Account Details</h2>
              
              <div className="space-y-4 md:space-y-5">
                {/* Account Holder Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Holder Name *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="Enter account holder name"
                      className="input-login pl-10"
                      value={formData.accountHolderName || ''}
                      onChange={(e) => updateFormData('accountHolderName', e.target.value)}
                    />
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                {/* Account Number Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Number *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="Enter account number"
                      className="input-login pl-10"
                      value={formData.accountNumber || ''}
                      onChange={(e) => updateFormData('accountNumber', e.target.value)}
                    />
                    <MdPayment className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                {/* IFSC Code Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    IFSC Code *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="Enter IFSC code"
                      className="input-login pl-10"
                      value={formData.ifscCode || ''}
                      onChange={(e) => updateFormData('ifscCode', e.target.value)}
                    />
                    <MdAccountBalance className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                {/* IBAN/SWIFT Field (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    IBAN/SWIFT Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter IBAN or SWIFT code (optional)"
                      className="input-login pl-10"
                      value={formData.ibanSwift || ''}
                      onChange={(e) => updateFormData('ibanSwift', e.target.value)}
                    />
                    <MdAccountBalance className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Upload Documents *
              </label>
              <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-8 md:p-12 text-center bg-slate-800/30 hover:border-slate-500 transition-colors">
                <input
                  required
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-slate-400 text-sm md:text-base">
                    <p className="mb-1">Drop files to attach, or{' '}
                      <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Support for images, audio files, and documents
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {formData.documents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Uploaded Files:</h3>
                <div className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                      <span className="text-slate-300 text-sm truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3 bg-slate-700 text-white font-medium rounded-lg border border-slate-600 hover:bg-slate-600 transition-all duration-200"
              >
                Back
              </button>
              
              {/* Create Artist Account Button */}
              <div className="button-wrapper cursor-pointer shadow-sm shadow-black w-full mx-auto">
                <button className="custom-button !w-full" type="submit">
                  create account
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtistDocuments;