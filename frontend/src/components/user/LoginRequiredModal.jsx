// LoginRequiredModal.js
import React from "react";
import { FaTimes, FaUser, FaSignInAlt, FaShoppingCart, FaPlay, FaDownload } from 'react-icons/fa';
import { IoMusicalNotes } from 'react-icons/io5';

const LoginRequiredModal = ({ 
  open, 
  onClose, 
  onLogin, 
  type = "play",           // "play", "purchase", "download", "custom"
  contentType = "song",    // "song", "album", "playlist", "video", etc.
  customTitle = null,
  customMessage = null,
  itemData = null
}) => {
  if (!open) return null;

  // Dynamic badge text
  const getBadgeText = () => {
    if (customMessage) return "Login Required";
    switch (type) {
      case "purchase":
        return "Purchase Requires Login";
      case "download":
        return "Download Requires Login";
      case "play":
        return "Play Requires Login";
      default:
        return "Login Required";
    }
  };

  // Dynamic title
  const getTitle = () => {
    if (customTitle) return customTitle;
    switch (type) {
      case "purchase":
        return `Login to Purchase ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`;
      case "download":
        return `Login to Download ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`;
      case "play":
        return `Login to Play ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`;
      default:
        return "Login Required";
    }
  };

  // Dynamic description
  const getDescription = () => {
    if (customMessage) return customMessage;
    switch (type) {
      case "purchase":
        return `You need to log in to purchase this ${contentType}. Please login to complete your purchase and support the artist.`;
      case "download":
        return `You need to log in to download this ${contentType}. Please login to access and save this content.`;
      case "play":
        return `You need to log in to play this ${contentType}. Please login to enjoy unlimited streaming.`;
      default:
        return `You need to log in to access this ${contentType}. Please login to continue.`;
    }
  };

  // Dynamic icon based on type
  const getIcon = () => {
    switch (type) {
      case "purchase":
        return <FaShoppingCart className="text-3xl text-[#88b2ef]" />;
      case "download":
        return <FaDownload className="text-3xl text-[#88b2ef]" />;
      case "play":
        return <FaPlay className="text-3xl text-[#88b2ef]" />;
      default:
        return <FaSignInAlt className="text-3xl text-[#88b2ef]" />;
    }
  };

  // Handle login button click
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Fallback: redirect to login page
      window.location.href = "/login";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm mx-4">
        <div className="player-wrapper">
          <div className="player-card rounded-2xl p-8 flex flex-col items-center gap-6 animate-scaleIn">
            
            {/* Close button */}
            <button
              className="absolute top-4 right-4 play-pause-wrapper"
              onClick={onClose}
              aria-label="Close"
            >
              <div className="play-pause-button w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300">
                <FaTimes className="text-sm" />
              </div>
            </button>

            {/* Dynamic Icon */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0d1b3f] to-[#020216] rounded-full flex items-center justify-center shadow-2xl border border-[#88b2ef]/30">
                {getIcon()}
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#3b82f6] opacity-20"></div>
            </div>

            {/* Dynamic Badge */}
            <div className="px-4 py-1 bg-gradient-to-r from-[#3b82f6] to-[#007aff] rounded-full text-xs font-medium text-white flex items-center space-x-2">
              <IoMusicalNotes className="text-sm" />
              <span>
                {getBadgeText()}
              </span>
            </div>

            {/* Dynamic Title */}
            <div className="text-center space-y-2">
              <h2 className="text-white font-bold text-xl">
                {getTitle()}
              </h2>
              <div className="flex items-center justify-center space-x-2 text-[#88b2ef]">
                <FaUser className="text-sm" />
                <span className="font-semibold">
                  Account Required
                </span>
              </div>
            </div>

            {/* Dynamic Description */}
            <div className="text-center">
              <p className="text-gray-300 text-sm leading-relaxed">
                {getDescription()}
              </p>
            </div>

            {/* Login Button */}
            <div className="w-full">
              <button
                className="w-full py-3 px-4 bg-transparent border border-[#88b2ef]/60 hover:border-[#88b2ef]/40 rounded-lg text-white transition-all duration-300 text-sm font-medium"
                onClick={handleLogin}
            
              >
                Login Now
              </button>
            </div>

            {/* Bottom Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                New user?{" "}
                <button 
                  onClick={handleLogin}
                  className="text-[#88b2ef]"
                >
                  Sign up for free
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;