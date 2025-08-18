import React from 'react';
import { 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Brand & Copyright */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block w-px h-6 bg-gray-700"></div>
            <p className="text-gray-400 text-sm">
             © 2025 RESET NETWORKS (OPC) PRIVATE LIMITED
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-xs">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300">
              Privacy |
            </Link>
            <Link to="/help" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-1">
              <span>Help |</span>
            </Link>
            <Link to="/data-deletion" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-1">
              <span>data deletion |</span>
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm hidden md:inline">Follow us</span>
            <div className="flex space-x-3">
              <Link
              target="_blank"
  rel="noopener noreferrer"
              to="https://x.com/reset_networks" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <FaTwitter className="text-lg" />
              </Link>
              <Link
              target="_blank"
  rel="noopener noreferrer"
               to="https://www.instagram.com/reset.networks/" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">
                <FaInstagram className="text-lg" />
              </Link>
              <Link
              target="_blank"
  rel="noopener noreferrer"
              to="https://www.youtube.com/channel/UCHwxzEv41zMXDVoWiJ3Qx1w" className="text-gray-400 hover:text-red-400 transition-colors duration-300">
                <FaYoutube className="text-lg" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mini Status Bar */}
        <div className="mt-4 pt-3 border-t border-gray-800/30">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
            <div className="sm:flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                CIN: U92100WB20210PC243771 - GSTIN: 19AAKCR8658Q1Z3
              </span>
              <div className='flex sm:justify-between justify-center sm:mt-0 mt-2'>
            <img src="/images/copyscape.avif" alt="copyscape logo" className='object-contain'/>
            <img src="/images/dmca_protected.avif" alt="dmca protected logo" className='object-contain ml-2'/>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Subtle gradient line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
    </footer>
  );
};

export default Footer;
