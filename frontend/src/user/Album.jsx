import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";

import { fetchAlbumById } from "../features/albums/albumsSlice";
import {
  selectAlbumDetails,
  selectAlbumsLoading,
} from "../features/albums/albumsSelector";

import { fetchAllArtists } from "../features/artists/artistsSlice";
import { selectAllArtists } from "../features/artists/artistsSelectors";

import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";

// Skeleton
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
    if (albumId) dispatch(fetchAlbumById(albumId));
    dispatch(fetchAllArtists());
  }, [albumId, dispatch]);

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const artistName =
    typeof album?.artist === "object"
      ? album.artist.name
      : artists.find((a) => a._id === album?.artist)?.name || "Unknown Artist";

  const songs = album?.songs || [];

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white px-8 pt-10 pb-8">
          {/* Header */}
          {loading || !album || artists.length === 0 ? (
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 pb-6">
              <Skeleton width={232} height={232} className="rounded-lg" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton width={80} height={18} />
                <Skeleton width={300} height={36} />
                <Skeleton width={400} height={16} />
                <div className="flex gap-2 mt-4">
                  <Skeleton width={100} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={120} height={14} />
                  <Skeleton width={12} height={14} />
                  <Skeleton width={80} height={14} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 pb-6">
              <img
                src={album.coverImage}
                alt="Album Cover"
                className="w-[232px] h-[232px] object-cover rounded-lg shadow-lg"
              />
              <div>
                <div className="text-sm font-bold tracking-widest uppercase opacity-80">
                  Album
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold my-2">
                  {album.title}
                </h1>
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
          )}

          {/* Song List */}
          {loading || !album || artists.length === 0 ? (
            <div className="flex flex-col gap-4">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={`song-skeleton-${idx}`}
                  className="flex items-center gap-4"
                >
                  <Skeleton width={50} height={50} className="rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton width={160} height={14} />
                    <Skeleton width={100} height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center text-gray-400 mt-8 text-lg">
              No songs in this album.
            </div>
          ) : (
            songs.map((song) => (
              <div key={song._id} className="mb-4">
                <SongList
                  songId={song._id}
                  img={song.coverImage || album.coverImage}
                  songName={song.title}
                  singerName={song.singer}
                  seekTime={formatDuration(song.duration)}
                  onPlay={() => handlePlaySong(song)}
                  isSelected={selectedSong?._id === song._id}
                />
              </div>
            ))
          )}
        </div>
      </SkeletonTheme>
    </UserLayout>
  );
}
