import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import { BsSoundwave } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

import RecentPlays from "../RecentPlays";
import { handlePlaySong } from "../../../utills/songHelpers";
import { useRandomArtistWithSongs } from "../../../hooks/api/useArtists";

const AlbumCard = ({ album, onClick, artistName, type }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="min-w-[140px] md:min-w-[160px] mx-1 flex-shrink-0 cursor-pointer group p-2"
      onClick={() => onClick(album)}
    >
      <div className="relative md:w-48 md:h-48 h-32 w-32 rounded-lg overflow-hidden bg-gray-700/50">
        {album.coverImage && !imageError ? (
          <>
            <img
              src={album.coverImage}
              alt=""
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-700/50 animate-pulse flex items-center justify-center">
                <BsSoundwave className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <BsSoundwave className="w-10 h-10 text-gray-400" />
          </div>
        )}

        {/* ✅ Badge - sirf type === "album" pe dikhega */}
        {type === "album" && (
          <div className="absolute top-0 right-2">
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-black backdrop-blur-sm text-blue-300 rounded-sm border-r-2 border-blue-400">
              Album
            </span>
          </div>
        )}
      </div>

      {/* Info - same as RecentPlays */}
      <div className="flex justify-between sm:items-center mt-2 sm:flex-row flex-col">
        <div className="leading-none">
          <p className="md:text-sm text-xs font-medium text-white truncate">
            {album.title?.length > 10 ? album.title.slice(0, 10) + ".." : album.title || "Untitled"}
          </p>
        </div>
      </div>
    </div>
  );
};

const SimilarArtistSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);

  // Use the React Query hook
  const { data: randomArtistData, isLoading, error } = useRandomArtistWithSongs();
  
  // Extract data from the response
  const randomArtist = randomArtistData?.artist;
  const albums = randomArtistData?.albums || [];
  const singles = randomArtistData?.singles || [];

  // Handle album click
  const handleAlbumClick = (album) => {
    navigate(`/album/${album.slug}`);
  };

  // Scroll handler
  const handleScroll = (direction = "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  // Handle song play
  const handleSongPlay = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch]);

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <div className="flex md:gap-2 gap-4 items-center">
          <Skeleton circle width={48} height={48} />
          <div className="flex flex-col gap-1">
            <Skeleton width={80} height={14} />
            <Skeleton width={100} height={18} />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[...Array(4)].map((_, idx) => (
            <div key={`similar-skeleton-${idx}`} className="flex-shrink-0">
              <div className="w-44 p-4">
                <Skeleton height={144} width={144} className="rounded-lg mb-3" />
                <Skeleton width={120} height={16} className="mb-2" />
                <Skeleton width={80} height={12} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Handle error state - just return null, no error message
  if (error || !randomArtist) {
    return null;
  }

  // If no albums and no singles, return null
  if (albums.length === 0 && singles.length === 0) {
    return null;
  }

  return (
    <>
      {/* Artist Header */}
      <div className="flex md:gap-2 gap-4 items-center mb-4">
        <img
          src={randomArtist?.profileImage}
          alt={randomArtist?.name}
          className="md:w-12 md:h-12 w-8 h-8 object-cover rounded-full border-blue-800 border shadow-[0_0_5px_1px_#3b82f6]"
        />
        <div>
          <h2 className="text-blue-400 text-base leading-none">explore more</h2>
          <p
            onClick={() => navigate(`/artist/${randomArtist.slug}`)}
            className="text-lg leading-none text-white hover:underline cursor-pointer"
          >
            {randomArtist.name}
          </p>
        </div>

        {/* Back and Next buttons (desktop) */}
        {(albums.length > 0 || singles.length > 0) && (
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              title="Back"
            >
              <LuSquareChevronLeft />
            </button>
            <button
              type="button"
              className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              title="Next"
            >
              <LuSquareChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Albums and Singles in one row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar"
      >

         {/* Show Singles as RecentPlays */}
       {singles.map((song) => (
  <RecentPlays
    key={`song-${song._id}`}
    type="single"
    songId={song._id}                                          // ✅ add
    title={song.title}
    singer={song.artist?.name || ""}                          // ✅ add
    image={song.coverImage || "/images/placeholder.png"}
    onTitleClick={() => navigate(`/song/${song?.slug || song?._id}`)}
    onPlay={() => handleSongPlay(song)}
    isSelected={selectedSong?._id === song._id}
    // price prop removed ✅
  />
))}

        
        {/* Show Albums first */}
        {albums.map((album) => (
          <AlbumCard
            key={`album-${album._id}`}
            type="album"
            album={{
              _id: album._id,
              title: album.title,
              coverImage: album.coverImage
            }}
            artistName={randomArtist.name}
            onClick={() => handleAlbumClick(album)}
          />
        ))}
      </div>
    </>
  );
};

export default SimilarArtistSection;