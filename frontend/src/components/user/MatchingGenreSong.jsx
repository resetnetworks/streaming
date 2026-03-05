import React from "react";
import { RiPlayFill, RiPauseFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedSong, play, pause } from "../../features/playback/playerSlice";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";

const MatchingGenreSong = React.forwardRef(
  ({ title, artist, image, album, onPlay, isPlaying, isSelected, songId }, ref) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isActuallyPlaying = useSelector((state) => state.player.isPlaying);
    const selectedSong = useSelector((state) => state.player.selectedSong);
    const { isSongPlaying, isSongSelected, pausePlayback, resumePlayback } = usePlaybackControl();
    
    const isCurrent = selectedSong?._id === songId;
    const truncatedTitle = title?.length > 12 ? title.slice(0, 12) + "…" : title;

  const handleCardClick = () => {
  if (isSongSelected(songId)) {
    if (isSongPlaying(songId)) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  } else {
    if (onPlay) onPlay();
  }
};

    const handleTitleClick = (e) => {
      e.stopPropagation();
      if (songId) navigate(`/song/${songId}`);
    };

const handlePlayClick = (e) => {
  e.stopPropagation();
  
  if (isSongSelected(songId)) {
    // ✅ Same song hai — sirf play/pause toggle karo, restart nahi
    if (isSongPlaying(songId)) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  } else {
    if (onPlay) onPlay();
  }
};

    const showPause = isCurrent && isActuallyPlaying;

    return (
      <div
        ref={ref}
        onClick={handleCardClick}
        className="min-w-[140px] md:min-w-[160px] mx-1 flex-shrink-0 cursor-pointer group"
      >
        {/* Image wrapper */}
        <div className={`relative h-32 w-32 md:h-44 md:w-44 rounded-lg overflow-hidden transition-all duration-300
          ${isSelected || isPlaying ? "border-2 border-blue-500 shadow-[0_0_8px_1px_#3b82f6]" : ""}`}
        >
          <img
            src={image || album?.coverImage || "/default-song.jpg"}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* Single tag */}
          <div className="absolute top-0 right-2">
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-black backdrop-blur-sm text-gray-200 rounded-sm border-r-2 border-gray-300">
              Single
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-20 transition">
            <button
              onClick={handlePlayClick}
              className="absolute bottom-2 left-2 bg-gray-200 text-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110"
              aria-label={showPause ? "Pause" : "Play"}
              type="button"
            >
              {isSongPlaying(songId) ? <RiPauseFill size={14} /> : <RiPlayFill size={14} />}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-2 flex justify-between items-start gap-2">
          <p
            className="text-white font-medium text-sm truncate hover:underline cursor-pointer"
            onClick={handleTitleClick}
          >
            {truncatedTitle}
          </p>
          <span className="text-gray-200 text-[10px] flex-shrink-0 text-right mt-0.5 max-w-[55px] truncate">
            {artist?.name?.length > 7 ? artist.name.slice(0, 7) + "…" : artist?.name}
          </span>
        </div>
      </div>
    );
  }
);

MatchingGenreSong.displayName = "MatchingGenreSong";
export default MatchingGenreSong;