import React from 'react';
import '../styles/BackgroundWrapper.css';


const BackgroundWrapper = ({ 
  children, 
  className = "",
  fullHeight = true,
  showOverlays = true 
}) => {
  return (
    <div className={`background-container ${className}`}>
      {/* Background overlays - conditionally render */}
      {showOverlays && (
        <>
          <div className="diagonal-overlay-1"></div>
          <div className="diagonal-overlay-2"></div>
          <div className="diagonal-overlay-3"></div>
          <div className="diagonal-overlay-4"></div>
          <div className="pattern-overlay"></div>
        </>
      )}
      
      {/* Content wrapper with proper z-index */}
      <div className={`content-wrapper ${fullHeight ? 'min-h-screen' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
