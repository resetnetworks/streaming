import React from "react";
import {
  FaYoutube,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaHeadphones,
  FaEnvelope,
  FaLock,
  FaUserShield,
  FaShieldAlt,
} from "react-icons/fa";
import { IoMusicalNotes } from "react-icons/io5";
import { Link } from "react-router-dom";

const Footer = () => {
  // Trust badge data
  const trustBadges = [
    { src: "/images/razorpay.webp", alt: "Razorpay" },
    { src: "/images/paypal.webp", alt: "PayPal" },
    { src: "/images/stripe.webp", alt: "Stripe" },
    // { src: "/images/cloudflare.webp", alt: "Cloudflare" },
    { src: "/images/aws.webp", alt: "AWS" },
  ];

  return (
    <footer className="relative mt-8 bg-[#020216] text-white overflow-hidden">
      {/* Gradient Line at Top */}
      <div className="gradiant-line"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Discover */}
          <div className="space-y-5">
            <h3
              className="text-xl font-semibold text-[#4DB3FF] flex items-center space-x-2"
              style={{ fontFamily: "Jura" }}
            >
              <IoMusicalNotes />
              <span>Discover</span>
            </h3>
            <nav className="space-y-3">
              {[
                { name: "Become an Artist", link: "/artist/register" },
                { name: "Artists", link: "/artists" },
                { name: "Search", link: "/search" },
                { name: "Purchases", link: "/purchases" },
                { name: "Liked", link: "/liked-songs" },
              ].map(({ name, link }) => (
                <a
                  key={name}
                  href={link}
                  className="block text-gray-300 hover:text-[#4DB3FF] transition-all duration-300"
                  style={{ fontFamily: "Jura" }}
                >
                  {name}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-5">
            <h3
              className="text-xl font-semibold text-[#4DB3FF] flex items-center space-x-2"
              style={{ fontFamily: "Jura" }}
            >
              <FaHeadphones />
              <span>Legal</span>
            </h3>
            <nav className="space-y-2.5 text-sm">
              <Link
                to="/privacy-policy"
                className="block text-gray-300 hover:text-[#4DB3FF] transition-colors"
                style={{ fontFamily: "Jura" }}
              >
                Privacy Policy
              </Link>
              <Link
                to="/data-deletion"
                className="block text-gray-300 hover:text-[#4DB3FF] transition-colors"
                style={{ fontFamily: "Jura" }}
              >
                Data Deletion
              </Link>
              <Link
                to="/contact-us"
                className="block text-gray-300 hover:text-[#4DB3FF] transition-colors"
                style={{ fontFamily: "Jura" }}
              >
                Support
              </Link>
              <Link
                to="/report-issue"
                className="block text-gray-300 hover:text-[#4DB3FF] transition-colors"
                style={{ fontFamily: "Jura" }}
              >
                Report Issue
              </Link>
              <Link
                to="/terms-and-conditions"
                className="block text-gray-300 hover:text-[#4DB3FF] transition-colors"
                style={{ fontFamily: "Jura" }}
              >
                Terms &amp; Conditions
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-5">
            <h3
              className="text-xl font-semibold text-[#4DB3FF] flex items-center space-x-2"
              style={{ fontFamily: "Jura" }}
            >
              <FaEnvelope />
              <span>Connect</span>
            </h3>

            {/* Contact Info – fixed overflow */}
            <div className="space-y-3 text-sm">
              <a
                href="mailto:support@musicreset.com"
                className="block w-max truncate bg-white/5 rounded-lg px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                style={{ fontFamily: "Jura" }}
              >
                support@musicreset.com
              </a>
            </div>

            {/* Social Media */}
            <div>
              <h4
                className="text-sm font-medium text-[#4DB3FF] mb-3"
                style={{ fontFamily: "Jura" }}
              >
                Follow the Beat
              </h4>
              <div className="flex space-x-3">
                {[
                  {
                    icon: FaInstagram,
                    color: "hover:text-pink-400",
                    link: "https://www.instagram.com/reset.networks",
                  },
                  {
                    icon: FaTwitter,
                    color: "hover:text-[#4DB3FF]",
                    link: "https://x.com/reset_networks",
                  },
                  {
                    icon: FaFacebook,
                    color: "hover:text-[#4DB3FF]",
                    link: "https://www.facebook.com/reset.networks",
                  },
                  {
                    icon: FaYoutube,
                    color: "hover:text-red-400",
                    link: "https://www.youtube.com/channel/UCHwxzEv41zMXDVoWiJ3Qx1w",
                  },
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

        {/* Bottom Bar – Trust Badges + Copyright/Security in one row */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left: Copyright + Security */}
            <div className="flex flex-col items-center lg:items-start gap-1.5 text-xs text-gray-400">
              <span>© 2026 RESET NETWORKS (OPC) PRIVATE LIMITED.</span>

              <div className="flex items-center gap-4 text-gray-500">
                <div className="flex items-center gap-1.5">
                  <FaShieldAlt className="text-[11px] opacity-60" />
                  <span className="opacity-60">SSL Encryption</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <FaLock className="text-[11px] opacity-60" />
                  <span className="opacity-60">DMCA Protected</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <FaUserShield className="text-[11px] opacity-60" />
                  <span className="opacity-60">DDoS Protection</span>
                </div>
              </div>
            </div>

            {/* Right: Small trust badges */}
            <div className="flex items-center gap-3">
              {trustBadges.map((item, index) => (
                <img
                  key={index}
                  src={item.src}
                  alt={item.alt}
                  className="md:h-5 h-4 w-auto object-contain invert brightness-0 opacity-80"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="player-gradiant-line"></div>
    </footer>
  );
};

export default Footer;
