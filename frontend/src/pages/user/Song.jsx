import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserHeader from "../../components/user/UserHeader";
import PageSEO from "../../components/PageSeo/PageSEO";

// Redux imports
import { 
  selectCurrentSong, 
  selectCurrentSongStatus, 
  selectCurrentSongError 
} from "../../features/songs/songSelectors";
import { getSongById } from "../../features/songs/songSlice";
import { setSelectedSong, play } from "../../features/playback/playerSlice";

// Skeleton
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Song() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { songId } = useParams();
  
  // Redux state
  const song = useSelector(selectCurrentSong);
  const status = useSelector(selectCurrentSongStatus);
  const error = useSelector(selectCurrentSongError);
  const loading = status === 'loading';

  // Mock current user - replace with actual user state
  const currentUser = {
    purchasedSongs: [], // Empty for demo
    _id: "user123"
  };

  // Fetch song data when component mounts or ID changes
  useEffect(() => {
    if (songId) {
      dispatch(getSongById(songId));
    }
  }, [dispatch, songId]);

  // Handle play song
  const handlePlaySong = () => {
    if (song) {
      dispatch(setSelectedSong(song));
      dispatch(play());
    }
  };

  // Check if song is purchased
  const isSongPurchased = currentUser?.purchasedSongs?.includes(song?._id);
  const isSubscriptionSong = song?.accessType === 'subscription' || song?.price === 0;

  // Generate color from artist name
  const getArtistColor = (name) => {
    if (!name) return "bg-blue-600";
    const colors = [
      "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-red-600", 
      "bg-orange-600", "bg-yellow-600", "bg-teal-600", "bg-indigo-600"
    ];
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const artistColor = getArtistColor(song?.artist?.name || song?.singer);

  // Show error state
  if (status === 'failed') {
    return (
      <>
        <UserHeader />
        <div className="min-h-screen text-white sm:px-8 px-4 pt-10 pb-8">
          <div className="flex flex-col items-center justify-center h-96">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Song</h1>
            <p className="text-gray-400 mb-6">{error || "Failed to load song details"}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title={song ? `${song.title} by ${song.artist?.name || song.singer} | Reset Music` : "Loading Song | Reset Music"}
        description={song ? `Listen to "${song.title}" by ${song.artist?.name || song.singer} exclusively on Reset Music. ${song.description}` : "Loading song details..."}
        canonicalUrl={song ? `https://musicreset.com/song/${song._id}` : "https://musicreset.com"}
        structuredData={song ? {
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          "name": song.title,
          "description": song.description,
          "image": song.coverImage,
          "url": `https://musicreset.com/song/${song._id}`,
          "byArtist": {
            "@type": "MusicGroup",
            "name": song.artist?.name || song.singer,
          },
          "duration": `PT${Math.floor(song.duration / 60)}M${song.duration % 60}S`,
          "datePublished": song.releaseDate
        } : null}
        noIndex={true}
      />

      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white sm:px-8 px-4 pt-10 pb-8">

          {/* Main Song Header */}
          {loading ? (
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-8">
              <Skeleton width={320} height={320} className="rounded-lg" />
              <div className="flex-1 flex flex-col gap-3">
                <Skeleton width={60} height={16} />
                <Skeleton width={400} height={40} />
                <Skeleton width={200} height={18} />
                <Skeleton width={350} height={16} />
                <div className="flex gap-2 mt-4">
                  <Skeleton width={100} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={80} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={60} height={14} />
                </div>
              </div>
            </div>
          ) : song ? (
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-8">
              
              {/* Song Cover */}
              <div className="relative group">
                {song.coverImage ? (
                  <img
                    src={song.coverImage}
                    alt={`${song.title} cover`}
                    className="w-[320px] h-[320px] object-cover rounded-lg shadow-2xl transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`w-[320px] h-[320px] ${artistColor} rounded-lg shadow-2xl flex items-center justify-center text-white font-bold text-6xl transition-transform group-hover:scale-105`}
                  >
                    {song.title ? song.title.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <button 
                    onClick={handlePlaySong}
                    className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg"
                  >
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Song Details */}
              <div className="flex-1">
                <div className="text-sm font-bold tracking-widest uppercase opacity-80 mb-2">
                  Song
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-extrabold mb-4 leading-tight">
                  {song.title}
                </h1>
                
                <p className="text-lg text-gray-300 mb-4 leading-relaxed max-w-2xl">
                  {song.description}
                </p>

                {/* Song Meta Info */}
                <div className="flex items-center gap-2 mb-6 flex-wrap text-sm lg:text-base text-gray-300">
                  {song.artist && (
                    <>
                      <button 
                        onClick={() => navigate(`/artist/${song.artist.slug}`)}
                        className="font-semibold text-white hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
                      >
                        {song.artist.name}
                      </button>
                      <span className="text-xl">•</span>
                    </>
                  )}
                  <span>{formatDate(song.releaseDate)}</span>
                  <span className="text-xl">•</span>
                  <span>{formatDuration(song.duration)}</span>
                </div>

                {/* Genre Tags */}
                {song.genre && song.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {song.genre.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-full transition-colors cursor-pointer"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 flex-wrap">
                  
                  {/* Main Play Button */}
                  <button 
                    onClick={handlePlaySong}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Play</span>
                  </button>

                  {/* Purchase/Subscription Info */}
                  {song.price > 0 && !isSubscriptionSong && (
                    <>
                      <span className="text-xl font-bold text-blue-400">
                        ₹{song.price}
                      </span>
                      {isSongPurchased ? (
                        <span className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          Purchased
                        </span>
                      ) : (
                        <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-all duration-200 shadow-md flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Purchase Song
                        </button>
                      )}
                    </>
                  )}

                  {isSubscriptionSong && (
                    <span className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Subscription Access
                    </span>
                  )}

                  {/* Add to Favorites */}
                  <button className="p-3 border-2 border-gray-600 hover:border-white text-gray-400 hover:text-white rounded-full transition-all duration-200 group">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Share Button */}
                  <button className="p-3 border-2 border-gray-600 hover:border-white text-gray-400 hover:text-white rounded-full transition-all duration-200 group">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>

                </div>
              </div>
            </div>
          ) : null}

          {/* Related Content Section */}
          {song && (
            <div className="border-t border-gray-700 pt-8">
              
              {/* Album Info */}
              {song.album && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    From the Album
                  </h3>
                  <button 
                    onClick={() => navigate(`/album/${song.album.slug}`)}
                    className="flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 group max-w-md"
                  >
                    {song.album.coverImage ? (
                      <img 
                        src={song.album.coverImage} 
                        alt={song.album.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`w-16 h-16 ${artistColor} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                        {song.album.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-semibold group-hover:text-blue-400 transition-colors">
                        {song.album.title}
                      </div>
                      <div className="text-gray-400 text-sm">Album • {song.artist?.name || song.singer}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Artist Info */}
              {song.artist && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Artist
                  </h3>
                  <button 
                    onClick={() => navigate(`/artist/${song.artist.slug}`)}
                    className="flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 group max-w-md"
                  >
                    {song.artist.image ? (
                      <img 
                        src={song.artist.image} 
                        alt={song.artist.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-16 h-16 ${artistColor} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                        {song.artist.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-semibold group-hover:text-purple-400 transition-colors">
                        {song.artist.name}
                      </div>
                      <div className="text-gray-400 text-sm">Artist</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Lyrics Section Placeholder */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Lyrics
                </h3>
                <div className="bg-gray-800 rounded-lg p-6">
                  <p className="text-gray-400 text-center italic">
                    Lyrics not available for this track
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </SkeletonTheme>
    </>
  );
}