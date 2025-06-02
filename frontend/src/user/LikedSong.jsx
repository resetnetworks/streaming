import React from "react";
import { SongData } from "../context/Song";
import SongList from "../components/SongList";
import UserLayout from "../components/UserLayout";

const LikedSong = () => {
  const { songs, setSelectedSong, selectedSong, setIsPlaying } = SongData();

  const handlePlaySong = (songId) => {
    setSelectedSong(songId);
    setIsPlaying(true);
  };

  if (songs.length === 0) {
    return (
      <div className="text-white px-4 py-2">
        <h2 className="md:text-xl tex</div>t-lg font-semibold">No liked songs found</h2>
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="bg-image min-h-screen w-full bg-gradient-to-br from-[#232526] to-[#414345] py-8 px-4">
        <h2 className="md:text-3xl text-2xl font-bold text-white mb-8">Liked Songs</h2>
        <div className="flex flex-col gap-4">
          {songs.map((song, idx) => (
            <React.Fragment key={song._id}>
              <div className="flex items-center justify-between bg-white/10 rounded-xl shadow-lg p-4 hover:bg-white/20 transition relative my-2 mx-0">
                <div className="flex-grow">
                <SongList className="w-full"
                  img={song.thumbnail.url}
                  songName={song.title}
                  singerName={song.singer}
                  seekTime={<span className="text-white">3:00</span>}
                  onPlay={() => handlePlaySong(song._id)}
                  isSelected={selectedSong === song._id}
                />
                </div>
              </div>
              {/* Gradient divider, indented to the right */}
              {idx !== songs.length - 1 && (
                <div className="gradiant-line ml-20" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default LikedSong;
