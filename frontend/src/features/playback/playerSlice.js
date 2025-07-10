import { createSlice } from "@reduxjs/toolkit";

// Load initial volume from localStorage (safe fallback)
const loadInitialVolume = () => {
  try {
    const savedVolume = localStorage.getItem('player-volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  } catch (e) {
    return 0.5;
  }
};

const initialState = {
  selectedSong: null, // full song object
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: loadInitialVolume(),
  lastSelectedAt: null,
  forceRefreshToken: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setSelectedSong(state, action) {
      state.selectedSong = action.payload; // full song object
      state.currentTime = 0;
      state.duration = 0;
      state.isPlaying = true;
      state.lastSelectedAt = Date.now();
      state.forceRefreshToken = Date.now(); // used to bust cache or reload HLS
    },
    play(state) {
      state.isPlaying = true;
    },
    pause(state) {
      state.isPlaying = false;
    },
    setCurrentTime(state, action) {
      state.currentTime = action.payload;
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    setVolume(state, action) {
      state.volume = action.payload;
      try {
        localStorage.setItem("player-volume", action.payload);
      } catch (e) {
        console.warn("Failed to persist volume", e);
      }
    },
    resetPlayerState(state) {
      return {
        ...initialState,
        volume: state.volume, // keep current volume
        forceRefreshToken: Date.now(), // force reload next song
      };
    },
    forceRefresh(state) {
      state.forceRefreshToken = Date.now();
    },
  },
});

export const {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  resetPlayerState,
  forceRefresh,
} = playerSlice.actions;

export const selectPlayerState = (state) => ({
  ...state.player,
  shouldRefresh: state.player.forceRefreshToken !== null,
});

export default playerSlice.reducer;
