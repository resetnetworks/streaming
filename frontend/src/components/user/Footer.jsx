import React from 'react';
import {  
  FaYoutube, 
  FaInstagram, 
  FaTwitter, 
  FaFacebook,
  FaMusic,
  FaHeadphones,
  FaVolumeUp,
  FaEnvelope,
  FaLock,
  FaUserShield,
  FaShieldAlt
} from 'react-icons/fa';
import { IoMusicalNotes } from 'react-icons/io5';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br mt-20 from-[#020216] via-[#0d1b3f] to-[#0a0a23] text-white overflow-hidden">
      {/* Background Musical Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 text-5xl text-[#88b2ef] animate-pulse">
          <IoMusicalNotes />
        </div>
        <div className="absolute top-32 right-20 text-3xl text-[#1e3bf4] animate-bounce">
          <BsMusicNoteBeamed />
        </div>
        <div className="absolute bottom-20 left-1/4 text-4xl text-[#3b82f6] animate-pulse">
          <FaMusic />
        </div>
        <div className="absolute bottom-32 right-1/3 text-2xl text-[#007aff] animate-bounce">
          <FaHeadphones />
        </div>
      </div>

      {/* Gradient Line at Top */}
      <div className="gradiant-line"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="play-pause-wrapper">
                  <button className="play-pause-button flex items-center justify-center">
                    <FaVolumeUp className="text-lg" />
                  </button>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Jura' }}>
                Musicreset
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed" style={{ fontFamily: 'Jura' }}>
              Experience the ultimate musical journey with our cutting-edge streaming platform. 
              Where every beat comes to life.
            </p>
          </div>

          {/* Discover */}
          <div className="space-y-6">
            <h3
              className="text-xl font-semibold text-[#88b2ef] flex items-center space-x-2"
              style={{ fontFamily: 'Jura' }}
            >
              <IoMusicalNotes />
              <span>Discover</span>
            </h3>
            <nav className="space-y-4">
              {[
                { name: 'Artists', link: '/artists' },
                { name: 'Search', link: '/search' },
                { name: 'Purchases', link: '/purchases' },
                { name: 'Liked', link: '/liked-songs' },
                { name: 'Become an Artist', link: '/artist/register' },
              ].map(({ name, link }) => (
                <a
                  key={name}
                  href={link}
                  className="block text-gray-300 hover:text-[#3b82f6] transition-all duration-300"
                  style={{ fontFamily: 'Jura' }}
                >
                  {name}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal Links (moved up, replacing Protected) */}
          <div className="space-y-6">
            <h3
              className="text-xl font-semibold text-[#88b2ef] flex items-center space-x-2"
              style={{ fontFamily: 'Jura' }}
            >
              <FaHeadphones />
              <span>Legal</span>
            </h3>
            <nav className="space-y-3 text-sm">
              <Link
                to="/privacy-policy"
                className="block text-gray-300 hover:text-[#3b82f6] transition-colors"
                style={{ fontFamily: 'Jura' }}
              >
                Privacy Policy
              </Link>
              <Link
                to="/careers"
                className="block text-gray-300 hover:text-[#3b82f6] transition-colors"
                style={{ fontFamily: 'Jura' }}
              >
                Careers
              </Link>
              <Link
                to="/data-deletion"
                className="block text-gray-300 hover:text-[#3b82f6] transition-colors"
                style={{ fontFamily: 'Jura' }}
              >
                Data Deletion
              </Link>
              <Link
                to="/contact-us"
                className="block text-gray-300 hover:text-[#3b82f6] transition-colors"
                style={{ fontFamily: 'Jura' }}
              >
                Support
              </Link>
              <Link
                to="/terms-and-conditions"
                className="block text-gray-300 hover:text-[#3b82f6] transition-colors"
                style={{ fontFamily: 'Jura' }}
              >
                Terms &amp; Conditions
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-6">
            <h3
              className="text-xl font-semibold text-[#88b2ef] flex items-center space-x-2"
              style={{ fontFamily: 'Jura' }}
            >
              <FaEnvelope />
              <span>Connect</span>
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-4 text-sm">
              {[
                { icon: FaEnvelope, text: 'contact@reset93.net', href: 'mailto:contact@reset93.net' },
              ].map(({ icon: Icon, text, href }, index) => (
                <div key={index} className="player-wrapper w-full">
                  <a 
                    href={href}
                    className="player-card p-3 flex items-center space-x-3 text-gray-300 hover:text-white transform"
                  >
                    <Icon className="text-[#3b82f6]" />
                    <span style={{ fontFamily: 'Jura' }}>{text}</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div>
              <h4
                className="text-sm font-medium text-[#88b2ef] mb-4"
                style={{ fontFamily: 'Jura' }}
              >
                Follow the Beat
              </h4>
              <div className="flex space-x-3">
                {[
                  { icon: FaInstagram, color: 'hover:text-pink-400', link: 'https://www.instagram.com/reset.networks' },
                  { icon: FaTwitter, color: 'hover:text-[#1e3bf4]', link: 'https://x.com/reset_networks' },
                  { icon: FaFacebook, color: 'hover:text-[#3b82f6]', link: 'https://www.facebook.com/reset.networks' },
                  { icon: FaYoutube, color: 'hover:text-red-400', link: 'https://www.youtube.com/channel/UCHwxzEv41zMXDVoWiJ3Qx1w' },
                ].map(({ icon: Icon, color, link }, index) => (
                  <div key={index} className="play-pause-wrapper">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`play-pause-button flex items-center justify-center text-gray-400 ${color} transition-all duration-300 hover:scale-110 transform`}
                    >
                      <Icon className="text-sm" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8">
          <div className="gradiant-line mb-6"></div>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            {/* Left: Copyright + Protected (low emphasis) */}
            <div className="space-y-2">
              <div
                className="text-gray-400 text-sm flex items-center space-x-2"
                style={{ fontFamily: 'Jura' }}
              >
                <span>© 2025 RESET NETWORKS (OPC) PRIVATE LIMITED.</span>
              </div>
              {/* Protected moved down here, subtle */}
              <div
                className="flex flex-wrap items-center gap-4 text-xs text-gray-500"
                style={{ fontFamily: 'Jura' }}
              >
                <div className="flex items-center space-x-2">
                  <FaShieldAlt className="text-[13px] opacity-70" />
                  <span>SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaLock className="text-[13px] opacity-70" />
                  <span>DMCA Protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUserShield className="text-[13px] opacity-70" />
                  <span>DDoS Protection</span>
                </div>
              </div>
            </div>

            {/* Right side empty now (legal moved up), but keep flex for balance */}
            <div className="hidden md:block" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="player-gradiant-line"></div>
    </footer>
  );
};

export default Footer;
