import React from "react";
import { useNavigate } from "react-router-dom";
import { MdMusicNote } from "react-icons/md";

const AlbumCard = ({
  tag,
  artists,
  image,
  onClick,
  price,
  artistSlug,
  songsCount,
  album, // support object destructuring fallback
  artistName,
}) => {
  const navigate = useNavigate();

  // Map fields from nested album object if provided
  const finalTag = tag || album?.title || album?.tag || "Album";
  const finalArtists = artists || artistName || album?.artist?.name || album?.artists || "Various Artists";
  const finalImage = image || album?.coverImage || "/images/placeholder.png";
  const finalSongsCount = typeof songsCount === "number" ? songsCount : (album?.songs?.length ?? album?.songsCount);
  const finalArtistSlug = artistSlug || album?.artist?.slug;

  return (
    <div className="md:w-56 w-44 flex-shrink-0 cursor-pointer rounded-none overflow-hidden shadow-lg relative">
      <div className="relative" onClick={onClick}>
        <img
          src={finalImage}
          alt={`Album cover for ${finalTag} by ${finalArtists}`}
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
          <p className="text-sm font-semibold text-white">{finalTag}</p>
        </div>
      </div>

      <div className="w-full flex justify-between items-center bg-gray-800/40 md:p-4 p-3">
        {typeof finalSongsCount === "number" ? (
          <span className="text-[10px] text-slate-200 flex-shrink-0 font-medium text-left">
            {finalSongsCount} {finalSongsCount === 1 ? "track" : "tracks"}
          </span>
        ) : (
          <div />
        )}

        {finalArtistSlug ? (
          <span 
            className="text-xs text-white hover:underline cursor-pointer truncate max-w-[60%] font-semibold text-right"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/artist/${finalArtistSlug}`);
            }}
          >
            {finalArtists}
          </span>
        ) : (
          <span className="text-xs text-white truncate max-w-[60%] font-semibold text-right">
            {finalArtists}
          </span>
        )}
      </div>
    </div>
  );
};

export default AlbumCard;