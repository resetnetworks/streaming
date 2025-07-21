import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import RecentPlays from "../components/user/RecentPlays";
import AlbumCard from "../components/user/AlbumCard";
import OneTimePaymentModal from "../components/payments/OneTimePaymentModal";
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
  
  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [purchaseType, setPurchaseType] = useState(null);

  const { results, loading, error } = useSelector((state) => state.search);
  const trendingSongs = useSelector((state) => state.songs.songs);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const currentUser = useSelector((state) => state.auth.user);

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

  const handlePurchaseClick = (item, type) => {
    setPurchaseItem(item);
    setPurchaseType(type);
    setShowPurchaseModal(true);
  };

  const getRandomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Function to get price component for songs
  const getSongPriceComponent = (song) => {
    if (song.price === 0) {
      return "album";
    } else if (song.accessType === "purchase-only") {
      if (currentUser?.purchasedSongs?.includes(song._id)) {
        return "Purchased";
      } else {
        return (
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white sm:text-xs text-[10px] sm:px-2 px-1 sm:mt-0 py-1 rounded"
            onClick={() => handlePurchaseClick(song, "song")}
          >
             ₹{song.price}
          </button>
        );
      }
    } else {
      return "Subs..";
    }
  };

  // Function to get price component for albums
  const getAlbumPriceComponent = (album) => {
    if (album.price === 0) {
      return "subs..";
    } else if (currentUser?.purchasedAlbums?.includes(album._id)) {
      return "Purchased";
    } else {
      return (
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white sm:text-xs text-[10px] sm:px-2 px-1 sm:mt-0 py-1 rounded"
          onClick={() => handlePurchaseClick(album, "album")}
        >
           ₹{album.price}
        </button>
      );
    }
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
            <h2 className="text-white text-lg mt-6 mb-2">
              Discover New Songs, Artists And Albums
            </h2>
            <div className="flex flex-wrap gap-6">
              {getRandomItems(trendingSongs, 10).map((song) => (
                <RecentPlays
                  key={song._id}
                  title={song.title}
                  price={getSongPriceComponent(song)}
                  singer={song.artist?.name || "Unknown Artist"}
                  image={song.coverImage || "/images/placeholder.png"}
                  onPlay={() => handlePlaySong(song)}
                  isSelected={selectedSong?._id === song._id}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Songs */}
            {results?.songs?.length > 0 && (
              <>
                <h2 className="text-blue-500 font-bold text-lg mt-6 mb-2">Songs</h2>
                <div className="flex flex-wrap gap-6">
                  {results.songs.map((song) => (
                    <RecentPlays
                      key={song._id}
                      title={song.title}
                      price={getSongPriceComponent(song)}
                      singer={song.artist?.name || "Unknown"}
                      image={song.coverImage || "/images/placeholder.png"}
                      onPlay={() => handlePlaySong(song)}
                      isSelected={selectedSong?._id === song._id}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Artists */}
            {results?.artists?.length > 0 && (
              <>
                <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Artists</h2>
                <div className="flex flex-wrap gap-6">
                  {results.artists.map((artist) => (
                    <RecentPlays
                      key={artist._id}
                      title={artist.name}
                      price="Artist"
                      singer="Artist"
                      image={artist.image || "/images/placeholder.png"}
                      onPlay={() => navigate(`/artist/${artist.slug}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Albums */}
            {results?.albums?.length > 0 && (
              <>
                <h2 className="text-blue-500 font-bold text-lg mt-8 mb-2">Albums</h2>
                <div className="flex flex-wrap gap-6">
                  {results.albums.map((album) => (
                    <div key={album._id}>
                      <AlbumCard
                        tag={`#${album.title || "music"}`}
                        artists={album.artist?.name || "Various Artists"}
                        image={album.coverImage || "/images/placeholder.png"}
                        price={getAlbumPriceComponent(album)}
                        onClick={() => navigate(`/album/${album.slug}`)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* No results */}
            {results?.songs?.length === 0 &&
              results?.artists?.length === 0 &&
              results?.albums?.length === 0 && (
                <p className="text-white/70 mt-8">No results found.</p>
              )}
          </>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && purchaseItem && (
        <OneTimePaymentModal
          itemType={purchaseType}
          itemId={purchaseItem._id}
          amount={purchaseItem.price}
          onClose={() => {
            setShowPurchaseModal(false);
            setPurchaseItem(null);
            setPurchaseType(null);
          }}
        />
      )}
    </UserLayout>
  );
};

export default Search;