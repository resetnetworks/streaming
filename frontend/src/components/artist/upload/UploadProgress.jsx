//this component related to artist album upload steps

import React from "react";
import { FiMusic, FiCheck } from "react-icons/fi";

const UploadProgress = ({ 
  currentIndex, 
  totalSongs, 
  currentProgress, 
  currentSongName 
}) => {
  const percentage = Math.round((currentIndex / totalSongs) * 100 + (currentProgress / totalSongs));
  
  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg">Uploading Album Songs</h3>
        <span className="text-blue-400">
          {currentIndex + 1} of {totalSongs}
        </span>
      </div>
      
      {/* Main progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>0%</span>
          <span>{Math.min(percentage, 100)}%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Current song info */}
      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg mb-4">
        <div className="w-12 h-12 bg-blue-900/30 rounded flex items-center justify-center">
          <FiMusic className="text-blue-400" size={24} />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium truncate">
            {currentSongName || `Track ${currentIndex + 1}`}
          </p>
          <p className="text-gray-400 text-sm">
            Uploading song {currentIndex + 1} of {totalSongs}
          </p>
        </div>
        <div className="text-right">
          <div className="text-blue-400 text-lg font-mono">
            {currentProgress}%
          </div>
          <div className="text-gray-500 text-xs">
            Current file
          </div>
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-between">
        {Array.from({ length: totalSongs }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm
              ${index < currentIndex 
                ? 'bg-green-500 text-white' 
                : index === currentIndex 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-400'
              }
            `}>
              {index < currentIndex ? (
                <FiCheck size={14} />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs mt-1 ${
              index === currentIndex ? 'text-blue-400' : 'text-gray-500'
            }`}>
              {index === currentIndex ? 'Now' : index < currentIndex ? 'Done' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
      
      <p className="text-gray-400 text-sm text-center mt-6">
        Please don't close this window while upload is in progress.
      </p>
    </div>
  );
};

export default UploadProgress;