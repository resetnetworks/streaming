import React from "react";
import { RiPlayFill, RiPauseFill } from "react-icons/ri";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";

const RecentPlays = React.forwardRef(
  ({ 
    title, 
    singer, 
    image, 
    price, 
    onPlay, 
    onTitleClick,
    isSelected,
    songId,
    type,
    showControls=true
  }, ref) => {

    const { isSongPlaying, isSongSelected, pausePlayback, resumePlayback } = usePlaybackControl();
    
    const handlePlayClick = (e) => {
      e.stopPropagation();
      if (isSongSelected(songId)) {
        isSongPlaying(songId) ? pausePlayback() : resumePlayback();
      } else {
        if (onPlay) onPlay();
      }
    };

    const handleTitleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (onTitleClick) onTitleClick();
    };

    const handleCardClick = () => {
      if (isSongSelected(songId)) {
        isSongPlaying(songId) ? pausePlayback() : resumePlayback();
      } else {
        if (onPlay) onPlay();
      }
    };

    const truncatedTitle = title.length > 10 ? title.slice(0, 25) + ".." : title;

    return (
      <div
        ref={ref}
        className="min-w-[140px] md:min-w-[160px] mx-1 flex-shrink-0 cursor-pointer group p-2"
        onClick={handleCardClick}
      >
        <div
          className={`relative md:w-48 md:h-48 h-32 w-32 rounded-lg overflow-hidden 
            ${isSelected ? "border-2 border-blue-500 shadow-[0_0_8px_1px_#3b82f6]" : ""}`}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* ✅ Badge - sirf type === "single" pe dikhega */}
          {type === "single" && (
            <div className="absolute top-0 right-2">
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-black backdrop-blur-sm text-gray-200 rounded-sm border-r-2 border-gray-300">
                Single
              </span>
            </div>
          )}

          <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-20 transition">
            {showControls ? (
  <button 
    onClick={handlePlayClick}
    className="absolute bottom-2 left-2 bg-gray-200 text-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110"
  >
    {isSongPlaying(songId) ? <RiPauseFill size={14} /> : <RiPlayFill size={14} />}
  </button>
) : (
  <div>
  </div>
)}
          </div>
        </div>

        <div className="flex justify-between sm:items-center mt-2 sm:flex-row flex-col">
          <div className="leading-none">
            <button onClick={handleTitleClick} className="text-left">
              <p className="md:text-sm text-xs font-medium text-white truncate hover:underline transition-colors">
                {truncatedTitle}
              </p>
            </button>
            <span className="text-blue-500 text-xs truncate">{singer}</span>
          </div>
          {price && (
            <div className="text-blue-500 text-xs font-semibold">
              {typeof price === "string" ? price : price}
            </div>
          )}
        </div>
      </div>
    );
  }
);

RecentPlays.displayName = "RecentPlays";
export default RecentPlays;