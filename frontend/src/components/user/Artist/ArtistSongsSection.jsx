// src/components/user/Artist/ArtistSongsSection.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import Skeleton from "react-loading-skeleton";
import SongList from "../SongList";
import { selectSongsByArtist } from "../../../features/songs/songSelectors";
import { fetchSongsByArtist } from "../../../features/songs/songSlice";
import { setSelectedSong, play } from "../../../features/playback/playerSlice";
import { formatDuration } from "../../../utills/helperFunctions";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

const getArtistColor = (name) => {
  if (!name) return "bg-blue-600";
  const colors = [
    "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-red-600",
    "bg-orange-600", "bg-yellow-600", "bg-green-600", "bg-teal-600", "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

const ArtistSongsSection = ({ artistId, artist }) => {
  const dispatch = useDispatch();
  const [songsPage, setSongsPage] = useState(1);
  const [showAllSongs, setShowAllSongs] = useState(false);

  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artistSongsData = useSelector(
    (state) => selectSongsByArtist(state, artistId),
    shallowEqual
  );

  const {
    songs: artistSongs = [],
    pages: totalPages = 1,
    status: songsStatus = "idle",
  } = artistSongsData || {};

  const { lastElementRef: songsLastRef } = useInfiniteScroll({
    hasMore: songsPage < totalPages,
    loading: songsStatus === "loading",
    onLoadMore: () => setSongsPage(prev => prev + 1)
  });

  useEffect(() => {
    setSongsPage(1);
    setShowAllSongs(false);
  }, [artistId]);

  useEffect(() => {
    if (artistId && songsPage > 1) {
      dispatch(fetchSongsByArtist({ artistId, page: songsPage, limit: 10 }));
    }
  }, [dispatch, artistId, songsPage]);

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const renderCoverImage = (imageUrl, title, size = "w-full h-full") => {
    const artistColor = getArtistColor(artist?.name);
    return imageUrl ? (
      <img
        src={imageUrl}
        alt={title || "Cover"}
        className={`${size} object-cover`}
      />
    ) : (
      <div
        className={`${size} ${artistColor} flex items-center justify-center text-white font-bold text-2xl`}
      >
        {title ? title.charAt(0).toUpperCase() : "C"}
      </div>
    );
  };

  const songListView = showAllSongs ? artistSongs : artistSongs.slice(0, 5);

  return (
    <>
      <div className="flex justify-between mt-6 px-6 text-lg text-white">
        <h2>All Songs</h2>
        {artistSongs.length > 5 && (
          <button
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => setShowAllSongs(!showAllSongs)}
          >
            {showAllSongs ? "Show less" : "See all"}
          </button>
        )}
      </div>
      
      <div className="px-6 py-4 flex flex-col gap-4">
        {songsStatus === "loading" && artistSongs.length === 0 ? (
          [...Array(5)].map((_, idx) => (
            <div key={`song-skeleton-${idx}`} className="flex items-center gap-4">
              <Skeleton circle width={50} height={50} />
              <div className="flex-1">
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={12} />
              </div>
              <Skeleton width={40} height={16} />
            </div>
          ))
        ) : (
          <>
            {songListView.map((song, idx) => (
              <SongList
                key={song?._id}
                ref={idx === songListView.length - 1 && showAllSongs ? songsLastRef : null}
                songId={song?._id}
                img={
                  song?.coverImage
                    ? song?.coverImage
                    : renderCoverImage(null, song?.title, "w-12 h-12")
                }
                songName={song?.title}
                singerName={song?.singer}
                seekTime={formatDuration(song?.duration)}
                onPlay={() => handlePlaySong(song)}
                isSelected={selectedSong?._id === song?._id}
              />
            ))}
            {songsStatus === "loading" &&
              songsPage < totalPages &&
              [...Array(5)].map((_, idx) => (
                <div key={`song-loading-${idx}`} className="flex items-center gap-4">
                  <Skeleton circle width={50} height={50} />
                  <div className="flex-1">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={12} />
                  </div>
                  <Skeleton width={40} height={16} />
                </div>
              ))}
          </>
        )}
      </div>
    </>
  );
};

export default ArtistSongsSection;
