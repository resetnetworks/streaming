// SubscribeModal.js को update करें
import React from "react";
import { FaLock, FaTimes, FaUser, FaShoppingCart, FaPlay } from 'react-icons/fa';
import { IoMusicalNotes } from 'react-icons/io5';

const SubscribeModal = ({ open, artist, onClose, onNavigate, type = "play", itemData = null }) => {
  if (!open || !artist) return null;

  const isPurchaseModal = type === "purchase";
  const isPurchaseOnlySong = itemData?.accessType === "purchase-only";

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
                {isPurchaseModal ? (
                  <FaShoppingCart className="text-3xl text-[#88b2ef] animate-pulse" />
                ) : (
                  <FaLock className="text-3xl text-[#88b2ef] animate-pulse" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#3b82f6] animate-ping opacity-20"></div>
            </div>

            {/* Dynamic Badge */}
            <div className="px-4 py-1 bg-gradient-to-r from-[#3b82f6] to-[#007aff] rounded-full text-xs font-medium text-white flex items-center space-x-2">
              <IoMusicalNotes className="text-sm" />
              <span style={{ fontFamily: 'Jura' }}>
                {isPurchaseModal && isPurchaseOnlySong ? 'Purchase Required' : 
                 isPurchaseModal ? 'Subscription Required' : 'Premium Content'}
              </span>
            </div>

            {/* Dynamic Title */}
            <div className="text-center space-y-2">
              <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Jura' }}>
                {isPurchaseModal && isPurchaseOnlySong ? 'Subscribe → Purchase → Play' :
                 isPurchaseModal ? 'Subscribe First to Purchase' : 'Subscribe to Play'}
              </h2>
              <div className="flex items-center justify-center space-x-2 text-[#88b2ef]">
                <FaUser className="text-sm" />
                <span className="font-semibold" style={{ fontFamily: 'Jura' }}>
                  {artist.name}
                </span>
              </div>
            </div>

            {/* Dynamic Description */}
            <div className="text-center space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: 'Jura' }}>
                {isPurchaseModal && isPurchaseOnlySong ? (
                  'Subscribe to the artist first, then purchase this content to enjoy unlimited access.'
                ) : isPurchaseModal ? (
                  'You need to subscribe to this artist before purchasing their content.'
                ) : (
                  'This track is available only to subscribers.'
                )}
              </p>

              {/* Purchase Steps Indicator */}
              {isPurchaseModal && isPurchaseOnlySong && (
                <div className="flex justify-center space-x-2 mt-4">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-xs text-gray-400">Subscribe</span>
                  </div>
                  <div className="w-4 h-0.5 bg-[#88b2ef] mt-4"></div>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-xs text-gray-400">Purchase</span>
                  </div>
                  <div className="w-4 h-0.5 bg-gray-600 mt-4"></div>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-xs text-gray-400">Play</span>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>High Quality</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Ad-Free</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Exclusive</span>
                </div>
              </div>
            </div>

            {/* ✅ Single Action Button - Goes to Artist Page */}
            <div className="w-full">
              <button
                className="w-full py-3 px-4 bg-transparent border border-[#88b2ef]/60 hover:border-[#88b2ef]/90 rounded-lg text-white transition-all duration-300 text-sm font-medium"
                onClick={onNavigate}
                style={{ fontFamily: 'Jura' }}
              >
                Subscribe Now
              </button>
            </div>

            {/* Bottom Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Jura' }}>
                {isPurchaseModal && isPurchaseOnlySong ? 
                  'Premium content requires subscription + purchase' :
                  'Support your favorite artists'
                }
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
