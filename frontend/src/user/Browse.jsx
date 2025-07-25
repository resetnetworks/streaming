import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../features/songs/songSlice";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
import {
  selectAllSongs,
  selectSongsStatus,
  selectTotalPages,
} from "../features/songs/songSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import AlbumCard from "../components/AlbumCard";
import SongList from "../components/SongList";
import GenreCard from "../components/GenreCard";
import { LuSquareChevronRight } from "react-icons/lu";
import { formatDuration } from "../utills/helperFunctions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Browse = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectAllSongs);
  const status = useSelector(selectSongsStatus);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artists = useSelector((state) => state.artists.allArtists);
  const totalPages = useSelector(selectTotalPages);

  const [randomArtist, setRandomArtist] = useState(null);
  const [recentPage, setRecentPage] = useState(1);
  const [similarPage, setSimilarPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);

  const [recentSongs, setRecentSongs] = useState([]);
  const [similarSongs, setSimilarSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);

  const observerRefs = {
    recent: useRef(),
    similar: useRef(),
    trending: useRef(),
  };

  const navigate = useNavigate();

  const recentScrollRef = useRef(null);
  const genreScrollRef = useRef(null);
  const similarScrollRef = useRef(null);
  const trendingScrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllArtists());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllSongs({ type: "recent", page: recentPage, limit: 10 })).then((res) => {
      if (res.payload?.songs) {
        setRecentSongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }, [dispatch, recentPage]);

  useEffect(() => {
    dispatch(fetchAllSongs({ type: "trending", page: trendingPage, limit: 20 })).then((res) => {
      if (res.payload?.songs) {
        setTrendingSongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }, [dispatch, trendingPage]);

  useEffect(() => {
    if (randomArtist?._id) {
      dispatch(
        fetchAllSongs({
          type: "similar",
          artistId: randomArtist._id,
          page: similarPage,
          limit: 10,
        })
      ).then((res) => {
        if (res.payload?.songs) {
          setSimilarSongs((prev) => {
            const seen = new Set(prev.map((s) => s._id));
            const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
            return [...prev, ...newSongs];
          });
        }
      });
    }
  }, [dispatch, similarPage, randomArtist]);

  useEffect(() => {
    if (!randomArtist && songs.length > 0 && artists.length > 0) {
      const getValidArtist = () => {
        const shuffled = [...artists].sort(() => 0.5 - Math.random());
        for (let artist of shuffled) {
          const hasSongs = songs.some(
            (song) => song.artist === artist._id || song.artist?._id === artist._id
          );
          if (hasSongs) return artist;
        }
        return null;
      };
      setRandomArtist(getValidArtist());
    }
  }, [songs, artists, randomArtist]);

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
  for (let i = 0; i < trendingSongs.length; i += chunkSize) {
    songColumns.push(trendingSongs.slice(i, i + chunkSize));
  }

  const createObserverRef = (key, pageState, setPageState) =>
    useCallback(
      (node) => {
        if (status === "loading") return;
        if (observerRefs[key].current) observerRefs[key].current.disconnect();
        observerRefs[key].current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && pageState < totalPages) {
            setPageState((prev) => prev + 1);
          }
        });
        if (node) observerRefs[key].current.observe(node);
      },
      [status, pageState, totalPages]
    );

  const recentLastRef = createObserverRef("recent", recentPage, setRecentPage);
  const similarLastRef = createObserverRef("similar", similarPage, setSimilarPage);
  const trendingLastRef = createObserverRef("trending", trendingPage, setTrendingPage);

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

  return (
    <>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">
          {/* New Albums and Singles */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">
              new albums and singles
            </h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(recentScrollRef)}
            />
          </div>
          <div
            ref={recentScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
          >
            {status === "loading" && recentSongs.length === 0 ? (
              [...Array(10)].map((_, idx) => (
                <div
                  key={`recent-skeleton-${idx}`}
                  className="w-[160px] flex flex-col gap-2 skeleton-wrapper"
                >
                  <Skeleton height={160} width={160} className="rounded-xl" />
                  <Skeleton width={100} height={12} />
                </div>
              ))
            ) : (
              recentSongs.map((song, idx) => (
                <RecentPlays
                  ref={idx === recentSongs.length - 1 ? recentLastRef : null}
                  key={song._id}
                  title={song.title}
                  singer={song.singer}
                  image={song.coverImage || "/images/placeholder.png"}
                  onPlay={() => handlePlaySong(song._id)}
                  isSelected={selectedSong === song._id}
                />
              ))
            )}
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
            className="flex gap-4 overflow-x-auto pb-2 px-1 no-scrollbar min-h-[160px]"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {status === "loading" ? (
              [...Array(2)].map((_, idx) => (
                <div
                  key={`genre-skeleton-${idx}`}
                  className="flex-shrink-0 scroll-snap-align-start w-[300px]"
                >
                  <Skeleton height={160} width={300} className="rounded-xl" />
                </div>
              ))
            ) : (
              genreChunks.map((group, index) => (
                <div
                  key={`genre-group-${index}`}
                  className="flex-shrink-0 scroll-snap-align-start"
                >
                  <GenreCard cards={group} />
                </div>
              ))
            )}
          </div>

          {/* Similar to random artist */}
          {status === "loading" && !randomArtist ? (
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
                    key={`similar-skeleton-${idx}`}
                    className="w-[160px] flex flex-col gap-2 skeleton-wrapper"
                  >
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={100} height={12} />
                  </div>
                ))}
              </div>
            </>
          ) : randomArtist ? (
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
                {similarSongs.length === 0 && status === "loading" ? (
                  [...Array(10)].map((_, idx) => (
                    <div
                      key={`similar-loading-${idx}`}
                      className="w-[160px] flex flex-col gap-2 skeleton-wrapper"
                    >
                      <Skeleton height={160} width={160} className="rounded-xl" />
                      <Skeleton width={100} height={12} />
                    </div>
                  ))
                ) : (
                  similarSongs.map((song, idx) => (
                    <RecentPlays
                      ref={idx === similarSongs.length - 1 ? similarLastRef : null}
                      key={song._id}
                      title={song.title}
                      singer={song.singer}
                      image={song.coverImage || "/images/placeholder.png"}
                      onPlay={() => handlePlaySong(song._id)}
                      isSelected={selectedSong === song._id}
                    />
                  ))
                )}
              </div>
            </>
          ) : null}

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
            className="w-full overflow-x-auto no-scrollbar min-h-[280px]"
          >
            <div className="flex md:gap-8 gap-32">
              {status === "loading" && trendingSongs.length === 0 ? (
                [...Array(5)].map((_, idx) => (
                  <div
                    key={`trending-skeleton-${idx}`}
                    className="flex flex-col gap-4 min-w-[400px]"
                  >
                    {[...Array(5)].map((__, i) => (
                      <div
                        key={`trending-item-${i}`}
                        className="flex items-center gap-4 skeleton-wrapper"
                      >
                        <Skeleton
                          height={50}
                          width={50}
                          className="rounded-full"
                        />
                        <div className="flex flex-col gap-1">
                          <Skeleton width={120} height={14} />
                          <Skeleton width={80} height={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                songColumns.map((column, columnIndex) => (
                  <div
                    key={`column-${columnIndex}`}
                    ref={columnIndex === songColumns.length - 1 ? trendingLastRef : null}
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
                ))
              )}
            </div>
          </div>
        </div>
      </SkeletonTheme>
    </>
  );
};

export default Browse;