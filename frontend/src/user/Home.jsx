import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight } from "react-icons/lu";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Redux actions
import { fetchAllSongs } from "../features/songs/songSlice";
import { fetchAllArtists, fetchRandomArtistWithSongs } from "../features/artists/artistsSlice";
import { fetchAllAlbums } from "../features/albums/albumsSlice";
import { selectRandomArtist, selectRandomArtistSongs } from "../features/artists/artistsSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";

// Components
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import RecentPlays from "../components/user/RecentPlays";
import AlbumCard from "../components/user/AlbumCard";
import SongList from "../components/user/SongList";

// Utils
import { formatDuration } from "../utills/helperFunctions";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const songsStatus = useSelector((state) => state.songs.status);
  const songsTotalPages = useSelector((state) => state.songs.totalPages);
  const albumsStatus = useSelector((state) => state.albums.loading);
  const albumsTotalPages = useSelector((state) => state.albums.pagination.totalPages);
  const allAlbums = useSelector((state) => state.albums.allAlbums);
  const randomArtist = useSelector(selectRandomArtist);
  const similarSongs = useSelector(selectRandomArtistSongs);

  // State
  const [recentPage, setRecentPage] = useState(1);
  const [topPicksPage, setTopPicksPage] = useState(1);
  const [similarPage] = useState(1);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [topSongs, setTopSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);

  // Refs
  const observerRefs = {
    recent: useRef(),
    topPicks: useRef(),
    similar: useRef(),
    albums: useRef(),
  };

  const scrollRefs = {
    recent: useRef(null),
    playlist: useRef(null),
    similar: useRef(null),
    topPicks: useRef(null),
  };

  // Fetch data on mount and page changes
  useEffect(() => {
    dispatch(fetchAllArtists());
    dispatch(fetchRandomArtistWithSongs({ page: similarPage, limit: 10 }));
  }, [dispatch, similarPage]);

  useEffect(() => {
  if (allAlbums.length === 0) {
    dispatch(fetchAllAlbums({ page: albumsPage, limit: 10 }));
  }
}, [dispatch, albumsPage]);


useEffect(() => {
  if (recentSongs.length === 0) {
    dispatch(fetchAllSongs({ type: "recent", page: recentPage, limit: 10 })).then((res) => {
      if (res.payload?.songs) {
        setRecentSongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }
}, [dispatch, recentPage]);


useEffect(() => {
  if (topSongs.length === 0) {
    dispatch(fetchAllSongs({ type: "top", page: topPicksPage, limit: 20 })).then((res) => {
      if (res.payload?.songs) {
        setTopSongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }
}, [dispatch, topPicksPage]);


  // Handlers
  const handleScroll = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  // Create chunks for top songs grid
  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < topSongs.length; i += chunkSize) {
    songColumns.push(topSongs.slice(i, i + chunkSize));
  }

  // Observer callback factory
  const createObserverRef = (key, pageState, setPageState, totalPages, status) =>
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

  const recentLastRef = createObserverRef("recent", recentPage, setRecentPage, songsTotalPages, songsStatus);
  const topPicksLastRef = createObserverRef("topPicks", topPicksPage, setTopPicksPage, songsTotalPages, songsStatus);
  const albumsLastRef = createObserverRef("albums", albumsPage, setAlbumsPage, albumsTotalPages, albumsStatus);

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">

          {/* Recent Played Section */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">new tracks</h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(scrollRefs.recent)}
            />
          </div>
          <div
            ref={scrollRefs.recent}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
          >
            {songsStatus === "loading" && recentSongs.length === 0 ? (
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
                  price={song.accessType === 'purchase-only' ? `$${song.price}` : 'Subs..'}
                  singer={song.singer}
                  image={song.coverImage || "/images/placeholder.png"}
                  onPlay={() => handlePlaySong(song)}
                  isSelected={selectedSong?._id === song._id}
                />
              ))
            )}
          </div>

          {/* Albums Section */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">new albums for you</h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(scrollRefs.playlist)}
            />
          </div>
          <div
            ref={scrollRefs.playlist}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[220px]"
          >
            {albumsStatus ? (
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
              allAlbums.map((album, idx) => (
                <div 
                  key={album._id} 
                  ref={idx === allAlbums.length - 1 ? albumsLastRef : null}
                >
                 <AlbumCard
  tag={`#${album.title || 'music'}`}
  artists={album.artist?.name || "Various Artists"}
  image={album.coverImage || "/images/placeholder.png"}
  price={album.price === 0 ? "subs.." : `$${album.price}`}
  onClick={() => navigate(`/album/${album.slug}`)}
/>

                </div>
              ))
            )}
          </div>

          {/* Similar Artist Section */}
          {randomArtist ? (
            <>
              <div className="flex md:gap-2 gap-4 items-center">
                <img
                  src={
                    randomArtist?.image ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqfAcDALkSsCqPtfyFv69i8j0k_ZXVBM-Juw&s"
                  }
                  alt={randomArtist.name}
                  className="md:w-12 md:h-12 w-8 h-8 object-cover rounded-full border-blue-800 border shadow-[0_0_5px_1px_#3b82f6]"
                />
                <div>
                  <h2 className="text-blue-700 text-base leading-none">similar to</h2>
                  <p
                    onClick={() => navigate(`/artist/${randomArtist.slug}`)}
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

              {similarSongs.length === 0 ? (
                <p className="text-gray-400 italic">No songs available for this artist.</p>
              ) : (
                <div
                  ref={scrollRefs.similar}
                  className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
                >
                  {similarSongs.map((song) => (
                    <RecentPlays
                      key={song._id}
                      title={song.title}
                      singer={song.singer}
                      image={song.coverImage || "/images/placeholder.png"}
                      onPlay={() => handlePlaySong(song)}
                      isSelected={selectedSong?._id === song._id}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex md:gap-2 gap-4 items-center">
                <Skeleton circle width={48} height={48} />
                <div className="flex flex-col gap-1">
                  <Skeleton width={80} height={14} />
                  <Skeleton width={100} height={18} />
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]">
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
          )}

          {/* Top Picks Section */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">all tracks for you</h2>
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
              {songsStatus === "loading" && topSongs.length === 0 ? (
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
                        onPlay={() => handlePlaySong(song)}
                        isSelected={selectedSong?._id === song._id}
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