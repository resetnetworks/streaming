// src/components/artist/register/ArtistConfirmation.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MdCheckCircle, 
  MdOutlineVerified, 
  MdHome, 
  MdHourglassEmpty,
  MdCancel,
  MdRefresh
} from 'react-icons/md';

const ArtistConfirmation = ({ onReapply }) => {
  const { 
    formData, 
    submittedApplication, 
    myApplication 
  } = useSelector((state) => state.artistApplication);

  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Determine which application to show
  const application = submittedApplication || myApplication;
  
  // If no application found (shouldn't happen if this component is shown)
  if (!application && !formData) {
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

  const applicationId = application?.id || `ART${Date.now().toString().slice(-6)}`;
  const submittedDate = application?.createdAt || new Date().toISOString();
  const status = application?.status || 'submitted';
  const stageName = application?.stageName || formData?.stageName || "N/A";

  // Get status configuration
  const getStatusConfig = () => {
    switch(status) {
      case 'pending':
      case 'under_review':
      case 'submitted':
        return {
          icon: <MdHourglassEmpty className="w-12 h-12 text-yellow-500" />,
          title: "Application Submitted",
          subtitle: "Your application is under verification",
          color: "bg-yellow-500/10 border-yellow-500/20",
          statusText: "Under Review",
          statusColor: "text-yellow-400",
          showReapply: false
        };
      case 'approved':
        return {
          icon: <MdCheckCircle className="w-12 h-12 text-green-500" />,
          title: "Application Approved",
          subtitle: "Congratulations! Your artist account is ready",
          color: "bg-green-500/10 border-green-500/20",
          statusText: "Approved",
          statusColor: "text-green-400",
          showReapply: false
        };
      case 'rejected':
        return {
          icon: <MdCancel className="w-12 h-12 text-red-500" />,
          title: "Application Rejected",
          subtitle: application?.rejectionReason || "Your application was not approved",
          color: "bg-red-500/10 border-red-500/20",
          statusText: "Rejected",
          statusColor: "text-red-400",
          showReapply: true
        };
      default:
        return {
          icon: <MdOutlineVerified className="w-12 h-12 text-blue-500" />,
          title: "Application Received",
          subtitle: "We have received your application",
          color: "bg-blue-500/10 border-blue-500/20",
          statusText: "Received",
          statusColor: "text-blue-400",
          showReapply: false
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="max-w-[90%] mx-auto text-center">
        {/* Status Icon and Title */}
        <div className="mb-6 flex items-center justify-center">
          {statusConfig.icon}
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          {statusConfig.title}
        </h1>
        
        <p className="text-slate-300 text-lg mb-8">
          {statusConfig.subtitle}
        </p>

        {/* Application Details Card */}
        <div className={`${statusConfig.color} rounded-xl p-6 mb-8 border max-w-md mx-auto`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 ${statusConfig.statusColor === 'text-yellow-400' ? 'bg-yellow-500' : 
                           statusConfig.statusColor === 'text-green-400' ? 'bg-green-500' :
                           statusConfig.statusColor === 'text-red-400' ? 'bg-red-500' : 'bg-blue-500'} 
                           rounded-full animate-pulse`}></div>
            <span className={`font-medium ${statusConfig.statusColor}`}>
              {statusConfig.statusText}
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Application ID:</span>
              <span className="text-white font-mono">{applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Artist Name:</span>
              <span className="text-white font-medium">{stageName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Submitted:</span>
              <span className="text-white">{formatDate(submittedDate)}</span>
            </div>
          </div>

          {/* Show rejection reason if applicable */}
          {status === 'rejected' && application?.rejectionReason && (
            <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded">
              <p className="text-red-300 text-sm">
                <span className="font-medium">Reason:</span> {application.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Next Steps based on status */}
        <div className="mb-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-slate-300">What's Next?</h3>
          <div className="space-y-3">
            {status === 'pending' || status === 'under_review' ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">1</span>
                  </div>
                  <p className="text-slate-400 text-sm text-left">
                    We'll verify your application within 2-3 business days
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">2</span>
                  </div>
                  <p className="text-slate-400 text-sm text-left">
                    You'll receive an email confirmation once approved
                  </p>
                </div>
              </>
            ) : status === 'approved' ? (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <p className="text-slate-400 text-sm text-left">
                  Your artist dashboard is now available. You can upload music and manage your profile.
                </p>
              </div>
            ) : status === 'rejected' ? (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-sm">!</span>
                </div>
                <p className="text-slate-400 text-sm text-left">
                  You can submit a new application with corrected information.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 max-w-md mx-auto">
          {status === 'approved' ? (
            <Link
              to="/artist/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 w-full"
            >
              Go to Artist Dashboard
            </Link>
          ) : statusConfig.showReapply && onReapply ? (
            <button
              onClick={onReapply}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 w-full"
            >
              <MdRefresh className="w-5 h-5" />
              Apply Again
            </button>
          ) : (
            <Link
              to="/home"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 w-full"
            >
              <MdHome className="w-5 h-5" />
              Go to Home Page
            </Link>
          )}
          
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors duration-200 w-full"
          >
            Print Confirmation
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-slate-700 max-w-md mx-auto">
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