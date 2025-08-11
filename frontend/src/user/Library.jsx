import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../features/songs/songSlice";
import {
  fetchUserSubscriptions,
  fetchUserPurchases,
} from "../features/payments/userPaymentSlice";
import { useNavigate } from "react-router-dom";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";
import { formatDuration } from "../utills/helperFunctions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import AlbumCard from "../components/user/AlbumCard";
import "react-loading-skeleton/dist/skeleton.css";

const Library = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [librarySongs, setLibrarySongs] = useState([]);
  const recentScrollRef = useRef(null);
  const observerRef = useRef();

  const selectedSong = useSelector((state) => state.player.selectedSong);
  const allSongsStatus = useSelector((state) => state.songs.status);
  const totalPages = useSelector((state) => state.songs.totalPages);

  const subscriptions = useSelector((state) => state.userDashboard.subscriptions);
  const purchases = useSelector((state) => state.userDashboard.purchases);
  const dashboardLoading = useSelector((state) => state.userDashboard.loading);

  useEffect(() => {
    dispatch(fetchUserSubscriptions());
    dispatch(fetchUserPurchases());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllSongs({ type: "library", page, limit: 20 })).then((res) => {
      if (res.payload?.songs) {
        setLibrarySongs((prev) => {
          const seen = new Set(prev.map((s) => s._id));
          const newSongs = res.payload.songs.filter((s) => !seen.has(s._id));
          return [...prev, ...newSongs];
        });
      }
    });
  }, [dispatch, page]);

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  const lastSongRef = useCallback(
    (node) => {
      if (allSongsStatus === "loading") return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [allSongsStatus, page, totalPages]
  );

  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < librarySongs.length; i += chunkSize) {
    songColumns.push(librarySongs.slice(i, i + chunkSize));
  }

  return (
    <>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-6">

          {/* ✅ Subscribed Artists */}
          <div>
            <h2 className="md:text-xl text-lg font-semibold mb-2">
              Subscribed Artists
            </h2>
            {dashboardLoading ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {[...Array(5)].map((_, idx) => (
                  <div key={`artist-skeleton-${idx}`}>
                    <Skeleton width={80} height={80} circle />
                    <Skeleton width={100} height={12} className="mt-2" />
                  </div>
                ))}
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {subscriptions.map((sub) => (
                  <div
                    key={sub._id}
                    onClick={() => navigate(`/artist/${sub.artist?.slug}`)}
                    className="cursor-pointer text-center"
                  >
                    <img
                      src={sub.artist.image || "/images/placeholder.png"}
                      alt={sub.artist.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md"
                    />
                    <p className="text-sm mt-2">{sub.artist.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                You're not subscribed to any artists.
              </p>
            )}
          </div>

          {/* ✅ Purchased Albums */}
          <div>
            <h2 className="md:text-xl text-lg font-semibold mb-2">
              Purchased Albums
            </h2>
            {dashboardLoading ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {[...Array(5)].map((_, idx) => (
                  <div key={`album-skel-${idx}`}>
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={100} height={12} className="mt-2" />
                  </div>
                ))}
              </div>
            ) : purchases.albums.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {purchases.albums.map((album) => (
                  <div
                    key={album._id}
                    onClick={() => navigate(`/album/${album.slug || album._id}`)}
                    className="min-w-[160px] cursor-pointer"
                  >
                    <img
                      src={album.coverUrl || "/images/placeholder.png"}
                      alt={album.title}
                      className="w-40 h-40 object-cover rounded-xl border-2 border-blue-500 shadow-md"
                    />
                    <p className="text-sm mt-2">{album.title}</p>
                    <p className="text-xs text-gray-400">
                      {album.artist?.name || "Various Artists"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No albums purchased yet.</p>
            )}
          </div>

          {/* ✅ Purchased Songs */}
          <div>
            <h2 className="md:text-xl text-lg font-semibold mt-6 mb-2">
              Purchased Songs
            </h2>
            {dashboardLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={`song-skel-${idx}`} className="flex items-center gap-4">
                    <Skeleton height={50} width={50} circle />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} />
                      <Skeleton width={80} height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchases.songs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {purchases.songs.map((song) => (
                  <SongList
                    key={song._id}
                    songId={song._id}
                    img={song.coverUrl || "/images/placeholder.png"}
                    songName={song.title}
                    singerName={song.artist?.name || "Unknown Artist"}
                    seekTime={formatDuration(song.duration || 0)}
                    onPlay={() => handlePlaySong(song)}
                    isSelected={selectedSong?._id === song._id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No songs purchased yet.</p>
            )}
          </div>
        </div>
      </SkeletonTheme>
    </>
  );
};

export default Library;
