import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUnlikeSong, useLikedSongs } from "../../hooks/api/useSongs";
import PageSEO from "../../components/PageSeo/PageSEO";
import { setSelectedSong, play } from "../../features/playback/playerSlice";
import { removeSongFromLiked } from "../../features/songs/songSlice";
import SongList from "../../components/user/SongList";
import { formatDuration } from "../../utills/helperFunctions";
import UserHeader from "../../components/user/UserHeader";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LikedSongs = () => {
  const dispatch = useDispatch();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useLikedSongs();
  
  const unlikeMutation = useUnlikeSong();
  
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const playerStatus = useSelector((state) => state.player.status);

  // Flatten all songs from pages
  const allSongs = data?.pages.flatMap(page => page.songs) || [];
  const totalSongs = data?.pages[0]?.total || 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePlaySong = (song) => {

    dispatch(setSelectedSong(song));
    if (playerStatus !== "playing" || selectedSong !== song._id) {
      dispatch(play());
    }
  };

  const handleUnlikeSong = async (songId) => {
    unlikeMutation.mutate(songId);
    // Update Redux store
    dispatch(removeSongFromLiked(songId));
  };

  if (isError) {
    return (
      <div className="min-h-screen w-[96%] py-8 px-4">
        <p className="text-red-400">Failed to load liked songs</p>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title="Reset Music Streaming Liked Songs | Your Favorite Tracks"
        description="Discover your liked songs on Reset Music Streaming."
        canonicalUrl="https://musicreset.com/liked-songs"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Reset Music liked Songs",
          "description": "Your liked songs collection",
          "url": "https://musicreset.com/liked-songs",
        }}
        noIndex={true}
      />
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen w-[96%] py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="md:text-3xl text-2xl font-bold text-white">
              Liked Songs
            </h2>
            {totalSongs > 0 && (
              <span className="text-gray-400">
                {totalSongs} {totalSongs === 1 ? "song" : "songs"}
              </span>
            )}
          </div>
          {isLoading && allSongs.length === 0 ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/10 rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center gap-4 w-full">
                    <Skeleton width={50} height={50} circle />
                    <div className="flex-1">
                      <Skeleton width={200} height={20} />
                      <Skeleton width={150} height={16} className="mt-2" />
                    </div>
                    <Skeleton width={60} height={20} />
                  </div>
                </div>
              ))}
            </div>
          ) : allSongs.length === 0 ? (
            <div className="text-white px-4 py-2">
              <h2 className="text-lg md:text-xl font-semibold">
                You haven't liked any songs yet.
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Go explore and tap the ❤️ icon to like songs.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allSongs.map((song, index) => (
                <div
                  key={song._id}
                  className="flex items-center justify-between bg-white/10 rounded-xl shadow-lg p-4 hover:bg-white/20 transition relative my-2 mx-0 group"
                >
                  <SongList
                    songId={song._id}
                    img={
                      song?.coverImage ||
                      song.album?.coverImage ||
                      "/images/placeholder.png"
                    }
                    songName={song?.title}
                    singerName={song?.artist?.name || song?.singer}
                    seekTime={formatDuration(song?.duration)}
                    onPlay={() => handlePlaySong(song)}
                    isSelected={selectedSong?._id === song._id}
                    isPlaying={
                      selectedSong === song._id &&
                      playerStatus === "playing"
                    }
                    onLikeToggle={() => handleUnlikeSong(song._id)}
                    isLiked={true}
                  />
                </div>
              ))}

              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}

              {hasNextPage && !isFetchingNextPage && (
                <button
                  onClick={loadMore}
                  className="text-center text-white py-4 hover:text-gray-300 transition"
                >
                  Load more
                </button>
              )}

              {!hasNextPage && allSongs.length > 0 && (
                <p className="text-center text-gray-400 py-4">
                  You've reached the end of your liked songs
                </p>
              )}
            </div>
          )}
        </div>
      </SkeletonTheme>
    </>
  );
};

export default LikedSongs;