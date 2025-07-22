// src/pages/LikedSongs.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLikedSongs,
  clearLikedSongs,
  removeSongFromLiked,
} from "../features/songs/songSlice";
import {
  selectLikedSongs,
  selectLikedSongsPage,
  selectLikedSongsPages,
  selectLikedSongsTotal,
  selectSongsStatus,
} from "../features/songs/songSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { toggleLikeSong } from "../features/auth/authSlice";
import SongList from "../components/user/SongList";
import UserLayout from "../components/user/UserLayout";
import { formatDuration } from "../utills/helperFunctions";
import UserHeader from "../components/user/UserHeader";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LikedSongs = () => {
  const dispatch = useDispatch();
  const [loadingMore, setLoadingMore] = useState(false);
  const [localSongs, setLocalSongs] = useState([]);
  const limit = 20;

  const songs = useSelector(selectLikedSongs);
  const total = useSelector(selectLikedSongsTotal);
  const page = useSelector(selectLikedSongsPage);
  const pages = useSelector(selectLikedSongsPages);
  const status = useSelector(selectSongsStatus);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const playerStatus = useSelector((state) => state.player.status);

  const observer = useRef();

  const lastSongElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && page < pages) {
            loadMoreSongs();
          }
        },
        { threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [loadingMore, page, pages]
  );

  useEffect(() => {
    dispatch(fetchLikedSongs({ page: 1, limit }));
    return () => {
      dispatch(clearLikedSongs());
      if (observer.current) observer.current.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const loadMoreSongs = async () => {
    if (loadingMore || page >= pages) return;
    setLoadingMore(true);
    try {
      await dispatch(fetchLikedSongs({ page: page + 1, limit }));
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    if (playerStatus !== "playing" || selectedSong !== songId) {
      dispatch(play());
    }
  };

  const handleToggleLike = async (songId) => {
    const result = await dispatch(toggleLikeSong(songId));
    if (result.meta.requestStatus === "fulfilled") {
      dispatch(removeSongFromLiked(songId)); // update Redux
      setLocalSongs((prev) => prev.filter((song) => song._id !== songId)); // update local state
    }
  };

  const hasMore = page < pages && localSongs.length < total;

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen w-[96%] py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="md:text-3xl text-2xl font-bold text-white">
              Liked Songs
            </h2>
            {total > 0 && (
              <span className="text-gray-400">
                {total} {total === 1 ? "song" : "songs"}
              </span>
            )}
          </div>

          {status === "loading" && localSongs.length === 0 ? (
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
          ) : localSongs.length === 0 ? (
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
              {localSongs.map((song, index) => (
                <div
                  ref={
                    index === localSongs.length - 1
                      ? lastSongElementRef
                      : null
                  }
                  key={song._id}
                  className="flex items-center justify-between bg-white/10 rounded-xl shadow-lg p-4 hover:bg-white/20 transition relative my-2 mx-0 group"
                >
                  <SongList
                    songId={song._id}
                    img={
                      song.coverImage ||
                      song.album?.coverImage ||
                      "/images/placeholder.png"
                    }
                    songName={song.title}
                    singerName={song.artist?.name || song.singer}
                    seekTime={formatDuration(song.duration)}
                    onPlay={() => handlePlaySong(song)}
                    isSelected={selectedSong?._id === song._id}
                    isPlaying={
                      selectedSong === song._id &&
                      playerStatus === "playing"
                    }
                    onLikeToggle={() => handleToggleLike(song._id)}
                  />
                </div>
              ))}

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}

              {!hasMore && localSongs.length > 0 && (
                <p className="text-center text-gray-400 py-4">
                  You've reached the end of your liked songs
                </p>
              )}
            </div>
          )}
        </div>
      </SkeletonTheme>
    </UserLayout>
  );
};

export default LikedSongs;
