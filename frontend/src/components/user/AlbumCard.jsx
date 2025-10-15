import React from "react";

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
          className="w-full md:h-48 h-36 object-cover"
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

      {/* Single responsive container with flex direction change */}
      <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-800/40 md:p-4 p-3 gap-2 sm:gap-0">
        <p className="text-xs text-white text-wrap text-left">{artists}</p>
        {price && (
          <div className="text-xs">
            {typeof price === "string" ? price : price}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumCard;
