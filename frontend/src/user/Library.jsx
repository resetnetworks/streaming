import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSongs } from "../features/songs/songSlice";
import { useNavigate } from "react-router-dom";
import { setSelectedSong, play } from "../features/playback/playerSlice";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import SongList from "../components/SongList";
import { LuSquareChevronRight } from "react-icons/lu";
import LibraryTabs from "../components/LibraryTabs";
import { formatDuration } from "../utills/helperFunctions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Library = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allSongs = useSelector((state) => state.songs.allSongs);
  const status = useSelector((state) => state.songs.status);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  const totalPages = useSelector((state) => state.songs.totalPages);

  const [page, setPage] = useState(1);
  const [librarySongs, setLibrarySongs] = useState([]);

  const recentScrollRef = useRef(null);
  const observerRef = useRef();

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

  const handleScroll = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handlePlaySong = (songId) => {
    dispatch(setSelectedSong(songId));
    dispatch(play());
  };

  const lastSongRef = useCallback(
    (node) => {
      if (status === "loading") return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [status, page, totalPages]
  );

  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < librarySongs.length; i += chunkSize) {
    songColumns.push(librarySongs.slice(i, i + chunkSize));
  }

  return (
    <UserLayout>
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">
          {/* Recent Activity */}
          <div className="w-full flex justify-between items-center">
            <h2 className="md:text-xl text-lg font-semibold">recent activity</h2>
            <LuSquareChevronRight
              className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
              onClick={() => handleScroll(recentScrollRef)}
            />
          </div>
          <div
            ref={recentScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[160px]"
          >
            {status === "loading" && librarySongs.length === 0 ? (
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
              librarySongs.map((song, idx) => (
                <RecentPlays
                  ref={idx === librarySongs.length - 1 ? lastSongRef : null}
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

          {/* Library Content */}
          <LibraryTabs songs={librarySongs} onPlaySong={handlePlaySong} />

          {/* Song List View */}
          <div className="w-full overflow-x-auto no-scrollbar min-h-[280px]">
            <div className="flex md:gap-8 gap-32">
              {status === "loading" && librarySongs.length === 0 ? (
                [...Array(5)].map((_, idx) => (
                  <div
                    key={`library-skeleton-${idx}`}
                    className="flex flex-col gap-4 min-w-[400px]"
                  >
                    {[...Array(5)].map((__, i) => (
                      <div
                        key={`library-item-${i}`}
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

export default Library;