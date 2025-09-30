import React, { useState } from 'react';
import { FaHeadphones, FaMicrophone, FaWaveSquare, FaCreditCard, FaGlobe, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import "../../../styles/LandingPage.css";

const HeroSection = ({ scrollContainerRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const handleStartStreaming = () => {
    navigate('/home');
  };
  const handleSignUpAsArtist =()=>{
    window.open('https://forms.wix.com/f/7377232876368036493', '_blank');
  }

  return (
    <div className="landing-content-overlay">
      <div className="landing-hero-content sm:mt-14 mt-6">
        
        {/* ✅ Modern Hero Title Section */}
        <motion.div 
          className="text-center mb-12 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          
          {/* Main Title */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{
              textShadow: '0 0 30px rgba(96, 165, 250, 0.2)'
            }}
          >
            Introducing{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Reset Music
            </span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-300">
              Streaming Platform
            </span>
          </motion.h1>
        </motion.div>
        
        {/* ✅ Value Proposition */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed mb-8">
            The Platform For The Next Generation{' '}
            <span className="text-white font-medium">Musicians</span>,{' '}
            <span className="text-white font-medium">Sound designers</span>,{' '}
            <span className="text-white font-medium">Listeners</span> and{' '}
            <span className="text-white font-medium">Audiophiles</span>
          </h2>
        </motion.div>
        
        {/* ✅ CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        >
          <motion.button 
            onClick={handleStartStreaming}
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-3">
              <FaPlay className="text-sm group-hover:scale-110 transition-transform" />
              Start Streaming Now
            </span>
          </motion.button>
          
          <motion.button
            onClick={handleSignUpAsArtist} 
            className="group border-2 border-gray-400 hover:border-blue-400 text-white font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 hover:bg-blue-400/10 hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-3">
              <FaHeadphones className="text-sm group-hover:scale-110 transition-transform" />
              sign up as an artist
            </span>
          </motion.button>
        </motion.div>
        
        {/* ✅ Feature Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          
          {/* Monthly Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/40 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaCreditCard className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors">
              Monthly Subscription/One Time Purchases
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
              Flexible plans with monthly subscriptions or one-time purchases to suit your music needs
            </p>
          </motion.div>

          {/* Multi-Currency Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/40 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaGlobe className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors">
              Multi-Currency Support
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-200 transition-colors">
              Seamless payments with multi-currency support
            </p>
            
            {/* Currency Badges */}
            <div className="flex justify-center gap-2 flex-wrap">
              {['USD', 'GBP', 'EUR', 'JPY'].map((currency) => (
                <span 
                  key={currency} 
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors"
                >
                  {currency}
                </span>
              ))}
            </div>
          </motion.div>

          {/* UI/UX Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/40 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaHeadphones className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors">
              Gorgeous Player and Intuitive UI
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
              Sleek, stunning player with a smooth, intuitive UI for effortless music navigation
            </p>
          </motion.div>
          
        </motion.div>

      </div>
    </div>
  );
};

export default HeroSection;
