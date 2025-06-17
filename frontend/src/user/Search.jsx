import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import {
  fetchUnifiedSearchResults,
  clearSearchResults,
} from "../features/search/searchSlice";
import { fetchAllSongs } from "../features/songs/songSlice";
import { setSelectedSong, play } from "../features/playback/playerSlice";

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { results, loading, error } = useSelector((state) => state.search);
  const trendingSongs = useSelector((state) => state.songs.songs);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  

  useEffect(() => {
    dispatch(fetchAllSongs());
  }, [dispatch]);

  const handleSearch = () => {
    if (query.trim() !== "") {
      dispatch(fetchUnifiedSearchResults(query));
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  // Utility: Pick N random items from an array
  const getRandomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <UserLayout>
      <UserHeader />
      <h1 className="text-xl text-center leading-none text-white">
        Search by artist, album, or song
      </h1>

      {/* Search Bar */}
      <div className="w-full flex flex-col items-center px-8 sticky top-2 z-10 pt-4">
        <div className="flex items-center w-full max-w-3xl mx-auto p-[2px] rounded-2xl searchbar-container shadow-inner shadow-[#7B7B7B47] bg-gray-700">
          <div className="flex items-center flex-grow rounded-l-2xl bg-gray-700">
            <FiSearch className="text-white mx-3" size={20} />
            <input
              type="text"
              placeholder="Type here..."
              className="w-full bg-transparent text-white placeholder-gray-400 py-2 pr-4 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <button
            className="bg-gradient-to-r from-[#1b233dfe] via-[#0942a4e1] via-40% to-[#0C63FF] text-white font-semibold py-2 px-6 rounded-r-2xl border-[1px] searchbar-button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className="flex flex-col items-start mt-10 px-6">
        {loading && <p className="text-white mt-4">Loading...</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}

        {!query.trim() ? (
          <>
            {/* 🔀 Random Songs Section */}
            <h2 className="text-white text-lg mt-6 mb-2">Discover New Songs</h2>
            <div className="flex flex-wrap gap-6">
              {getRandomItems(trendingSongs, 10).map((song) => (
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
        ) : (
          <>
            {/* Songs Section */}
            {results?.songs?.results?.length > 0 && (
              <>
                <h2 className="text-blue-500 font-bold text-lg mt-6 mb-2">Songs</h2>
                <div className="flex flex-wrap gap-6">
                  {results.songs.results.map((song) => (
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

            {/* Artists Section */}
            {results?.artists?.results?.length > 0 && (
              <>
                <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Artists</h2>
                <div className="flex flex-wrap gap-6">
                  {results.artists.results.map((artist) => (
                    <RecentPlays
                      key={artist._id}
                      title={artist.name}
                      singer="Artist"
                      image={artist.image || "/images/placeholder.png"}
                      onPlay={() => navigate(`/artist/${artist._id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Albums Section */}
            {results?.albums?.results?.length > 0 && (
              <>
                <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Albums</h2>
                <div className="flex flex-wrap gap-6">
                  {results.albums.results.map((album) => (
                    <RecentPlays
                      key={album._id}
                      title={album.title}
                      singer={album.artist?.name || "Album"}
                      image={album.coverImage || "/images/placeholder.png"}
                      onPlay={() => navigate(`/album/${album._id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* No results */}
            {!results?.songs?.results?.length &&
              !results?.artists?.results?.length &&
              !results?.albums?.results?.length && (
                <p className="text-white/70 mt-8">No results found.</p>
              )}
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Search;
