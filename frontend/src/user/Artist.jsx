import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import SongList from "../components/SongList";
import RecentPlays from "../components/RecentPlays";
import { FiMapPin } from "react-icons/fi";
import { LuSquareChevronRight } from "react-icons/lu";
import { fetchAllSongs } from "../features/songs/songSlice";
import { fetchArtistById } from "../features/artists/artistsSlice";
import { selectSelectedArtist } from "../features/artists/artistsSelectors";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";
import { getAlbumsByArtist } from "../features/albums/albumsSlice";
import { selectArtistAlbums } from "../features/albums/albumsSelector";
import {
  selectAllSongs,
  selectTotalPages,
} from "../features/songs/songSelectors";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const recentScrollRef = useRef(null);
  const singlesScrollRef = useRef(null);
  const navigate = useNavigate();

  const songs = useSelector(selectAllSongs);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artist = useSelector(selectSelectedArtist);
  const artistAlbums = useSelector(selectArtistAlbums);
  const totalPages = useSelector(selectTotalPages);
  const status = useSelector((state) => state.songs.status);

  const [songsPage, setSongsPage] = useState(1);
  const [artistSongs, setArtistSongs] = useState([]);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [displayedAlbums, setDisplayedAlbums] = useState([]);

  const songsObserverRef = useRef();
  const albumsObserverRef = useRef();

  useEffect(() => {
    if (artistId) {
      dispatch(fetchArtistById(artistId));
      dispatch(getAlbumsByArtist(artistId));
    }
  }, [dispatch, artistId, albumsPage]);

  useEffect(() => {
    dispatch(
      fetchAllSongs({
        artistId,
        page: songsPage,
        limit: 10,
      })
    ).then((res) => {
      if (res.payload?.songs) {
        setArtistSongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }, [dispatch, artistId, songsPage]);

  useEffect(() => {
    if (artistAlbums.length > 0) {
      setDisplayedAlbums(artistAlbums);
    }
  }, [artistAlbums]);

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  const handleScroll = (ref) => {
    if (ref?.current) {
      ref.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const songsLastRef = useCallback(
    (node) => {
      if (status === "loading") return;
      if (songsObserverRef.current) songsObserverRef.current.disconnect();
      songsObserverRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && songsPage < totalPages) {
          setSongsPage((prev) => prev + 1);
        }
      });
      if (node) songsObserverRef.current.observe(node);
    },
    [status, songsPage, totalPages]
  );

  const albumsLastRef = useCallback(
    (node) => {
      if (status === "loading") return;
      if (albumsObserverRef.current) albumsObserverRef.current.disconnect();
      albumsObserverRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setAlbumsPage((prev) => prev + 1);
        }
      });
      if (node) albumsObserverRef.current.observe(node);
    },
    [status]
  );

  const songListView = artistSongs.slice(0, 5);

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        {/* Hero Section */}
        <div className="relative h-80 w-full">
          {artist ? (
            <>
              <img
                src="https://images.unsplash.com/photo-1517230878791-4d28214057c2?q=80&w=2069&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-80"
                alt="Artist Background"
              />
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
              <div className="absolute bottom-8 left-8 z-30 flex items-center gap-6 text-white">
                <img
                  src={
                    artist?.image ||
                    "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=400&auto=format&fit=crop"
                  }
                  alt="Artist Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]"
                />
                <div>
                  <p className="text-sm lowercase tracking-widest text-gray-200">
                    Artist
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-1">
                    {artist?.name || "Unknown Artist"}
                  </h1>
                  <div className="flex items-center mt-1 text-gray-300 text-sm">
                    <FiMapPin className="mr-2 text-blue-600" />
                    <span>{artist?.location || "Unknown City"}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Skeleton width={200} height={40} />
            </div>
          )}
        </div>

        {/* All Songs (vertical list) */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white">
          <h2>All Songs</h2>
          <a href="#" className="text-blue-500 cursor-pointer">
            See all
          </a>
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          {status === "loading" && artistSongs.length === 0
            ? [...Array(5)].map((_, idx) => (
                <div
                  key={`song-skeleton-${idx}`}
                  className="flex items-center gap-4"
                >
                  <Skeleton circle width={50} height={50} />
                  <div className="flex-1">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={12} />
                  </div>
                  <Skeleton width={40} height={16} />
                </div>
              ))
            : songListView.map((song, idx) => (
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

        {/* Albums Carousel */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
          <h2>Albums</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800"
            onClick={() => handleScroll(recentScrollRef)}
          />
        </div>
        <div
          ref={recentScrollRef}
          className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
        >
          {status === "loading" && displayedAlbums.length === 0 ? (
            [...Array(5)].map((_, idx) => (
              <div key={`album-skeleton-${idx}`} className="min-w-[160px]">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={120} height={16} className="mt-2" />
              </div>
            ))
          ) : displayedAlbums.length > 0 ? (
            displayedAlbums.map((album, idx) => (
              <div
                key={album._id}
                onClick={() => navigate(`/album/${album._id}`)}
                className="cursor-pointer"
              >
                <RecentPlays
                  ref={
                    idx === displayedAlbums.length - 1 ? albumsLastRef : null
                  }
                  title={album.title}
                  singer={artist?.name}
                  image={album.cover || "/images/placeholder.png"}
                  price={album.price}
                  isSelected={false}
                />
              </div>
            ))
          ) : (
            <p className="text-white text-sm">No albums found.</p>
          )}
        </div>

        {/* Singles Carousel */}
        <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
          <h2>Singles</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800"
            onClick={() => handleScroll(singlesScrollRef)}
          />
        </div>
        <div
          ref={singlesScrollRef}
          className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
        >
          {status === "loading" && artistSongs.length === 0
            ? [...Array(5)].map((_, idx) => (
                <div key={`single-skeleton-${idx}`} className="min-w-[160px]">
                  <Skeleton height={160} width={160} className="rounded-xl" />
                  <Skeleton width={120} height={16} className="mt-2" />
                </div>
              ))
            : artistSongs.map((song, idx) => (
                <RecentPlays
                  ref={idx === artistSongs.length - 1 ? songsLastRef : null}
                  key={song._id}
                  title={song.title}
                  singer={song.singer}
                  image={song.coverImage || "/images/placeholder.png"}
                  onPlay={() => handlePlaySong(song._id)}
                  isSelected={selectedSong === song._id}
                />
              ))}
        </div>

        {/* About Section */}
        <div className="mt-12 flex flex-col md:flex-row gap-6 px-6 pb-12 text-white">
          {artist ? (
            <>
              <div className="w-full h-72 md:w-1/4">
                <img
                  src={
                    artist?.image ||
                    "https://images.unsplash.com/photo-1517230878791-4d28214057c2?q=80&w=2069&auto=format&fit=crop"
                  }
                  alt="Artist"
                  className="w-full h-full object-cover border-t-4 border-b-4 border-blue-600"
                />
              </div>
              <div className="w-full md:w-2/3 bg-white/5 backdrop-blur-sm p-6 rounded-md shadow-lg border border-white/10">
                <div className="mb-2 flex items-center gap-2 text-blue-400 text-xl font-bold">
                  <span className="text-blue-500 text-2xl lowercase">
                    about
                  </span>
                  <span className="text-white capitalize">
                    {artist?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300 mb-4">
                  <FiMapPin className="text-blue-500" />
                  <span>
                    {artist?.location || "Unknown Location"} •{" "}
                    {artist?.birthYear || "N/A"}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {artist?.bio ||
                    "This artist has not provided a biography yet."}{" "}
                  <span className="text-blue-400 cursor-pointer hover:underline">
                    View more
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4">
                <Skeleton height={288} className="rounded-md" />
              </div>
              <div className="w-full md:w-2/3">
                <Skeleton height={288} className="rounded-md" />
              </div>
            </div>
          )}
        </div>
      </SkeletonTheme>
    </UserLayout>
  );
};

export default Artist;
