import React from 'react';
import { MdCheckCircle, MdHourglassEmpty, MdVerifiedUser, MdEmail } from 'react-icons/md';

const ArtistConfirmation = ({ formData }) => {
  return (
    <div className="text-white flex flex-col justify-around items-center">
      <div className="md:max-w-[90%] max-w-full mx-auto mt-4 md:mt-8 w-full">
        <div className='w-full max-w-full md:max-w-[90%] mx-auto'>
          
          {/* Main Confirmation Container */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700 text-center">
            
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
              <MdCheckCircle className="w-10 h-10 text-green-400" />
            </div>

            {/* Success Message */}
            <h2 className="text-xl md:text-3xl font-bold text-green-400 mb-4">
              Registration Successful!
            </h2>
            
            <p className="text-slate-300 text-base md:text-lg mb-2">
              Thank you for registering as an artist with Reset Music
            </p>

            {/* Verification Status */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-8 mt-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <MdHourglassEmpty className="md:w-6 md:h-6 w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-blue-300 text-sm md:text-lg font-semibold">
                  Account Under Verification
                </span>
              </div>
              <p className="text-slate-400 text-xs md:text-sm">
                Your account details and documents are being reviewed by our team. 
                This process usually takes 24-48 hours.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-slate-200 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left text-sm md:text-base">
                <div className="flex items-center gap-3">
                  <MdEmail className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Check your email for confirmation</span>
                </div>
                <div className="flex items-center gap-3">
                  <MdVerifiedUser className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Wait for verification approval</span>
                </div>
                <div className="flex items-center gap-3">
                  <MdCheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Start uploading your music once verified</span>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Your Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-slate-400 text-sm">Artist Name</p>
                  <p className="text-slate-200 font-medium">{formData.stageName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-slate-200 font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Account Holder</p>
                  <p className="text-slate-200 font-medium">{formData.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Documents Uploaded</p>
                  <p className="text-slate-200 font-medium">{formData.documents.length} files</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
  {/* Go to Dashboard Button */}
  <div className="button-wrapper cursor-pointer shadow-sm shadow-black">
    <button 
      onClick={() => window.location.href = '/artist/dashboard'}
      className="custom-button !min-w-full"
    >
      Go to Dashboard
    </button>
  </div>
  
  <button
    onClick={() => window.location.href = '/'}
    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200 border border-slate-600"
  >
    Back to Home
  </button>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistConfirmation;