import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const recentScrollRef = useRef(null);
  const singlesScrollRef = useRef(null);

  const songs = useSelector((state) => state.songs.songs || []);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artist = useSelector(selectSelectedArtist);
  const artistAlbums = useSelector(selectArtistAlbums);

  useEffect(() => {
    if (artistId) {
      dispatch(fetchArtistById(artistId));
      dispatch(getAlbumsByArtist(artistId));
    }
    dispatch(fetchAllSongs());
  }, [dispatch, artistId]);

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  const artistSongs = songs.filter(
    (song) => song.artist === artistId || song.artist?._id === artistId
  );

  const handleScroll = (ref) => {
    if (ref?.current) {
      ref.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const songListView = artistSongs.slice(0, 5); // Vertical list

  return (
    <UserLayout>
      <UserHeader />

      {/* Hero Section */}
      <div className="relative h-80 w-full">
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
      </div>

      {/* All Songs (vertical) */}
      <div className="flex justify-between mt-6 px-6 text-lg text-white">
        <h2>All Songs</h2>
        <a href="#" className="text-blue-500 cursor-pointer">
          See all
        </a>
      </div>
      <div className="px-6 py-4 flex flex-col gap-4">
        {songListView.map((song) => (
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

      {/* ✅ Albums Carousel */}
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Albums</h2>
        <LuSquareChevronRight
          className="text-white cursor-pointer hover:text-blue-800"
          onClick={() => handleScroll(recentScrollRef)}
        />
      </div>
      <div
        ref={recentScrollRef}
        className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar"
      >
        {artistAlbums.length > 0 ? (
          artistAlbums.map((album) => (
            <RecentPlays
              key={album._id}
              title={album.title}
              singer={artist?.name}
              image={album.cover || "/images/placeholder.png"}
              price={album.price}
              isSelected={false}
              // Removed onPlay because albums aren't directly playable
            />
          ))
        ) : (
          <p className="text-white text-sm">No albums found.</p>
        )}
      </div>

      {/* ✅ Singles Carousel */}
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Singles</h2>
        <LuSquareChevronRight
          className="text-white cursor-pointer hover:text-blue-800"
          onClick={() => handleScroll(singlesScrollRef)}
        />
      </div>
      <div
        ref={singlesScrollRef}
        className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar"
      >
        {artistSongs.map((song) => (
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

      {/* ✅ About Section */}
      <div className="mt-12 flex flex-col md:flex-row gap-6 px-6 pb-12 text-white">
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
            <span className="text-blue-500 text-2xl lowercase">about</span>
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
            {artist?.bio || "This artist has not provided a biography yet."}{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">
              View more
            </span>
          </p>
        </div>
      </div>
    </UserLayout>
  );
};

export default Artist;
