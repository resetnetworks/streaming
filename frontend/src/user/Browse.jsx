import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../features/songs/songSlice";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
import {
  selectAllSongs,
  selectSongsStatus,
} from "../features/songs/songSelectors";
import {
  setSelectedSong,
  play,
} from "../features/playback/playerSlice";

import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import AlbumCard from "../components/AlbumCard";
import SongList from "../components/SongList";
import GenreCard from "../components/GenreCard";
import { LuSquareChevronRight } from "react-icons/lu";
import { formatDuration } from "../utills/helperFunctions";

const Browse = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const status = useSelector(selectSongsStatus);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artists = useSelector((state) => state.artists.allArtists);

  const [randomArtist, setRandomArtist] = useState(null);

  const navigate = useNavigate()

  const recentScrollRef = useRef(null);
  const genreScrollRef = useRef(null);
  const similarScrollRef = useRef(null);
  const trendingScrollRef = useRef(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllSongs());
    }
    dispatch(fetchAllArtists());
  }, [dispatch, status]);

  useEffect(() => {
    if (songs.length > 0 && artists.length > 0) {
      const getValidArtist = () => {
        const shuffled = [...artists].sort(() => 0.5 - Math.random());
        for (let artist of shuffled) {
          const hasSongs = songs.some(
            (song) =>
              song.artist === artist._id || song.artist?._id === artist._id
          );
          if (hasSongs) return artist;
        }
        return null;
      };
      const selected = getValidArtist();
      setRandomArtist(selected);
    }
  }, [songs, artists]);

  const handleScroll = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < songs.length; i += chunkSize) {
    songColumns.push(songs.slice(i, i + chunkSize));
  }

  const genreData = [
    {
      title: "Electronic Music",
      image: "https://images.unsplash.com/photo-1549349807-4575e87c7e6a?fm=jpg&q=60&w=3000",
    },
    {
      title: "Classical Music",
      image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?fm=jpg&q=60&w=3000",
    },
    {
      title: "Pop Music",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?fm=jpg&q=60&w=3000",
    },
    {
      title: "Jazz Vibes",
      image: "https://images.unsplash.com/photo-1558369981-f9ca78462e61?fm=jpg&q=60&w=3000",
    },
    {
      title: "Lo-Fi Chill",
      image: "https://images.unsplash.com/photo-1549349807-4575e87c7e6a?fm=jpg&q=60&w=3000",
    },
    {
      title: "Indie Rock",
      image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?fm=jpg&q=60&w=3000",
    },
  ];

  const chunkGenres = (data, size = 3) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  };

  const genreChunks = chunkGenres(genreData);

  const songsByRandomArtist = randomArtist
    ? songs.filter(
        (song) =>
          song.artist === randomArtist._id ||
          song.artist?._id === randomArtist._id
      )
    : [];

  return (
    <UserLayout>
      <UserHeader />
      <div className="text-white px-4 py-2 flex flex-col gap-4">

        {/* New Albums and Singles */}
        <div className="w-full flex justify-between items-center">
          <h2 className="md:text-xl text-lg font-semibold">new albums and singles</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
            onClick={() => handleScroll(recentScrollRef)}
          />
        </div>
        <div ref={recentScrollRef} className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {songs.map((song) => (
            <RecentPlays
              key={song._id}
              title={song.title}
              singer={song.singer}
              image={song.coverImage || "/images/placeholder.png"}
              onPlay={() => handlePlaySong(song._id)}
              isSelected={selectedSong === song._id}
            />
          ))}
        </div>

        {/* Moods & Genre */}
        <div className="w-full flex justify-between items-center">
          <h2 className="md:text-xl text-lg font-semibold">moods & genre</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
            onClick={() => handleScroll(genreScrollRef)}
          />
        </div>
        <div
          ref={genreScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 px-1 no-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {genreChunks.map((group, index) => (
            <div key={index} className="flex-shrink-0 scroll-snap-align-start">
              <GenreCard cards={group} />
            </div>
          ))}
        </div>

        {/* Similar to random artist */}
        {randomArtist && (
          <>
            <div className="flex md:gap-2 gap-4 items-center">
              <img
                src={
                  randomArtist.image ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqfAcDALkSsCqPtfyFv69i8j0k_ZXVBM-Juw&s"
                }
                alt={randomArtist.name}
                className="md:w-12 md:h-12 w-8 h-8 object-cover rounded-full border-blue-800 border shadow-[0_0_5px_1px_#3b82f6]"
              />
              <div>
                <h2 className="text-blue-700 text-base leading-none">similar to</h2>
                <p
                  onClick={() => navigate(`/artist/${randomArtist._id}`)}
                  className="text-lg leading-none text-white hover:underline cursor-pointer"
                >
                  {randomArtist.name}
                </p>
              </div>
              <LuSquareChevronRight
                className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all ml-auto md:block hidden"
                onClick={() => handleScroll(similarScrollRef)}
              />
            </div>
            <div
              ref={similarScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 no-scrollbar"
            >
              {songsByRandomArtist.map((song) => (
                <RecentPlays
                  key={song._id}
                  title={song.title}
                  singer={song.singer}
                  image={song.coverImage || "/images/placeholder.png"}
                  onPlay={() => handlePlaySong(song._id)}
                  isSelected={selectedSong === song._id}
                />
              ))}
            </div>
          </>
        )}

        {/* Trending / Top Picks */}
        <div className="w-full flex justify-between items-center">
          <h2 className="md:text-xl text-lg font-semibold">trending</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
            onClick={() => handleScroll(trendingScrollRef)}
          />
        </div>
        <div
          ref={trendingScrollRef}
          className="w-full overflow-x-auto no-scrollbar"
        >
          <div className="flex md:gap-8 gap-32">
            {songColumns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="flex flex-col gap-4 min-w-[400px]"
              >
                {column.map((song) => (
                  <SongList
                    key={song._id}
                    songId={song._id}
                    img={song.coverImage || "/images/placeholder.png"}
                    songName={song.title}
                    singerName={song.singer}
                    seekTime={formatDuration(song.duration)}
                    onPlay={() => handlePlaySong(song._id)}
                    isSelected={selectedSong === song._id}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Browse;
