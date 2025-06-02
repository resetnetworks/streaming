import React from "react";
import Img from "../images/player.jpg";

const AlbumCard = ({
  tag = "#electronic",
  artists = "Julian Gomez, Noah Rosa and more",
  image = Img,
}) => {
  return (
    <div className="md:w-56 w-32 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden shadow-lg relative">
      <div className="relative">
        <img
          src={image}
          alt="Electronic Music"
          className="w-full md:h-48 h-32 object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(16, 21, 62, 0.56) 36.83%, #0E43CA 100%)",
          }}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center h-4">
          <p className="text-sm font-semibold text-white">{tag}</p>
        </div>
      </div>

      <div className="w-full bg-gray-800/40 md:p-4 p-3">
        <p className="text-xs text-white text-wrap">{artists}</p>
      </div>
    </div>
  );
};

export default AlbumCard;
