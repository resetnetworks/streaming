import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../features/songs/songSlice";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
import {
  selectAllSongs,
  selectSongsStatus,
} from "../features/songs/songSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import AlbumCard from "../components/AlbumCard";
import SongList from "../components/SongList";
import { LuSquareChevronRight } from "react-icons/lu";
import { formatDuration } from "../utills/helperFunctions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Home = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const artists = useSelector((state) => state.artists.allArtists);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const status = useSelector(selectSongsStatus);
  const navigate = useNavigate();

  const [randomArtist, setRandomArtist] = useState(null);

  const recentScrollRef = useRef(null);
  const playlistScrollRef = useRef(null);
  const similarScrollRef = useRef(null);
  const topPicksScrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllSongs());
    dispatch(fetchAllArtists());
  }, [dispatch]);

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
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">
          {/* Recent Played */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">recent played</h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(recentScrollRef)}
            />
          </div>
          <div
            ref={recentScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
          >
            {status === "loading"
              ? [...Array(10)].map((_, idx) => (
                  <div
                    key={idx}
                    className="w-[160px] flex flex-col gap-2 skeleton-wrapper"
                  >
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={100} height={12} />
                  </div>
                ))
              : songs.map((song) => (
                  <RecentPlays
                    key={song._id}
                    title={song.title}
                    singer={song.singer}
                    image={
                      song.coverImage && song.coverImage.trim() !== ""
                        ? song.coverImage
                        : "/images/placeholder.png"
                    }
                    onPlay={() => handlePlaySong(song._id)}
                    isSelected={selectedSong === song._id}
                  />
                ))}
          </div>

          {/* Suggested Playlist */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">
              suggested playlist for you
            </h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(playlistScrollRef)}
            />
          </div>
          <div
            ref={playlistScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[140px]"
          >
            {status === "loading"
              ? [...Array(10)].map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-[160px] flex flex-col gap-2 skeleton-wrapper"
                  >
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={100} height={12} />
                  </div>
                ))
              : [...Array(7)].map((_, index) => (
                  <AlbumCard
                    key={index}
                    tag="#rock"
                    artists="Led Zeppelin, The Rolling Stones"
                  />
                ))}
          </div>

          {/* Similar to random artist */}
          {status === "loading" ? (
            <>
              <div className="flex md:gap-2 gap-4 items-center">
                <Skeleton circle width={48} height={48} />
                <div className="flex flex-col gap-1">
                  <Skeleton width={80} height={14} />
                  <Skeleton width={100} height={18} />
                </div>
              </div>
              <div
                ref={similarScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
              >
                {[...Array(10)].map((_, idx) => (
                  <div
                    key={idx}
                    className="w-[160px] flex flex-col gap-2 skeleton-wrapper"
                  >
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={100} height={12} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            randomArtist && (
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
                    <h2 className="text-blue-700 text-base leading-none">
                      similar to
                    </h2>
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
                  className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
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
            )
          )}

          {/* Top Picks */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">top picks for you</h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(topPicksScrollRef)}
            />
          </div>
          <div
            ref={topPicksScrollRef}
            className="w-full overflow-x-auto no-scrollbar min-h-[280px]"
          >
            <div className="flex md:gap-8 gap-32">
              {status === "loading"
                ? [...Array(5)].map((_, idx) => (
                    <div key={idx} className="flex flex-col gap-4 min-w-[400px]">
                      {[...Array(5)].map((__, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 skeleton-wrapper"
                        >
                          <Skeleton height={50} width={50} className="rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton width={120} height={14} />
                            <Skeleton width={80} height={12} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                : songColumns.map((column, columnIndex) => (
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
      </SkeletonTheme>
    </UserLayout>
  );
};

export default Home;
