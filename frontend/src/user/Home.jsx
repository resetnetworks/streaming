import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../features/songs/songSlice";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const allSongs = useSelector((state) => state.songs.allSongs);
  const artists = useSelector((state) => state.artists.allArtists);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const status = useSelector((state) => state.songs.status);
  const totalPages = useSelector((state) => state.songs.totalPages);


  const [recentPage, setRecentPage] = useState(1);
  const [topPicksPage, setTopPicksPage] = useState(1);
  const [similarPage, setSimilarPage] = useState(1);
  const [randomArtist, setRandomArtist] = useState(null);

  const [recentSongs, setRecentSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [similarSongs, setSimilarSongs] = useState([]);

  const observerRefs = {
    recent: useRef(),
    topPicks: useRef(),
    similar: useRef(),
  };

  const scrollRefs = {
    recent: useRef(null),
    playlist: useRef(null),
    similar: useRef(null),
    topPicks: useRef(null),
  };

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
    dispatch(fetchAllSongs({ type: "top", page: topPicksPage, limit: 20 })).then((res) => {
      if (res.payload?.songs) {
        setTopSongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }, [dispatch, topPicksPage]);

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
    if (!randomArtist && allSongs.length > 0 && artists.length > 0) {
      const getValidArtist = () => {
        const shuffled = [...artists].sort(() => 0.5 - Math.random());
        for (let artist of shuffled) {
          const hasSongs = allSongs.some(
            (song) => song.artist === artist._id || song.artist?._id === artist._id
          );
          if (hasSongs) return artist;
        }
        return null;
      };
      setRandomArtist(getValidArtist());
    }
  }, [allSongs, artists, randomArtist]);

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
  for (let i = 0; i < topSongs.length; i += chunkSize) {
    songColumns.push(topSongs.slice(i, i + chunkSize));
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
  const topPicksLastRef = createObserverRef("topPicks", topPicksPage, setTopPicksPage);
  const similarLastRef = createObserverRef("similar", similarPage, setSimilarPage);

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
              onClick={() => handleScroll(scrollRefs.recent)}
            />
          </div>
          <div
            ref={scrollRefs.recent}
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

          {/* Suggested Playlist */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">
              suggested playlist for you
            </h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(scrollRefs.playlist)}
            />
          </div>
          <div
            ref={scrollRefs.playlist}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[140px]"
          >
            {status === "loading" ? (
              [...Array(7)].map((_, idx) => (
                <div
                  key={`playlist-skeleton-${idx}`}
                  className="min-w-[160px] flex flex-col gap-2 skeleton-wrapper"
                >
                  <Skeleton height={160} width={160} className="rounded-xl" />
                  <Skeleton width={100} height={12} />
                </div>
              ))
            ) : (
              [...Array(7)].map((_, index) => (
                <AlbumCard
                  key={`playlist-${index}`}
                  tag="#rock"
                  artists="Led Zeppelin, The Rolling Stones"
                />
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
                ref={scrollRefs.similar}
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
                  onClick={() => handleScroll(scrollRefs.similar)}
                />
              </div>
              <div
                ref={scrollRefs.similar}
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

          {/* Top Picks */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">top picks for you</h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(scrollRefs.topPicks)}
            />
          </div>
          <div
            ref={scrollRefs.topPicks}
            className="w-full overflow-x-auto no-scrollbar min-h-[280px]"
          >
            <div className="flex md:gap-8 gap-32">
              {status === "loading" && topSongs.length === 0 ? (
                [...Array(5)].map((_, idx) => (
                  <div
                    key={`top-picks-skeleton-${idx}`}
                    className="flex flex-col gap-4 min-w-[400px]"
                  >
                    {[...Array(5)].map((__, i) => (
                      <div
                        key={`top-picks-item-${i}`}
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
                    ref={columnIndex === songColumns.length - 1 ? topPicksLastRef : null}
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
    </UserLayout>
  );
};

export default Home;