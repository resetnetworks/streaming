import React, { useState } from 'react';
import { FaHeadphones, FaMicrophone, FaWaveSquare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import "../../../styles/LandingPage.css";

const HeroSection = ({ scrollContainerRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const handleStartStreaming = () => {
    navigate('/home');
  };

  return (
    <div className="landing-content-overlay">
      <div className="landing-hero-content sm:mt-14 mt-6">
        <h1 className="landing-hero-title">
          <span>STREAM </span>
          <span className="accent">YOUR </span>
          <span>BEATS</span>
        </h1>
        
        <div className="landing-hero-subtitle">
          <span>Reset Music DJ Streaming Platform</span>
        </div>
        
        <p className="landing-hero-description">
          Connect with music lovers worldwide. Stream live DJ sets, 
          build your audience, and share your passion with the world.
        </p>
        
        {/* 🔹 Button Container with Framer Motion Fade-Up */}
        <motion.div
          className="landing-buttons-container flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <button 
            onClick={handleStartStreaming}
            className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:bg-blue-600 hover:scale-105 transform"
          >
            Start Streaming Now
          </button>
          <button className="border border-white text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 transform">
            Watch Demo
          </button>
        </motion.div>
        
        <div className="landing-features-container">
          <div className="player-wrapper">
            <div className="player-card landing-feature-card">
              <FaMicrophone className="text-3xl mb-3 text-blue-400" />
              <h3 className="text-lg font-bold mb-2">Live Streaming</h3>
              <p className="text-sm opacity-80">Broadcast HD quality music to global audience</p>
            </div>
          </div>
          
          <div className="player-wrapper">
            <div className="player-card landing-feature-card">
              <FaHeadphones className="text-3xl mb-3 text-blue-400" />
              <h3 className="text-lg font-bold mb-2">Interactive Chat</h3>
              <p className="text-sm opacity-80">Connect with listeners in real-time</p>
            </div>
          </div>
          
          <div className="player-wrapper">
            <div className="player-card landing-feature-card">
              <FaWaveSquare className="text-3xl mb-3 text-blue-400" />
              <h3 className="text-lg font-bold mb-2">Pro Tools</h3>
              <p className="text-sm opacity-80">Advanced mixing and effects</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
