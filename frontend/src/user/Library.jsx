import React, { useRef } from "react";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import AlbumCard from "../components/AlbumCard";
import { SongData } from "../context/Song";
import SongList from "../components/SongList";
import { LuSquareChevronRight } from "react-icons/lu";
import LibraryTabs from "../components/LibraryTabs";

const Library = () => {
  const { songs, setSelectedSong, selectedSong, setIsPlaying } = SongData();

  const recentScrollRef = useRef(null);

  const handleScroll = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handlePlaySong = (songId) => {
    setSelectedSong(songId);
    setIsPlaying(true);
  };

  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < songs.length; i += chunkSize) {
    songColumns.push(songs.slice(i, i + chunkSize));
  }

  return (
    <UserLayout>
      <UserHeader />
      <div className="text-white px-4 py-2 flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <h2 className="md:text-xl text-lg font-semibold">recent activity</h2>
          <LuSquareChevronRight
            className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
            onClick={() => handleScroll(recentScrollRef)}
          />
        </div>
        <div
          ref={recentScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar"
        >
          {songs.map((song) => (
            <RecentPlays
              key={song._id}
              title={song.title}
              singer={song.singer}
              image={song.thumbnail.url}
              onPlay={() => handlePlaySong(song._id)}
              isSelected={selectedSong === song._id}
            />
          ))}
        </div>
      </div>

      <LibraryTabs />
    </UserLayout>
  );
};

export default Library;
