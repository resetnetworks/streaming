// src/components/artist/register/ArtistConfirmation.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMyApplication } from '../../../hooks/api/useArtistApplications';
import { 
  MdCheckCircle, 
  MdOutlineVerified, 
  MdHome, 
  MdHourglassEmpty,
  MdCancel,
  MdRefresh
} from 'react-icons/md';
import Loader from '../../Loader';
const ArtistConfirmation = ({ onReapply }) => {
  const myApplicationQuery = useMyApplication();
  const application = myApplicationQuery.data;

  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // If loading
  if (myApplicationQuery.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
        <Loader noBg={true} />
        <p className="text-slate-400 text-sm mt-4">
          Loading your application details
        </p>
      </div>
    );
  }

  // If no application found
  if (!application) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-white">
        <h2 className="text-xl font-bold mb-2">No Application Found</h2>
        <p className="text-slate-400 text-sm">
          We couldn't retrieve your artist application details.
        </p>
      </div>
    );
  }

  const applicationId = application?._id || application?.id || `ART${Date.now().toString().slice(-6)}`;
  const submittedDate = application?.createdAt || new Date().toISOString();
  const status = application?.status || 'submitted';
  const stageName = application?.stageName || "N/A";

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
  };  const statusConfig = getStatusConfig();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 w-full max-w-[650px] mx-auto mt-6">
      <div 
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
      >
        {/* Status Icon */}
        <div className="mb-4 flex items-center justify-center">
          {statusConfig.icon}
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {statusConfig.title}
        </h1>
        
        <p className="text-slate-400 text-sm mb-6 text-center">
          {statusConfig.subtitle}
        </p>

        {/* Application Details Card */}
        <div className="bg-slate-950/40 rounded-xl p-5 mb-6 border border-slate-700/60 w-full">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`w-2.5 h-2.5 ${statusConfig.statusColor === 'text-yellow-400' ? 'bg-yellow-500' : 
                           statusConfig.statusColor === 'text-green-400' ? 'bg-green-500' :
                           statusConfig.statusColor === 'text-red-400' ? 'bg-red-500' : 'bg-blue-500'} 
                           rounded-full animate-pulse`}></div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${statusConfig.statusColor}`}>
              {statusConfig.statusText}
            </span>
          </div>
          
          <div className="space-y-2.5 text-xs">
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
            <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
              <p className="text-red-300 text-xs">
                <span className="font-semibold">Reason:</span> {application.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Next Steps based on status */}
        <div className="mb-6 w-full">
          <h3 className="text-sm font-semibold mb-3 text-slate-300 uppercase tracking-wider">What's Next?</h3>
          <div className="space-y-3">
            {status === 'pending' || status === 'under_review' ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs">1</span>
                  </div>
                  <p className="text-slate-400 text-xs text-left leading-relaxed">
                    We'll verify your application within 2-3 business days.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs">2</span>
                  </div>
                  <p className="text-slate-400 text-xs text-left leading-relaxed">
                    You'll receive an email confirmation once approved.
                  </p>
                </div>
              </>
            ) : status === 'approved' ? (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-xs">✓</span>
                </div>
                <p className="text-slate-400 text-xs text-left leading-relaxed">
                  Your artist dashboard is now available. You can upload music and manage your profile.
                </p>
              </div>
            ) : status === 'rejected' ? (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs">!</span>
                </div>
                <p className="text-slate-400 text-xs text-left leading-relaxed">
                  You can submit a new application with corrected information.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-[380px] mt-4 flex justify-center">
          {status === 'approved' ? (
            <Link
              to="/artist/dashboard"
              className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 text-center"
              style={{
                background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
              }}
            >
              Go to Artist Dashboard
            </Link>
          ) : statusConfig.showReapply && onReapply ? (
            <button
              onClick={onReapply}
              className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
              }}
            >
              <MdRefresh className="w-4 h-4" />
              Apply Again
            </button>
          ) : (
            <Link
              to="/home"
              className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 text-center"
              style={{
                background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
              }}
            >
              <MdHome className="w-4 h-4" />
              Go to Home Page
            </Link>
          )}
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 w-full text-center">
          <p className="text-slate-500 text-xs">
            Need help? Contact{' '}
            <a href="mailto:support@musicreset.com" className="text-blue-400 hover:underline">
              support@musicreset.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtistConfirmation;