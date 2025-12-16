// src/components/artist/register/ArtistConfirmation.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ArtistConfirmation = ({ application }) => {
  if (!application) {
    return (
      <div className="text-white flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Loading Application Details...</h2>
          <p className="text-slate-300">Please wait while we load your application information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-2xl mx-auto text-center p-8">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold mb-4">Application Submitted Successfully!</h2>
        <p className="text-slate-300 mb-8">
          Thank you for submitting your artist application. Our team will review 
          it within 2-3 business days.
        </p>

        {/* Application Details Card */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-xl font-semibold mb-4">Application Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Application ID</p>
              <p className="text-slate-200 font-mono text-sm">{application.id}</p>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm">Stage Name</p>
              <p className="text-slate-200">{application.stageName}</p>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm">Status</p>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                <p className="text-yellow-400 font-medium">Pending Review</p>
              </div>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm">Submitted On</p>
              <p className="text-slate-200">
                {new Date(application.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-slate-400 text-sm">Documents Submitted</p>
              <p className="text-slate-200">{application.documents?.length || 0} document(s)</p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium mb-1">Document Verification</h4>
              <p className="text-sm text-slate-400">Our team will verify your submitted documents</p>
            </div>
            
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium mb-1">Email Notification</h4>
              <p className="text-sm text-slate-400">You'll receive an email once approved</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </Link>
          
          <Link
            to="/"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg border border-slate-600 transition-colors duration-200"
          >
            Back to Home
          </Link>
          
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors duration-200"
          >
            Print Confirmation
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@musicreset.com" className="text-blue-400 hover:text-blue-300">
              support@musicreset.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtistConfirmation;