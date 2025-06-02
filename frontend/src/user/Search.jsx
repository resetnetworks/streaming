import React from "react";
import { FiSearch } from "react-icons/fi";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import RecentPlays from "../components/RecentPlays";
import { SongData } from "../context/Song";

const Search = () => {
  const { songs } = SongData();
  return (
    <UserLayout>
      <UserHeader />
      <h1 className="text-xl text-center leading-none">
        search by artist and album
      </h1>
      <div className="w-full flex flex-col items-center px-8">
        <div className="flex items-center w-full max-w-3xl mx-auto mt-8 p-[2px] rounded-2xl searchbar-container shadow-inner shadow-[#7B7B7B47] bg-gray-700">
          <div className="flex items-center flex-grow rounded-l-2xl bg-gray-700">
            <FiSearch className="text-white mx-3" size={20} />
            <input
              type="text"
              placeholder="Type here..."
              className="w-full bg-transparent text-white placeholder-gray-400 py-2 pr-4 outline-none"
            />
          </div>

          <button className="bg-gradient-to-r from-[#1b233dfe] via-[#0942a4e1] via-40% to-[#0C63FF] text-white font-semibold py-2 px-6 rounded-r-2xl border-[1px] searchbar-button">
            Search
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap mt-10 mr-4 justify-center">
        {songs.map((song) => (
          <RecentPlays
            key={song._id}
            title={song.title}
            singer={song.singer}
            image={song.thumbnail.url}
          />
        ))}
      </div>
    </UserLayout>
  );
};

export default Search;
