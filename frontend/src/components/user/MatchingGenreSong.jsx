import React from "react";
import { RiPlayFill, RiPauseFill } from "react-icons/ri";

const MatchingGenreSong = React.forwardRef(
  (
    { title, artist, image, album, duration, price, onPlay, isPlaying, isSelected },
    ref
  ) => {
    const truncatedTitle = title?.length > 12 ? title.slice(0, 12) + "…" : title;
    const truncatedArtist =
      artist?.name?.length > 12 ? artist.name.slice(0, 12) + "…" : artist?.name;

    const handleCardClick = () => {
      if (onPlay) onPlay();
    };

    const handleOverlayButtonClick = (e) => {
      e.stopPropagation();
      if (onPlay) onPlay();
    };

    return (
      <div
        ref={ref}
        onClick={handleCardClick}
        className="min-w-[140px] md:min-w-[160px] mx-1 flex-shrink-0 cursor-pointer group"
      >
        {/* Image wrapper */}
        <div
          className={`relative h-32 w-32 md:h-44 md:w-44 rounded-lg overflow-hidden transition-all duration-300
            ${isSelected || isPlaying ? "border-2 border-blue-500 shadow-[0_0_8px_1px_#3b82f6]" : ""}
          `}
        >
          <img
            src={image || album?.coverImage || "/default-song.jpg"}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* Hover Overlay with Center Play/Pause Btn */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="bg-white text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
              onClick={handleOverlayButtonClick}
              aria-label={isPlaying ? "Pause" : "Play"}
              type="button"
            >
              {isPlaying ? <RiPauseFill size={18} /> : <RiPlayFill size={18} />}
            </button>
          </div>

          {/* Extra Gradient Strip when playing */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
          )}
        </div>

        {/* Info Section */}
        <div className="mt-2 flex justify-between items-start gap-2">
          <div className="flex flex-col min-w-0">
            <p className="text-white font-medium text-sm truncate">{truncatedTitle}</p>
            <span className="text-gray-400 text-xs truncate">{truncatedArtist}</span>
          </div>

          {/* Price / Duration */}
          {price ? (
            // price can be string/number or a button node from the parent
            typeof price === "string" || typeof price === "number" ? (
              <div className="text-xs ml-1 flex-shrink-0 text-blue-300 font-semibold">{price}</div>
            ) : (
              <div className="text-xs ml-1 flex-shrink-0">{price}</div>
            )
          ) : duration ? (
            <span className="text-gray-500 text-[11px] font-mono mt-0.5 flex-shrink-0">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

MatchingGenreSong.displayName = "MatchingGenreSong";
export default MatchingGenreSong;
