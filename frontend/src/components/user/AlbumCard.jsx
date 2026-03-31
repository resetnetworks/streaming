import React from "react";
import { MdMusicNote } from "react-icons/md";

const AlbumCard = ({
  tag,
  artists,
  image,
  onClick,
  price,
}) => {
  return (
    <div className="md:w-56 w-44 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden shadow-lg relative">
      <div className="relative" onClick={onClick}>
        <img
          src={image}
          alt={`Album cover for ${tag} by ${artists}`}
          className="w-full md:h-48 h-36 object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(16, 21, 62, 0.56) 68.83%, #0E43CA 100%)",
          }}
        />
        <div className="absolute bottom-4 px-4 left-0 right-0 flex justify-center text-wrap text-center items-center h-4">
          <p className="text-sm font-semibold text-white">{tag}</p>
        </div>
      </div>

      <div className="w-full flex justify-between items-center bg-gray-800/40 md:p-4 p-3">
        {/* Left - Label */}
        <p className="text-xs text-gray-100 tracking-wide">by artist</p>

        {/* Right - Artist Name */}
        <p className="text-xs text-white font-semibold truncate max-w-[60%] text-right">{artists}</p>
      </div>
    </div>
  );
};

export default AlbumCard;