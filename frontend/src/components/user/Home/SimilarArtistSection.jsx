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

// Album Card Component (same as MatchingGenreSection)
const AlbumCard = ({ album, onClick, artistName }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasImage, setHasImage] = useState(!!album.coverImage);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setHasImage(false);
    setImageLoaded(false);
  };

  return (
    <div 
      className="flex-shrink-0 cursor-pointer"
      onClick={() => onClick(album)}
    >
      <div className="relative w-44 bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-xl p-4 backdrop-blur-md border border-white/10 hover:border-blue-400/30 transition-all duration-300">
        
        {/* Album Cover Container */}
        <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-700/50">
          {hasImage && album.coverImage && !imageError ? (
            <>
              {/* Image */}
              <img
                src={album.coverImage}
                alt=""
                className={`w-full h-36 object-cover ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
              
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-700/50 animate-pulse flex items-center justify-center">
                  <BsSoundwave className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </>
          ) : (
            /* No Image Placeholder */
            <div className="w-full h-36 bg-gradient-to-br from-gray-700/70 to-gray-800/70 flex items-center justify-center group-hover:from-gray-600/70 group-hover:to-gray-700/70 transition-all duration-300">
              <div className="text-center">
                <BsSoundwave className="w-12 h-12 text-gray-400 mx-auto mb-2 group-hover:text-gray-300 transition-colors" />
                <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">No Cover</p>
              </div>
            </div>
          )}
        </div>

        {/* Album Info */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-blue-400 transition-colors">
            {album.title || 'Untitled Album'}
          </h3>
          <p className="text-gray-400 text-xs truncate mb-1">
            Album
          </p>
          {artistName && (
            <p className="text-gray-500 text-xs truncate">
              by {artistName}
            </p>
          )}
        </div>

        {/* Bottom gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"></div>
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
          alt={randomArtist.name}
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
            title={song.title}
            price="Subs.." // Default subscription text
            singer={song.artist?.name || randomArtist.name}
            image={song.coverImage || song.album?.coverImage || "/images/placeholder.png"}
            onPlay={() => handleSongPlay(song)}
            isSelected={selectedSong?._id === song._id}
          />
        ))}

        
        {/* Show Albums first */}
        {albums.map((album) => (
          <AlbumCard
            key={`album-${album._id}`}
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