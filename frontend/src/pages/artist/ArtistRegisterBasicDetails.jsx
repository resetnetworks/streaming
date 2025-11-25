import React, { useState } from 'react'
import BackgroundWrapper from "../../components/BackgroundWrapper";
import IconHeader from "../../components/user/IconHeader";
import ProgressTracker from '../../components/artist/ProgressTracker';
import { MdOutlineEmail, MdPerson, MdPublic, MdLanguage, MdShare, MdCloudUpload } from 'react-icons/md';

const ArtistRegister = () => {
  const [profileImage, setProfileImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(png|jpg|jpeg|gif|webp)/i)) {
        alert("Please select a valid image file (PNG, JPG, JPEG, GIF, WebP)");
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
      
      console.log('Selected file:', file);
    }
  };

  return (
    <>
      <BackgroundWrapper>
        <IconHeader/>
        <section className='mx-4 text-white'>
          <h1 className='md:text-4xl text-3xl text-center mt-4 md:mt-8'>
            <span className='text-blue-700'>sign up, </span>as an artist
          </h1>
          <ProgressTracker currentStep={2} />

          <form className="max-w-[90%] mx-auto mt-4 md:mt-8">
            <div className='w-full max-w-[90%] mx-auto'>
              
              {/* Main Form Container */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
                
                {/* Profile Section with Form Fields */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  
                  {/* Profile Image Section */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-32 h-32 md:w-80 md:h-80 bg-slate-700 rounded-xl overflow-hidden border-2 border-slate-600">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
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
                    
                    {/* Updated Upload Button */}
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
                        {profileImage ? 'Change Photo' : 'Upload Photo'}
                      </label>
                    </div>

                    {/* Remove Photo Button (Only show when image is uploaded) */}
                    {profileImage && (
                      <button
                        type="button"
                        onClick={() => setProfileImage(null)}
                        className="mt-2 w-full px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-transparent hover:bg-red-500/10 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>

                  {/* Form Fields Section */}
                  <div className="flex-1 space-y-4 md:space-y-5">
                    
                    {/* Artist First Name Field with Icon */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Artist First Name
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          name="firstName"
                          placeholder="John"
                          className="input-login pl-10"
                        />
                        <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Artist Last Name
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          name="lastName"
                          placeholder="Smith"
                          className="input-login pl-10"
                        />
                        <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Stage Name
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          name="lastName"
                          placeholder="Lady Gaga"
                          className="input-login pl-10"
                        />
                        <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                    </div>

                    {/* Email Field with Icon */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="email"
                          name="email"
                          placeholder="allison.malone@smentertainment.com"
                          className="input-login pl-10"
                        />
                        <MdOutlineEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                    </div>

                    {/* Country Selection with Icon */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <select
                          required
                          name="country"
                          className="input-login pl-10 appearance-none"
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

                    {/* Website Field with Icon */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Website URL
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          name="website"
                          placeholder="www.allisonmusic.com"
                          className="input-login pl-10"
                        />
                        <MdLanguage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Field - Full Width with Icon */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Social Media Profile
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="url"
                      name="socialMedia"
                      placeholder="https://www.twitter.com/allisonmalone"
                      className="input-login pl-10"
                    />
                    <MdShare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="mt-8">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Upload Documents
                  </label>
                  <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-8 md:p-12 text-center bg-slate-800/30 hover:border-slate-500 transition-colors">
                    <input
                      required
                      type="file"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*,audio/*,.pdf,.doc,.docx"
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Continue to Next Step
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      </BackgroundWrapper>
    </>
  )
}

export default ArtistRegister
