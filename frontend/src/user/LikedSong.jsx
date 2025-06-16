import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikedSongs, clearLikedSongs } from "../features/songs/songSlice";
import { selectLikedSongs } from "../features/songs/songSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import SongList from "../components/SongList";
import UserLayout from "../components/UserLayout";
import { formatDuration } from "../utills/helperFunctions";
import UserHeader from "../components/UserHeader";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LikedSong = () => {
  const dispatch = useDispatch();

  const likedSongs = useSelector(selectLikedSongs);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const playerStatus = useSelector((state) => state.player.status);

  // Get the list of liked song IDs from auth.user
  const likedSongIds = useSelector((state) => state.auth.user?.likedsong || []);

  // Sync liked song details with backend or clear when empty
  useEffect(() => {
    if (likedSongIds.length > 0) {
      dispatch(fetchLikedSongs(likedSongIds));
    } else {
      dispatch(clearLikedSongs());
    }
  }, [dispatch, likedSongIds]);

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen w-[96%] py-8 px-4">
          <h2 className="md:text-3xl text-2xl font-bold text-white mb-8">
            Liked Songs
          </h2>

          {likedSongs.length === 0 ? (
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
              {likedSongs.map((song) => (
                <div 
                  key={song._id} 
                  className="flex items-center justify-between bg-white/10 rounded-xl shadow-lg p-4 hover:bg-white/20 transition relative my-2 mx-0"
                >
                  <SongList
                    songId={song._id}
                    img={song.coverImage || "/images/placeholder.png"}
                    songName={song.title}
                    singerName={song.singer}
                    seekTime={formatDuration(song.duration)}
                    onPlay={() => handlePlaySong(song._id)}
                    isSelected={selectedSong === song._id}
                    isPlaying={selectedSong === song._id && playerStatus === 'playing'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </SkeletonTheme>
    </UserLayout>
  );
};

export default LikedSong;
