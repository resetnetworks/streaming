import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserHeader from "../../components/user/UserHeader";
import RecentPlays from "../../components/user/RecentPlays";
import AlbumCard from "../../components/user/AlbumCard";
import {
  fetchUnifiedSearchResults,
  clearSearchResults,
} from "../../features/search/searchSlice";
import { usePlaybackControl } from "../../hooks/usePlaybackControl";
import { play, pause, setSelectedSong } from "../../features/playback/playerSlice";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 400);

  const { results, loading, error } = useSelector((state) => state.search);
  const currentUser = useSelector((state) => state.auth.user); // may still be useful for UI
  const currentSong = useSelector((state) => state.player?.currentSong);

  const { isSongPlaying, isSongSelected, pausePlayback, resumePlayback } =
    usePlaybackControl();

  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery && urlQuery !== query) setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery.trim() !== "") {
      setSearchParams({ q: debouncedQuery }, { replace: true });
      dispatch(fetchUnifiedSearchResults(debouncedQuery));
    } else {
      setSearchParams({}, { replace: true });
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, setSearchParams, dispatch]);

  const handleSearch = useCallback(() => {
    if (query.trim() !== "") {
      setSearchParams({ q: query });
      dispatch(fetchUnifiedSearchResults(query));
    } else {
      setSearchParams({});
      dispatch(clearSearchResults());
    }
  }, [query, setSearchParams, dispatch]);

  const handleInputChange = (e) => setQuery(e.target.value);

  const handlePlaySong = (song) => {
    if (!song) return;
    if (isSongSelected(song._id)) {
      isSongPlaying(song._id) ? pausePlayback() : resumePlayback();
    } else {
      dispatch(setSelectedSong(song));
      dispatch(play());
    }
  };

  const getPageTitle = () =>
    query.trim()
      ? `Search "${query}" | Reset Music - Find Your Music`
      : "Search Music | Reset Music - Find Songs, Artists & Albums";

  const getPageDescription = () =>
    query.trim()
      ? `Search results for "${query}" on Reset Music. Find electronic, ambient, and experimental music from top artists worldwide.`
      : "Search and discover electronic, ambient, and experimental music on Reset Music. Find your favorite songs, artists, and albums from our curated collection.";

  return (
    <>
      <UserHeader />
      <h1 className="text-xl text-center leading-none text-white">
        Search by artist, album, or song
      </h1>

      <div className="min-h-screen">
        {/* Search Bar with clear icon */}
        <div className="w-full flex flex-col items-center px-8 sticky top-2 z-10 pt-4">
          <div className="w-full max-w-3xl mx-auto p-[2px] rounded-2xl searchbar-container shadow-inner shadow-[#7B7B7B47] bg-gray-700">
            <div className="flex items-center rounded-2xl bg-gray-700 relative">
              <FiSearch className="text-white mx-3" size={20} />
              <input
                type="text"
                placeholder="Search here..."
                className="w-full bg-transparent text-white placeholder-gray-400 py-2 pr-12 outline-none"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              {query.length > 0 && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <FiX size={22} />
                </button>
              )}
            </div>
          </div>

          {query && query !== debouncedQuery && (
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
              Searching...
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex flex-col items-start mt-10 px-6">
          {loading && <p className="text-white mt-4">Loading...</p>}
          {error && <p className="text-red-400 mt-4">{error}</p>}

          {!query.trim() ? (
            <div className="w-full text-center py-20">
              <div className="text-gray-400 space-y-2">
                <FiSearch className="mx-auto text-4xl mb-4 text-gray-500" />
                <p className="text-lg">Start typing to search</p>
                <p className="text-sm text-gray-500">Find your favorite songs, artists, and albums</p>
              </div>
            </div>
          ) : (
            <>
              {results?.songs?.length > 0 && (
                <>
                  <h2 className="text-blue-500 font-bold text-lg mt-6 mb-2">Songs</h2>
                  <div className="flex flex-wrap gap-6">
                    {results.songs.map((song) => (
                      <RecentPlays
                        key={song._id}
                        songId={song._id}
                        isSelected={currentSong?._id === song._id}
                        onTitleClick={() => navigate(`/song/${song.slug}`)}
                        title={song.title}
                        image={song.coverImage || "/images/placeholder.png"}
                        onPlay={() => handlePlaySong(song)}
                      />
                    ))}
                  </div>
                </>
              )}

              {results?.artists?.length > 0 && (
                <>
                  <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Artists</h2>
                  <div className="flex flex-wrap gap-6">
                    {results.artists.map((artist) => (
                      <RecentPlays
                        key={artist._id}
                        onTitleClick={() => navigate(`/artist/${artist.slug}`)}
                        title={artist.name}
                        price="Artist"
                        image={artist.profileImage || "/images/placeholder.png"}
                        onPlay={() => navigate(`/artist/${artist.slug}`)}
                        showControls={false}
                      />
                    ))}
                  </div>
                </>
              )}

              {results?.albums?.length > 0 && (
                <>
                  <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Albums</h2>
                  <div className="flex flex-wrap gap-6">
                    {results.albums.map((album) => (
                      <div key={album._id}>
                        <AlbumCard
                          tag={`${album.title || "music"}`}
                          artists={album.artist?.name || "Various Artists"}
                          image={album.coverImage || "/images/placeholder.png"}
                          onClick={() => navigate(`/album/${album.slug}`)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {results?.songs?.length === 0 &&
                results?.artists?.length === 0 &&
                results?.albums?.length === 0 &&
                debouncedQuery.trim() !== "" && (
                  <div className="w-full text-center py-20">
                    <div className="text-gray-400 space-y-2">
                      <FiSearch className="mx-auto text-4xl mb-4 text-gray-500" />
                      <p className="text-lg">No results found for "{debouncedQuery}"</p>
                      <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;