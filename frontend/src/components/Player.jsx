import React, { useState, useRef, useEffect } from "react";
import ReactHowler from "react-howler";
import { LuDna } from "react-icons/lu";
import { CiHeart } from "react-icons/ci";
import {
  RiSkipLeftFill,
  RiSkipRightFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
} from "react-icons/ri";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosMore } from "react-icons/io";
import { FaPlay, FaPause } from "react-icons/fa";
import { SongData } from "../context/Song";

// Helper to format time like 2:45
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const Player = () => {
  const {
    songs,
    song,
    selectedSong,
    isPlaying,
    setIsPlaying,
    nextMusic,
    prevMusic,
    setSelectedSong,
    fetchOneSong,
  } = SongData();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [open, setOpen] = useState(true);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);

  const playerRef = useRef(null);

  const trackStyle = {
    background: `linear-gradient(to right, #007aff ${
      volume * 100
    }%, #ffffff22 ${volume * 100}%)`,
  };

  // Find current song based on selectedSong ID
  const currentSong = songs.find((s) => s._id === selectedSong) || songs[0];

  // Get next 4 songs (including current song if needed)
  const nextSongs = songs.slice(currentIndex, currentIndex + 4);

  // Find current index
  useEffect(() => {
    if (selectedSong && songs.length > 0) {
      const index = songs.findIndex((s) => s._id === selectedSong);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedSong, songs]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Toggle mute function
  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    nextMusic();
    setIsPlaying(true);
  };

  const handlePrev = () => {
    prevMusic();
    setIsPlaying(true);
  };

  const handleSongEnd = () => {
    handleNext();
  };

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value) / 100);
  };

  const handleLoad = () => {
    const sound = playerRef.current?.howler;
    if (sound) {
      setDuration(sound.duration());
    }
  };

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const sound = playerRef.current?.howler;
        if (sound) {
          setSeek(sound.seek());
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Fetch song details when selectedSong changes
  useEffect(() => {
    if (selectedSong) {
      fetchOneSong();
    }
  }, [selectedSong]);

  if (!currentSong) {
    return <div>Loading...</div>;
  }

  return (
    <div className="player-wrapper shadow-[-10px_-10px_80px_rgba(0,153,255,0.4)] shadow-[#0e52ff3b]">
      <ReactHowler
        src={currentSong?.audio?.url}
        playing={isPlaying}
        volume={volume}
        ref={playerRef}
        onEnd={handleSongEnd}
        onLoad={handleLoad}
      />

      <div className="player-card w-[15.25rem] py-4 px-4 flex flex-col items-center">
        <div className="w-full aspect-square overflow-hidden rounded-md">
          <img
            src={currentSong?.thumbnail?.url}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <p className="text-lg mt-2">{currentSong?.title}</p>
        <span className="text-sm text-gray-500">{currentSong?.singer}</span>

        {/* Track Progress */}
        <div className="w-full mt-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={seek}
            onChange={(e) => {
              const newSeek = parseFloat(e.target.value);
              setSeek(newSeek);
              const sound = playerRef.current?.howler;
              if (sound) {
                sound.seek(newSeek);
              }
            }}
            className="track-progress w-full h-1 appearance-none rounded"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1 px-[2px]">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex justify-between mt-4">
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button flex justify-center items-center gap-2">
              <LuDna className="text-blue-500 text-sm" /> lossless
            </button>
          </div>
          <div className="button-wrapper shadow-md shadow-gray-800">
            <button className="player-button">reset master</button>
          </div>
        </div>

        {/* Player Controls */}
        <div className="w-full mt-4 flex justify-between items-center">
          <CiHeart className="text-xl text-gray-400" />
          <RiSkipLeftFill
            className="text-md text-white cursor-pointer"
            onClick={handlePrev}
          />
          <div className="play-pause-wrapper shadow-xl shadow-blue-800 flex justify-center items-center">
            <button
              className="play-pause-button flex justify-center items-center gap-2"
              onClick={handleTogglePlay}
            >
              {isPlaying ? (
                <FaPause className="text-sm" />
              ) : (
                <FaPlay className="text-sm" />
              )}
            </button>
          </div>
          <RiSkipRightFill
            className="text-md text-white cursor-pointer"
            onClick={handleNext}
          />
          <IoIosMore className="text-md text-white" />
        </div>

        <div className="player-gradiant-line mt-4"></div>

        {/* Volume Control */}
        <div className="flex w-full mt-4 justify-between items-center">
          <button onClick={handleToggleMute} className="focus:outline-none">
            {isMuted ? (
              <RiVolumeMuteFill className="text-base text-gray-400" />
            ) : (
              <RiVolumeUpFill className="text-base" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="neon-range w-[90%] h-2 appearance-none rounded-full"
            style={trackStyle}
          />
        </div>
        <div className="gradiant-line mt-4"></div>

        {/* Playing Next Section */}
        <div className="w-full rounded-md p-3 mt-4 relative text-white shadow-md bg-transparent overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setOpen(!open)}
            >
              <h2 className="text-sm font-semibold tracking-wide">
                playing next
              </h2>
              {open ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {open && (
              <div className="space-y-3">
                {nextSongs.map((song) => (
                  <div
                    key={song._id}
                    className={`flex items-center justify-between text-sm cursor-pointer hover:bg-blue-800/30 rounded-md p-1 transition ${
                      song._id === selectedSong ? "bg-blue-800/40" : ""
                    }`}
                    onClick={() => {
                      setSelectedSong(song._id);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={song.thumbnail.url}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-[13px]">
                          {song.title}
                        </span>
                        <span className="text-[11px] text-gray-300">
                          {song.singer}
                        </span>
                      </div>
                    </div>
                    {/* Show actual duration (dynamic) for playlist */}
                    <span className="text-xs text-gray-200">
                      {song._id === selectedSong
                        ? formatTime(duration)
                        : "--:--"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
