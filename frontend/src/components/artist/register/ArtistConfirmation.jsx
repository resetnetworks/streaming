// src/components/artist/register/ArtistConfirmation.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdCheckCircle, MdOutlineVerified, MdHome } from 'react-icons/md';

const ArtistConfirmation = () => {
  const { formData, latestApplication } = useSelector((state) => state.artistApplication);

  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!formData && !latestApplication) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
        <p className="text-slate-400 text-sm">
          Loading your application details
        </p>
      </div>
    );
  }

  const application = latestApplication || formData;
  const applicationId = application.id || `ART${Date.now().toString().slice(-6)}`;
  const submittedDate = application.createdAt || new Date().toISOString();

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="max-w-[90%] mx-auto text-center">

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Application Submitted Successfully!
        </h1>
        
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl w-[45%] p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 font-medium">Under Verification</span>
          </div>
          
          <p className="text-slate-300 mb-6">
            Your artist application is now under verification. Once confirmed, you'll get access to your artist dashboard where you can upload music and manage your profile.
          </p>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Application ID:</span>
              <span className="text-white font-mono">{applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Artist Name:</span>
              <span className="text-white font-medium">{application.stageName || formData.stageName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Submitted:</span>
              <span className="text-white">
                {new Date(submittedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Simple Next Steps */}
        <div className="mb-8 w-[45%]">
          <h3 className="text-lg font-semibold mb-4 text-slate-300">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm">1</span>
              </div>
              <p className="text-slate-400 text-sm text-left">
                We'll verify your application within 2-3 business days
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink NA-0 mt-0.5">
                <span className="text-blue-400 text-sm">2</span>
              </div>
              <p className="text-slate-400 text-sm text-left">
                You'll receive an email confirmation once approved
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm">3</span>
              </div>
              <p className="text-slate-400 text-sm text-left">
                Access your artist dashboard to upload music and manage your profile
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <Link
            to="/home"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 w-full"
          >
            <MdHome className="w-5 h-5" />
            Go to Home Page
          </Link>
          
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors duration-200 w-full"
          >
            Print Confirmation
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-xs">
            Need help? Contact{' '}
            <a href="mailto:contact@reset93.net" className="text-blue-400 hover:text-blue-300">
              contact@reset93.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtistConfirmation;