// src/components/user/Artist/ArtistSinglesSection.jsx
import React, { useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import RecentPlays from "../RecentPlays";
import { selectSongsByArtist } from "../../../features/songs/songSelectors";
import { setSelectedSong, play } from "../../../features/playback/playerSlice";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

const getArtistColor = (name) => {
  if (!name) return "bg-blue-600";
  const colors = [
    "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-red-600",
    "bg-orange-600", "bg-yellow-600", "bg-green-600", "bg-teal-600", "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

const ArtistSinglesSection = ({ artistId, currentUser, onPurchaseClick }) => {
  const dispatch = useDispatch();
  const singlesScrollRef = useRef(null);

  const selectedSong = useSelector((state) => state.player.selectedSong);
  const artistSongsData = useSelector(
    (state) => selectSongsByArtist(state, artistId),
    shallowEqual
  );

  const {
    songs: artistSongs = [],
    pages: totalPages = 1,
    status: songsStatus = "idle",
  } = artistSongsData || {};

  const { lastElementRef: songsLastRef } = useInfiniteScroll({
    hasMore: false, // Singles don't need infinite scroll in horizontal view
    loading: songsStatus === "loading",
    onLoadMore: () => {}
  });

  const handlePlaySong = (song) => {
    dispatch(setSelectedSong(song));
    dispatch(play());
  };

  const handleScroll = (direction = "right") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    singlesScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const renderCoverImage = (imageUrl, title, size = "w-full h-40", artistName) => {
    const artistColor = getArtistColor(artistName);
    return imageUrl ? (
      <img
        src={imageUrl}
        alt={title || "Cover"}
        className={`${size} object-cover`}
      />
    ) : (
      <div
        className={`${size} ${artistColor} flex items-center justify-center text-white font-bold text-2xl`}
      >
        {title ? title.charAt(0).toUpperCase() : "C"}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Singles</h2>
        <div className="flex items-center gap-2">
          <LuSquareChevronLeft
            className="text-white cursor-pointer hover:text-blue-800 text-lg"
            onClick={() => handleScroll("left")}
          />
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800 text-lg"
            onClick={() => handleScroll("right")}
          />
        </div>
      </div>
      
      <div
        ref={singlesScrollRef}
        className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar min-h-[160px]"
      >
        {songsStatus === "loading" && artistSongs.length === 0
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
                image={
                  song.coverImage
                    ? song.coverImage
                    : renderCoverImage(null, song.title, "w-full h-40", song.artist?.name)
                }
                onPlay={() => handlePlaySong(song)}
                isSelected={selectedSong?._id === song._id}
                price={
                  currentUser?.purchasedSongs?.includes(song._id) ? (
                    "Purchased"
                  ) : song.accessType === "subscription" ? (
                    "Subs.."
                  ) : song.accessType === "purchase-only" && song.price > 0 ? (
                    <button
                      className="text-white sm:text-xs text-[10px] mt-2 sm:mt-0 px-3 py-1 rounded transition-colors bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => onPurchaseClick(song, "song")}
                    >
                      Buy ₹{song.price}
                    </button>
                  ) : song.accessType === "purchase-only" && song.price === 0 ? (
                    "album"
                  ) : (
                    "Free"
                  )
                }
              />
            ))}
      </div>
    </>
  );
};

export default ArtistSinglesSection;
