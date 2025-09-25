import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets";
import { FaHome, FaMusic, FaHeadphones, FaQuestionCircle, FaShieldAlt, FaFileContract } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Data for Navigation Links (DRY Principle) ---
const navLinks = [
  { href: "/privacy-policy", text: "Privacy Policy", icon: <FaShieldAlt />, type: "route" },
  { href: "/terms-and-conditions", text: "Terms", icon: <FaFileContract />, type: "route" },
  { href: "/help", text: "Help", icon: <FaQuestionCircle />, type: "route" },
];

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle header background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function for navigation - handles both routes and scroll
  const handleNavClick = (e, href, type) => {
    e.preventDefault();
    
    if (type === "route") {
      // Navigate to route
      navigate(href);
    } else {
      // Smooth scroll to section
      document.querySelector(href)?.scrollIntoView({
        behavior: "smooth",
      });
    }
    
    // Close mobile menu on click
    setIsMenuOpen(false);
  };

  // --- Animation Variants for Framer Motion ---
  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  const mobileMenuVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "tween", ease: "circOut", duration: 0.5 } },
    exit: { x: "100%", opacity: 0, transition: { type: "tween", ease: "circIn", duration: 0.4 } },
  };

  const mobileLinkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 + 0.3, ease: "easeOut" },
    }),
  };

  return (
    <>
      <motion.header
        initial="initial"
        animate="animate"
        variants={headerVariants}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/30' : 'bg-transparent'
        }`}
      >
        <div className="w-full h-20 flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
          {/* Logo Section */}
          <motion.div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={assets.reset_icon}
              className="w-9 py-2 block"
              alt="reset studio icon"
            />
            <span className="text-xl font-bold text-white ml-2 tracking-wider group-hover:text-blue-400 transition-colors">
              resetmusic
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <motion.a
                key={link.text}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.type)}
                className="flex items-center gap-2 text-slate-300 hover:text-white font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-500/10"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {link.icon}
                <span className="hidden lg:inline">{link.text}</span>
                <span className="lg:hidden">{link.text.split(' ')[0]}</span> {/* Show only first word on smaller screens */}
              </motion.a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <motion.button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-sm font-semibold text-slate-300 rounded-full hover:text-white hover:bg-slate-700/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => navigate("/register")}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Register
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-transparent border-none cursor-pointer z-50 rounded-md transition-colors hover:bg-slate-800/60"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {/* Top bar */}
              <motion.div
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6.5 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-white rounded-full origin-center"
              ></motion.div>
              {/* Middle bar */}
              <motion.div
                animate={{ opacity: isMenuOpen ? 0 : 1, scaleX: isMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="w-6 h-0.5 bg-white rounded-full origin-center"
              ></motion.div>
              {/* Bottom bar */}
              <motion.div
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6.5 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-white rounded-full origin-center"
              ></motion.div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed top-0 right-0 w-full h-screen bg-slate-900/95 backdrop-blur-xl z-40"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {/* Navigation Links */}
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.text}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.type)}
                  className="flex items-center gap-3 text-2xl text-slate-300 hover:text-blue-400 font-medium transition-colors"
                  custom={i}
                  variants={mobileLinkVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {link.icon}
                  <span>{link.text}</span>
                </motion.a>
              ))}

              {/* Action Buttons for Mobile */}
              <div className="flex flex-col gap-6 mt-12 w-3/4 max-w-xs">
                <motion.button
                  onClick={() => { 
                    navigate("/login"); 
                    setIsMenuOpen(false); 
                  }}
                  className="w-full py-3 text-lg font-semibold text-slate-300 rounded-full border border-slate-600 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                  variants={mobileLinkVariants} 
                  custom={navLinks.length} 
                  initial="hidden" 
                  animate="visible"
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => { 
                    navigate("/register"); 
                    setIsMenuOpen(false); 
                  }}
                  className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-300"
                  variants={mobileLinkVariants} 
                  custom={navLinks.length + 1} 
                  initial="hidden" 
                  animate="visible"
                >
                  Register
                </motion.button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
