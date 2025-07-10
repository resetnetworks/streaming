import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";

import { fetchAlbumById } from "../features/albums/albumsSlice";
import { selectAlbumDetails, selectAlbumsLoading } from "../features/albums/albumsSelector";

import { fetchAllArtists } from "../features/artists/artistsSlice";
import { selectAllArtists } from "../features/artists/artistsSelectors";

import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Album() {
  const { albumId } = useParams();
  const dispatch = useDispatch();

  const album = useSelector(selectAlbumDetails);
  const loading = useSelector(selectAlbumsLoading);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artists = useSelector(selectAllArtists);

  useEffect(() => {
    if (albumId) {
      dispatch(fetchAlbumById(albumId));
    }
    dispatch(fetchAllArtists());
  }, [albumId, dispatch]);

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  if (loading || !album || artists.length === 0) {
    return (
      <UserLayout>
        <UserHeader />
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="min-h-screen px-8 py-12 text-white bg-gray-900">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
              <Skeleton height={232} width={232} className="rounded-lg" />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton width={80} height={16} />
                <Skeleton width={`60%`} height={40} />
                <Skeleton width={`80%`} height={20} />
                <Skeleton width={`50%`} height={16} />
              </div>
            </div>

            {/* Song skeleton list */}
            <div className="mt-12 space-y-4">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 skeleton-wrapper">
                  <Skeleton circle height={50} width={50} />
                  <div className="flex flex-col gap-1">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      </UserLayout>
    );
  }

  const artistName =
    typeof album.artist === "object"
      ? album.artist.name
      : artists.find((artist) => artist._id === album.artist)?.name || "Unknown Artist";

  const songs = [...(album.songs || [])].reverse();

  return (
    <UserLayout>
      <UserHeader />
      <div className="min-h-screen text-white bg-gray-900">
        {/* Album Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 px-8 pt-10 pb-6">
          <img
            src={album.coverImage}
            alt="Album Cover"
            className="w-[232px] h-[232px] object-cover rounded-lg shadow-lg"
          />
          <div>
            <div className="text-sm font-bold tracking-widest uppercase opacity-80">Album</div>
            <h1 className="text-5xl md:text-6xl font-extrabold my-2">{album.title}</h1>
            <p className="text-lg text-gray-400">{album.description}</p>
            <div className="flex items-center gap-2 mt-4 flex-wrap text-sm md:text-base text-gray-300">
              <span className="font-semibold">{artistName}</span>
              <span className="text-xl">•</span>
              <span>{formatDate(album.releaseDate)}</span>
              <span className="text-xl">•</span>
              <span>{songs.length} songs</span>
            </div>
          </div>
        </div>

        {/* Song List */}
        <div className="px-8 pb-8">
          {songs.length === 0 ? (
            <div className="text-center text-gray-400 mt-8 text-lg">
              No songs in this album.
            </div>
          ) : (
            songs.map((song) => (
              <div key={song} className="mb-4">
                <SongList
                  songId={song}
                  img={song.coverImage || album.coverImage}
                  songName={song.title}
                  singerName={song.singer}
                  seekTime={formatDuration(song.duration)}
                  onPlay={() => handlePlaySong(song)}
                  isSelected={selectedSong === song}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </UserLayout>
  );
}
