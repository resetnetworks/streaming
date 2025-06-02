import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import ReactHowler from "react-howler";
import { SongData } from "../context/Song";
import { RiVolumeUpFill, RiVolumeMuteFill } from "react-icons/ri";
import { IoIosArrowDown, IoIosInfinite, IoMdShuffle } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { RiSkipLeftFill, RiSkipRightFill } from "react-icons/ri";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const MobilePlayer = () => {
  const {
    song,
    isPlaying,
    setIsPlaying,
    nextMusic,
    prevMusic,
    selectedSong,
    setSelectedSong,
    songs,
  } = SongData();

  const currentSong = songs.find((s) => s._id === selectedSong) || songs[0];
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const playerRef = useRef(null);

  const currentIndex = songs.findIndex((s) => s._id === selectedSong);
  const nextSongs = songs.slice(currentIndex, currentIndex + 3);

  const handleLoad = () => {
    const sound = playerRef.current?.howler;
    if (sound) {
      setDuration(sound.duration());
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
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
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!song) return null;

  return (
    <>
      {currentSong?.audio?.url && (
        <ReactHowler
          src={currentSong.audio.url}
          playing={isPlaying}
          volume={0.7}
          ref={playerRef}
          onLoad={handleLoad}
          onEnd={() => {
            if (!isLooping) {
              nextMusic();
            }
          }}
          loop={isLooping}
        />
      )}
      <div
        className="md:hidden fixed cursor-pointer bottom-16
       left-0 right-0 z-40 bg-gradient-to-bl from-blue-900 
       to-black border-t border-b border-gray-800"
        onClick={() => setIsFullPlayerOpen(true)}
      >
        <div
          className="h-1 from-black to-blue-600 bg-gradient-to-br transition-all duration-300 ease-in-out"
          style={{ width: `${duration ? (seek / duration) * 100 : 0}%` }}
        ></div>

        <div className="p-3">
          <div className="flex items-center justify-between">
            {/* Song info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentSong?.thumbnail?.url}
                className="w-12 h-12 rounded-md shadow-[0_0_5px_1px_#3b82f6]"
                alt="Album cover"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {currentSong?.title}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {currentSong?.singer}
                </div>
              </div>
            </div>

            <div className="play-pause-wrapper shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
              <button
                className="play-pause-button flex justify-center items-center gap-2"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <FaPause className="text-sm" />
                ) : (
                  <FaPlay className="text-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="gradiant-line"></div>
      </div>
      <div
        className={`fixed inset-0 z-50 bg-image text-white flex flex-col items-center px-4 py-6
    transition-transform duration-500 ease-in-out transform ${
      isFullPlayerOpen ? "translate-y-0" : "translate-y-full"
    }`}
      >
        <div className="flex w-full justify-between text-base text-white">
          <button>
            <IoIosArrowDown />
          </button>
          <marquee
            className="w-[80%] text-sm"
            behavior="scroll"
            direction="left"
            scrollamount="6"
            loop="infinite"
          >
            {currentSong?.title} {currentSong?.singer}
          </marquee>

          <button onClick={() => setIsFullPlayerOpen(false)}>
            <IoIosArrowDown />
          </button>
        </div>

        <img
          src={currentSong?.thumbnail?.url}
          className="w-64 h-64 object-contain rounded-lg shadow-lg mt-6 mb-8"
          alt="Album cover"
        />
        <div className="w-full flex justify-between items-center">
          <marquee
            className="w-[90%] text-lg font-bold"
            behavior="scroll"
            direction="left"
            scrollamount="6"
            loop="infinite"
          >
            {currentSong?.title} {currentSong?.singer}
          </marquee>
          <CiHeart className="text-xl cursor-pointer" />
        </div>

        <div className="w-full mt-4">
          <div className="gradiant-line mb-2"></div>
          <div className="w-full py-3 group">
            <div className="relative h-1.5">
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden"></div>
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-900 rounded-full"
                style={{ width: `${(seek / duration) * 100}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max={duration}
                value={seek}
                onChange={(e) => {
                  const newSeek = parseFloat(e.target.value);
                  setSeek(newSeek);
                  const sound = playerRef.current?.howler;
                  if (sound) sound.seek(newSeek);
                }}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-1/2 left-0 w-3 h-3 -mt-1.5 bg-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform"
                style={{ left: `${(seek / duration) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
              <span>{formatTime(seek)}</span>
              <span>-{formatTime(duration - seek)}</span>
            </div>
            <div className="gradiant-line mt-2"></div>
          </div>
        </div>

        <div className="w-full mt-4 flex justify-between items-center">
          <IoMdShuffle className="text-3xl text-white cursor-pointer" />
          <RiSkipLeftFill
            className="text-3xl text-white cursor-pointer"
            onClick={prevMusic}
          />
          <div className="play-pause-wrapper-mobile shadow-[0_0_5px_1px_#3b82f6] flex justify-center items-center">
            <button
              className="play-pause-button-mobile flex justify-center items-center gap-2"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <FaPause className="text-lg" />
              ) : (
                <FaPlay className="text-lg" />
              )}
            </button>
          </div>
          <RiSkipRightFill
            className="text-3xl text-white cursor-pointer"
            onClick={nextMusic}
          />
          <IoIosInfinite
            className={`text-3xl cursor-pointer ${
              isLooping ? "text-blue-500" : "text-gray-400"
            }`}
            onClick={() => {
              setIsLooping(!isLooping);
              const sound = playerRef.current?.howler;
              if (sound) {
                sound.loop(isLooping);
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default MobilePlayer;
