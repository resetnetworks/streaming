import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets";
import { FaHome, FaMusic, FaHeadphones, FaUser, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className='absolute top-0 left-0 w-full z-30'>
        <header className="w-full h-20 flex justify-between items-center px-6 md:px-12 backdrop-blur-lg border-b border-blue-500/30">
          
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer transition-all duration-300 hover:-translate-y-1 group" 
            onClick={() => navigate("/")}
          >
            <img 
              src={assets.reset_icon} 
              className="w-9 py-2 block cursor-pointer group-hover:scale-110 transition-transform duration-300" 
              alt="reset studio icon"
            />
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#home" 
              className="flex items-center gap-2 text-slate-300 hover:text-blue-400 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-500/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Home</span>
            </a>
            <a 
              href="#discover" 
              className="flex items-center gap-2 text-slate-300 hover:text-blue-400 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-500/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <FaMusic className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Discover</span>
            </a>
            <a 
              href="#listen" 
              className="flex items-center gap-2 text-slate-300 hover:text-blue-400 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-500/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <FaHeadphones className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Listen</span>
            </a>
          </nav>
          
          {/* Action Buttons - Both using same class for same size */}
          <div className="flex items-center gap-3">
            {/* Register Button */}
            <div className="button-wrapper hidden sm:block">
              <button 
                className="custom-button flex items-center justify-center gap-2 text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 !w-[120px] !h-[40px]"
                onClick={() => navigate("/register")}
              >
                <FaUserPlus className="text-sm" />
                <span>Register</span>
              </button>
            </div>
            
            {/* Login Button - Using same button-wrapper and custom-button class */}
            <div className="button-wrapper hidden sm:block">
              <button 
                className="custom-button flex items-center justify-center gap-2 text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 !w-[120px] !h-[40px]"
                onClick={() => navigate("/login")}
              >
                <FaUser className="text-sm" />
                <span>Login</span>
              </button>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-transparent border-none cursor-pointer z-50 transition-all duration-300 hover:bg-blue-500/20 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FaTimes className="text-white text-xl transition-transform duration-300 hover:rotate-90" />
              ) : (
                <FaBars className="text-white text-xl transition-transform duration-300 hover:scale-110" />
              )}
            </button>
          </div>
        </header>
        
        {/* Mobile Navigation Menu */}
        <nav className={`md:hidden absolute top-20 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-blue-500/30 transition-all duration-500 transform ${
          isMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
        }`}>
          <div className="flex flex-col items-center py-8 gap-6">
            <a 
              href="#home" 
              className="flex items-center gap-3 text-slate-300 hover:text-blue-400 font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Home</span>
            </a>
            <a 
              href="#discover" 
              className="flex items-center gap-3 text-slate-300 hover:text-blue-400 font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaMusic className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Discover</span>
            </a>
            <a 
              href="#listen" 
              className="flex items-center gap-3 text-slate-300 hover:text-blue-400 font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHeadphones className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Listen</span>
            </a>
            
            {/* Mobile Action Buttons - Both using same class */}
            <div className="flex flex-col gap-4 mt-6 w-full px-6">
              <div className="button-wrapper w-full">
                <button 
                  className="custom-button flex items-center justify-center gap-2 text-sm font-semibold w-full !h-[48px] hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    navigate("/register");
                    setIsMenuOpen(false);
                  }}
                >
                  <FaUserPlus />
                  Register
                </button>
              </div>
              
              <div className="button-wrapper w-full">
                <button 
                  className="custom-button flex items-center justify-center gap-2 text-sm font-semibold w-full !h-[48px] hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  <FaUser />
                  Login
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="gradiant-line"></div>
      </div>
    </>
  );
};

export default Header;
