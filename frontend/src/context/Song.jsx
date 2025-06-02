import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [songLoading, setSongLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [song, setSong] = useState([]);
  const currentIndex = songs.findIndex((s) => s._id === selectedSong);

  async function fetchSong() {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/song/all");
      setSongs(data);
      if (data.length > 0) {
        setSelectedSong(data[0]._id);
      }
      setIsPlaying(false);
    } catch (error) {
      console.error("Error fetching songs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOneSong() {
    if (!selectedSong) return;

    try {
      setSongLoading(true);
      const { data } = await axios.get(`/api/song/single/${selectedSong}`);
      setSong(data);
    } catch (error) {
      console.error("Error fetching song details");
    } finally {
      setSongLoading(false);
    }
  }

  function nextMusic() {
    if (songs.length === 0) return;

    const nextIndex = (currentIndex + 1) % songs.length;
    setSelectedSong(songs[nextIndex]._id);
  }

  function prevMusic() {
    if (songs.length === 0) return;

    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setSelectedSong(songs[prevIndex]._id);
  }

  useEffect(() => {
    fetchSong();
  }, []);

  useEffect(() => {
    fetchOneSong();
  }, [selectedSong]);

  return (
    <SongContext.Provider
      value={{
        songs,
        song,
        loading,
        songLoading,
        fetchSong,
        fetchOneSong,
        setIsPlaying,
        nextMusic,
        prevMusic,
        setSelectedSong: (id) => {
          if (typeof id === "string") {
            setSelectedSong(id);
          }
        },
        selectedSong,
        isPlaying,
        currentIndex,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

export const SongData = () => useContext(SongContext);
